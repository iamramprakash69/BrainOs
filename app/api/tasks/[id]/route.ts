import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/[id]  – full task details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subTasks: true,
        user: { select: { name: true, email: true } },
      },
    });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
