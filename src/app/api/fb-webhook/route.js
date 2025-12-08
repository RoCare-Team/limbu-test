export async function POST(req) {
  try {
    // Step 1: Read raw body (buffer/text)
    const raw = await req.text();

    // Step 2: Try to parse JSON safely
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw; // Not JSON → save as plain text
    }

    const timestamp = new Date().toISOString();
    const logText = `\n[${timestamp}] DATA: ${JSON.stringify(data, null, 2)}\n`;

    // Write to file
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
