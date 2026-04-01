import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { idea, steps, mode, futureProjection, userId } = await req.json();

    // Resolve user: prefer passed userId, else first user in db
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const user = await prisma.user.findFirst();
      resolvedUserId = user?.id;
    }

    const task = await prisma.task.create({
      data: {
        title: idea,
        mode: mode || "QUICK",
        futureProjection: futureProjection,
        userId: resolvedUserId,
        subTasks: {
          create: (steps || []).map((step: string) => ({
            title: step,
            userId: resolvedUserId,
            mode: mode || "QUICK",
          })),
        },
      },
      include: { subTasks: true },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Task Create Error:", error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
