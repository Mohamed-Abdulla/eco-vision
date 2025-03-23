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
    //if role is admin, update user role to admin
    if (role === "admin") {
      await db.update(Users).set({ role: "admin" }).where(eq(Users.clerkId, userId)).execute();
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

//  handle user false report count
export async function handleUserFalseReportCount(userId: string) {
  try {
    const user = await db.select().from(Users).where(eq(Users.clerkId, userId)).execute();
    if (user && user[0]) {
      const falseReportCount = user[0].falseReportCount + 1;
      // if false report count is 3, ban user from reporting for 1 day
      if (falseReportCount === 3) {
        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + 1);
        await db
          .update(Users)
          .set({ falseReportCount, reportingBanUntil: banUntil })
          .where(eq(Users.clerkId, userId))
          .execute();
      } else {
        await db.update(Users).set({ falseReportCount }).where(eq(Users.clerkId, userId)).execute();
      }
    }
  } catch (error) {
    console.error("Error handling user false report count:", error);
  }
}
