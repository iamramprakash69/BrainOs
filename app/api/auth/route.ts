import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { action, email, password, name } = await req.json();

    if (action === "register") {
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, name: name || email.split("@")[0], password: hash },
      });
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    }

    if (action === "login") {
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "No account found with that email" }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Wrong password" }, { status: 401 });
      }
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          executionScore: user.executionScore,
          currentStreak: user.currentStreak,
          completedTasks: user.completedTasks,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
