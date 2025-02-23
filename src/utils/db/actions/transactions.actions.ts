"use server";

import { db } from "../config";
import { Transactions } from "../schema";

export async function createTransaction(
  userId: string,
  type: "earned_report" | "earned_collect" | "redeemed",
  amount: number,
  description: string
) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({ userId, type, amount, description })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}
