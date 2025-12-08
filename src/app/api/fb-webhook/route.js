// app/api/webhook/route.js
import { writeFile, appendFile } from "fs/promises";
import path from "path";

// Save file in the root of your project so it is easy to find
const LOG_FILE = path.join(process.cwd(), "webhook_logs.txt");
const VERIFY_TOKEN = "limbu123";

// ----------------------------------------------------------------------
// GET: Used by Facebook/Meta to verify your webhook URL
// ----------------------------------------------------------------------
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Invalid verify token", { status: 403 });
}

// ----------------------------------------------------------------------
// POST: Receives the actual data (Leads, Messages, etc.)
// ----------------------------------------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();

    console.log("🔹 WEBHOOK EVENT RECEIVED");

    let logText = "";
    const timestamp = new Date().toISOString();

    // Check if the standard Meta 'entry' structure exists
    if (body.entry && body.entry.length > 0) {
      const entry = body.entry[0];
      const changes = entry.changes && entry.changes.length > 0 ? entry.changes[0] : null;

      // ---------------------------------------------------------
      // CASE 1: HANDLE LEAD GEN (Facebook/Insta Lead Forms)
      // ---------------------------------------------------------
      if (changes && changes.field === "leadgen") {
        const leadData = changes.value;
        const leadId = leadData.leadgen_id;
        const formId = leadData.form_id;
        const pageId = leadData.page_id;

        logText = `\n[${timestamp}] TYPE: LEAD_GEN | Lead ID: ${leadId} | Form ID: ${formId} | Page ID: ${pageId}\n`;
      } 

      // ---------------------------------------------------------
      // CASE 2: HANDLE WHATSAPP MESSAGES
      // ---------------------------------------------------------
      else if (changes && changes.field === "messages") {
         const messages = changes.value.messages;
         if (messages && messages.length > 0) {
            const msg = messages[0];
            logText = `\n[${timestamp}] FROM: ${msg.from} | TYPE: ${msg.type} | MESSAGE: ${msg.text?.body || "[Media]"}\n`;
         }
      }
      // Alternate WhatsApp structure check
      else if (body.object === "whatsapp_business_account") {
          const messages = entry.changes?.[0]?.value?.messages;
          if (messages && messages.length > 0) {
            const msg = messages[0];
            logText = `\n[${timestamp}] FROM: ${msg.from} | TYPE: ${msg.type} | MESSAGE: ${msg.text?.body || "[Media]"}\n`;
          }
      }
    }

    // ---------------------------------------------------------
    // WRITE LOG TO FILE
    // ---------------------------------------------------------
    if (logText) {
      try {
        await appendFile(LOG_FILE, logText);
      } catch (err) {
        // If file doesn't exist yet, create it
        await writeFile(LOG_FILE, logText);
      }
      console.log(`✅ Log saved to: ${LOG_FILE}`);
    } else {
      console.log("⚠️ Event received but no relevant data found to log.");
    }

    return new Response("EVENT_RECEIVED", { status: 200 });

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response("Invalid JSON", { status: 400 });
  }
}