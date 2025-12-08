// app/api/webhook/route.js
import { writeFile, appendFile } from "fs/promises";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "messages.txt");
const VERIFY_TOKEN = "limbu123";

// ---------------------------------------
// VERIFY WEBHOOK (GET)
// ---------------------------------------
export async function GET(req) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return new Response("Invalid verify token", { status: 403 });
}

// ---------------------------------------
// RECEIVE WEBHOOK EVENTS (POST)
// ---------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("WEBHOOK EVENT:", JSON.stringify(body, null, 2));

    if (body.object !== "whatsapp_business_account") {
      return new Response("IGNORED", { status: 200 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages || messages.length === 0) {
      console.log("No messages found.");
      return new Response("NO_MESSAGES", { status: 200 });
    }

    const msg = messages[0];

    const from = msg.from || "unknown";
    const type = msg.type || "unknown";
    const text = msg.text?.body || "";
    const timestamp = new Date().toISOString();

    const logText = `\n[${timestamp}] FROM: ${from} | TYPE: ${type} | MESSAGE: ${text}\n`;

    // Write to file (safe create if missing)
    try {
      await appendFile(LOG_FILE, logText);
    } catch {
      await writeFile(LOG_FILE, logText);
    }

    console.log("Saved to:", LOG_FILE);

    return new Response("EVENT_RECEIVED", { status: 200 });

  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Invalid JSON", { status: 400 });
  }
}
