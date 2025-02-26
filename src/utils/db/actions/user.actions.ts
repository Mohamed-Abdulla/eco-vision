"use server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { redirect } from "next/navigation";
import { db } from "../config";
import { Users } from "../schema";
import { getRewardTransactions } from "./reward.actions";

export async function createUser(email: string, name: string, userId: string) {
  try {
    const [user] = await db.insert(Users).values({ email, name, clerkId: userId }).returning().execute();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getOrCreateUser(userId: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.clerkId, userId)).execute();
    const authUser = await currentUser();
    if (!authUser) {
      return redirect("/sign-in");
    }
    const client = await clerkClient();
    const role = authUser?.privateMetadata.role;

    if (!role) {
      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          role: user?.role,
        },
      });
    }
    if (!user) {
      //create user
      const newUser = await createUser(
        authUser.emailAddresses[0].emailAddress,
        authUser.username || authUser.firstName || "",
        userId
      );
      return newUser;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by userId:", error);
    return null;
  }
}

export async function getUserBalance(userId: string): Promise<number> {
  const transactions = await getRewardTransactions(userId);
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type.startsWith("earned") ? acc + transaction.amount : acc - transaction.amount;
  }, 0);
  return Math.max(balance, 0); // Ensure balance is never negative
}
