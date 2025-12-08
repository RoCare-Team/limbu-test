// app/api/webhook/route.js
import { writeFile, appendFile } from "fs/promises";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "messages.txt");  // ✔ Project root me file save hogi

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = "limbu123";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Invalid verify token", { status: 403 });
}

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("WEBHOOK EVENT:", JSON.stringify(body, null, 2));

    let logText = "";

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const messages = changes?.value?.messages;

      if (messages && messages.length > 0) {
        const msg = messages[0];

        const from = msg.from;
        const type = msg.type;
        const text = msg.text?.body || "";
        const timestamp = new Date().toISOString();

        logText =
          `\n[${timestamp}] FROM: ${from} | TYPE: ${type} | MESSAGE: ${text}\n`;

        // ✔ Save log to file (create if not exists)
        await appendFile(LOG_FILE, logText).catch(async () => {
          await writeFile(LOG_FILE, logText);
        });

        console.log("Saved to:", LOG_FILE);
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Invalid JSON", { status: 400 });
  }
}
