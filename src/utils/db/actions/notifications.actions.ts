"use server";
import { and, eq } from "drizzle-orm";
import { db } from "../config";
import { Notifications } from "../schema";

export async function getUnreadNotifications(userId: string) {
  try {
    return await db
      .select()
      .from(Notifications)
      .where(and(eq(Notifications.userId, userId), eq(Notifications.isRead, false)))
      .execute();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function createNotification(userId: string, message: string, type: string) {
  try {
    const [notification] = await db.insert(Notifications).values({ userId, message, type }).returning().execute();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}
