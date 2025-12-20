import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Frontend se aane waale JSON data ko read karna
    const body = await req.json();
    const { business_name, location } = body;

    // Validation
    if (!business_name || !location) {
      return NextResponse.json(
        { success: false, error: "business_name and location are required" },
        { status: 400 }
      );
    }

    const n8nUrl = "https://n8n.limbutech.in/webhook/89c34fc8-2a74-4d91-a3d9-4d8468bd25e0";

    // 2. n8n Webhook ko call karna (jaisa Postman mein dikh raha hai)
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Note: Screenshot ke hisaab se Array ke andar Object bhejna hai [{...}]
      body: JSON.stringify([
        {
          "business-name": business_name,
          "location": location,
        }
      ]),
    });

    if (!res.ok) {
      throw new Error(`n8n responded with status: ${res.status}`);
    }

    const data = await res.json();

    // 3. Final response wapas bhejna
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}