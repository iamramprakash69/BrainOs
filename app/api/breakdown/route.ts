import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // Fallback response for demo if no API key is provided
      return NextResponse.json({
        futureProjection: `If you execute this daily for 7 days, you will have built an incredible foundation. You'll move from idea to visible results, boosting your confidence immensely.`,
        steps: [
          "Define the first micro-action",
          "Setup your workspace without distractions",
          "Execute the 2-minute version",
          "Build momentum for the next step",
          "Log the completion and review"
        ],
        recommendedMode: "QUICK"
      });
    }

    const systemPrompt = `You are the core intelligence of the 'Second Brain OS - Execution Engine'.
You convert vague ideas into strict, time-bound micro-actions optimized for immediate 'Day 1' execution.
You must output ONLY raw JSON in the following format:
{
  "futureProjection": "A 2-sentence emotional projection of their success if they do this daily for 7 days.",
  "steps": ["Step 1 (very small)", "Step 2", "Step 3", "Step 4", "Step 5"],
  "recommendedMode": "QUICK" 
}
Keep steps actionable taking < 5 minutes each.`;

    const userPrompt = `Break down this idea: "${idea}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const output = completion.choices[0].message.content;
    const parsed = JSON.parse(output || "{}");

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("OpenAI Breakdown Error:", error);
    return NextResponse.json({
      futureProjection: "If you continue pushing forward, you'll inevitably hit your goals.",
      steps: ["Start immediately", "Focus for 2 minutes"],
      recommendedMode: "QUICK"
    }, { status: 200 });
  }
}
