import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shame?userId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const where = userId ? { userId } : {};
    const entries = await prisma.wallOfShame.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}

// DELETE /api/shame  (clear a specific entry)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.wallOfShame.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
