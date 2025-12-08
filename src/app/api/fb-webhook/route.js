// app/api/webhook/route.js
import { writeFile, appendFile } from "fs/promises";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "messages.txt");

// ---------------------------------------
// RECEIVE WEBHOOK EVENTS (POST)
// ---------------------------------------
export async function POST(req) {
  try {
    let body;

    // Try to parse JSON
    try {
      body = await req.json();
    } catch {
      // If not JSON, read raw text
      body = await req.text();
    }

    const timestamp = new Date().toISOString();

    const logText = `\n[${timestamp}] DATA: ${JSON.stringify(body, null, 2)}\n`;

    // Write to file (create if missing)
    try {
      await appendFile(LOG_FILE, logText);
    } catch {
      await writeFile(LOG_FILE, logText);
    }

    console.log("Saved to:", LOG_FILE);

    return new Response("LOGGED", { status: 200 });

  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Invalid Request", { status: 400 });
  }
}
