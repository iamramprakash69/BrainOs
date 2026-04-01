import { NextResponse } from "next/server";

/**
 * WhatsApp Cloud API Webhook — Meta Business Platform
 *
 * SETUP STEPS (for future activation):
 * 1. Create a Meta Business Account at business.facebook.com
 * 2. Create a WhatsApp Business App in Meta Developer Portal
 * 3. Set Webhook URL to: https://your-domain.com/api/webhook/whatsapp
 * 4. Set WHATSAPP_VERIFY_TOKEN in your .env
 * 5. Set WHATSAPP_ACCESS_TOKEN in your .env
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Meta sends changes array
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" });
    }

    for (const change of body.entry?.[0]?.changes || []) {
      const messages = change.value?.messages || [];
      for (const msg of messages) {
        const text = msg.text?.body || msg.audio?.id || "[voice note]";
        console.log("[WhatsApp Webhook] Received:", text);

        // TODO: Call /api/breakdown with text as idea
        // TODO: Create task in DB via prisma
        // TODO: Push to dashboard via real-time
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[WhatsApp Webhook Error]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
