import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
  try {
    const { title, timeSpent, streak = 0, frictionScore = "Low" } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // Fallback response for demonstration if no API key is provided
      const tone = streak > 5 ? "Professional/Challenger" : "Empathetic/Simplifier";
      return NextResponse.json({
        message: `[Simulated ${tone} Tone]\n\nYou executed "${title}" without hesitation. Maintain this momentum, and you will compound your execution speed by 3x this week.`
      });
    }

    const systemPrompt = `You are a strict, smart execution coach for the 'Kinetic Execution OS'.
Your tone must adapt: 
- If streak > 5, be a relentless 'Professional/Challenger', demanding excellence.
- If streak <= 5, be an 'Empathetic/Simplifier', encouraging and protecting from burnout.
The user just completed a task. Generate a short, punchy 2-sentence "Execution Mirror" reflecting their momentum and a future projection (e.g. "At this rate..."). Do not use quotes.`;

    const userPrompt = `Task: ${title}\nTime Spent: ${Math.floor(timeSpent / 60)} minutes\nStreak: ${streak}\nFriction: ${frictionScore}\n\nDeliver the Execution Mirror:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ message: "Excellent work executing your task. Keep building momentum." }, { status: 200 });
  }
}
