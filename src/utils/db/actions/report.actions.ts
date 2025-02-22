"use server";

import { desc } from "drizzle-orm";
import { Reports } from "../schema";
import { db } from "../config";

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db.select().from(Reports).orderBy(desc(Reports.createdAt)).limit(limit).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}
