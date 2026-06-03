import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { InterviewTask } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req, { params }) {
  const { taskId } = await params;
  const { completed } = await req.json();

  try {
    await db
      .update(InterviewTask)
      .set({ completed })
      .where(eq(InterviewTask.id, parseInt(taskId)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Task Update Error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
