"use server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../config";
import { Rewards, Transactions, Users } from "../schema";

export async function getAvailableRewards(userId: string) {
  try {
    // Get user's total points
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith("earned") ? total + transaction.amount : total - transaction.amount;
    }, 0);

    // Get available rewards from the database
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(eq(Rewards.isAvailable, true))
      .execute();

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste",
      },
      ...dbRewards,
    ];

    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function getRewardTransactions(userId: string) {
  try {
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      date: t.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));

    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

//getRewardTransactions for all users
export async function getAllRewardTransactions() {
  try {
    const transactions = await db
      .select({
        id: Transactions.id,
        userId: Transactions.userId,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .orderBy(desc(Transactions.date))
      .execute();

    const groupedTransactions = Object.values(
      transactions.reduce((acc, { userId, amount, ...rest }) => {
        if (!acc[userId]) {
          acc[userId] = { ...rest, userId, amount };
        } else {
          acc[userId].amount += amount;
        }
        return acc;
      }, {})
    );

    return groupedTransactions;
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
}

export async function getAllRewards() {
  try {
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        email: Users.email,
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points))
      .execute();
    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function updateRewardPoints(userId: string, pointsToAdd: number) {
  try {
    const updatedReward = await db
      .insert(Rewards)
      .values({
        userId,
        points: pointsToAdd,
        updatedAt: new Date(),
        name: "Default Reward",
        collectionInfo: "Default Collection Info",
      })
      .onConflictDoUpdate({
        target: Rewards.userId,
        set: {
          points: sql`${Rewards.points} + ${pointsToAdd}`,
          updatedAt: new Date(),
          level: sql`FLOOR((EXCLUDED.points + ${Rewards.points}) / 100) + 1`,
        },
      })
      .returning()
      .execute();

    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}
