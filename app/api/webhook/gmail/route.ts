import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * Gmail Webhook / Gmail API OAuth Route
 *
 * SETUP STEPS:
 * 1. Create project at console.cloud.google.com
 * 2. Enable Gmail API
 * 3. Create OAuth2 credentials (Web Application)
 * 4. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI to .env
 * 5. Users visit /api/webhook/gmail to authorize
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({
      status: "not_configured",
      message: "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env to activate Gmail integration.",
      docs: "https://developers.google.com/gmail/api/quickstart/nodejs",
    });
  }

  if (!code) {
    // Redirect to OAuth consent screen
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    const url = auth.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    });
    return NextResponse.redirect(url);
  }

  // Exchange code for tokens
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  const { tokens } = await auth.getToken(code);
  // TODO: Store tokens securely & use them to read Gmail
  return NextResponse.json({ status: "authorized", tokens_received: true });
}
