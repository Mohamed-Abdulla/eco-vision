"use server";

import { and, eq, ilike, sql } from "drizzle-orm";
import { db } from "../config";
import { Reports, Users } from "../schema";
import { updateRewardPoints } from "./reward.actions";
import { createTransaction } from "./transactions.actions";
import { createNotification } from "./notifications.actions";
import { revalidatePath } from "next/cache";

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map((task) => ({
      ...task,
      date: task.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function getWasteCollectionTasksWithFilters({
  page = 1,
  limit = 20,
  query,
  status,
}: {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
}) {
  try {
    const offset = (page - 1) * limit;

    // Build filter conditions
    const filters: Array<ReturnType<typeof ilike> | ReturnType<typeof eq>> = [];
    if (query) filters.push(ilike(Reports.location, `%${query}%`)); // Case-insensitive search
    if (status) filters.push(eq(Reports.status, status)); // Exact match for status

    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .where(filters.length > 0 ? and(...filters) : undefined) // Apply filters only if present
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(Reports)
      .where(filters.length > 0 ? and(...filters) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    return {
      tasks: tasks.map((task) => ({
        ...task,
        date: task.date ? task.date.toISOString().split("T")[0] : null, // Avoids undefined errors
      })),
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return { tasks: [], totalCount: 0 }; // Ensure an object is always returned
  }
}
export async function updateTaskStatus(reportId: string, newStatus: string, collectorId?: string) {
  try {
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const [updatedReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function collectWaste(userId: string, pointsEarned: number, isPenalty: boolean = false) {
  try {
    const transactionType = isPenalty ? "penalty" : "earned_collect";
    const transactionDescription = isPenalty ? "Deducted points for false claim" : "Earned reward for waste collection";
    const notificationMessage = isPenalty
      ? `You've lost ${pointsEarned} points for a false claim.`
      : `You've earned ${pointsEarned} points for collecting waste!`;
    const notificationType = isPenalty ? "penalty" : "reward";
    const pointsToUpdate = isPenalty ? -pointsEarned : pointsEarned;

    await Promise.all([
      createTransaction(userId, transactionType, pointsEarned, transactionDescription),
      createNotification(userId, notificationMessage, notificationType),
      updateRewardPoints(userId, pointsToUpdate),
    ]);

    //also update false claim count in user table
    if (isPenalty) {
      await db
        .update(Users)
        .set({ falseReportCount: sql<number>`false_report_count + 1` })
        .where(eq(Users.id, userId))
        .execute();

      //also if user has more than 3 false claims, block the user from reporting waste by reportingBanUntil timestamp
      const user = await db.select().from(Users).where(eq(Users.id, userId)).execute();
      if (user[0].falseReportCount >= 3) {
        const banDuration = new Date();
        banDuration.setDate(banDuration.getDate() + 7); //ban user for 7 days
        await db.update(Users).set({ reportingBanUntil: banDuration }).where(eq(Users.id, userId)).execute();
      }
    }

    revalidatePath("/report");
    return true;
  } catch (error) {
    console.error("Error in collectWaste:", error);
    return null;
  }
}
