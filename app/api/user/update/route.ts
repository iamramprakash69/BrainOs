import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { taskId, action, actualSeconds, breakSeconds, notes } = await req.json();

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { user: true } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const userId = task.userId;

    if (action === "COMPLETE") {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          actualSeconds: actualSeconds ?? undefined,
          breakSeconds: breakSeconds ?? 0,
          completedAt: new Date(),
          notes: notes ?? undefined,
        },
      });
      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              executionScore: Math.min(100, user.executionScore + 12),
              completedTasks: user.completedTasks + 1,
              currentStreak: user.currentStreak + 1,
            },
          });
        }
      }
    }

    if (action === "FAIL") {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "FAILED", completedAt: new Date() },
      });
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 0 },
        });
        // Add to Wall of Shame
        await prisma.wallOfShame.create({
          data: {
            userId,
            taskTitle: task.title,
            reason: "Commitment contract broken",
          },
        });
      }
    }

    if (action === "START") {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    const updatedUser = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
