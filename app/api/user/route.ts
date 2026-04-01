import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user  — always returns a single demo user, auto-created if needed
export async function GET() {
  try {
    let user = await prisma.user.findFirst();

    if (!user) {
      // Auto-create a demo user so the app works without any login
      user = await prisma.user.create({
        data: {
          email: "demo@brain.os",
          name: "Demo User",
          password: "no-auth",
        },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: { userId: user.id, createdAt: { gte: today }, parentId: null },
      include: { subTasks: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ user, tasks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
