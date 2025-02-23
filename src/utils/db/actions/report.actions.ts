"use server";

import { reportingPoint } from "@/utils/constants";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../config";
import { Reports, Rewards } from "../schema";
import { createNotification } from "./notifications.actions";
import { createTransaction } from "./transactions.actions";
import { revalidatePath } from "next/cache";

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db.select().from(Reports).orderBy(desc(Reports.createdAt)).limit(limit).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}

export async function createReport(
  userId: string,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    // Award 10 points for reporting waste
    const pointsEarned = reportingPoint;
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(userId, "earned_report", pointsEarned, "Points earned for reporting waste");

    // Create a notification for the user
    await createNotification(userId, `You've earned ${pointsEarned} points for reporting waste!`, "reward");

    revalidatePath("/report");

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function updateRewardPoints(userId: string, pointsToAdd: number) {
  try {
    const [updatedReward] = await db
      .update(Rewards)
      .set({
        points: sql`${Rewards.points} + ${pointsToAdd}`,
        updatedAt: new Date(),
      })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();
    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}
