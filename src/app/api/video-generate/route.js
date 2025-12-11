import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      product_name,
      product_image,
      user_insturction,
      size,
      duration,
    } = body;

    if (!product_name || !product_image || !user_insturction) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    let finalImageUrl = product_image;

    // Upload Base64 to Cloudinary
    if (product_image.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(product_image, {
          folder: "video-generation",
          resource_type: "image",
        });

        finalImageUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("Cloudinary Upload Failed:", err);
        return NextResponse.json(
          { success: false, error: "Invalid Base64 image." },
          { status: 400 }
        );
      }
    }

    // FINAL Payload for N8N
    const payload = {
      product_name,
      product_image: finalImageUrl,   // FIXED KEY NAME
      user_insturction,
      size,
      duration,
    };

    const webhookRes = await fetch(
      "https://n8n.limbutech.in/webhook/cgi_video",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const text = await webhookRes.text();

    let n8ndata;
    try {
      n8ndata = JSON.parse(text);
    } catch {
      n8ndata = { raw: text };
    }

    if (!webhookRes.ok) {
      return NextResponse.json(
        { success: false, error: n8ndata },
        { status: webhookRes.status }
      );
    }

    // FIX → Always return 'output' key
    const outputUrl =
      n8ndata.secure_url ||
      n8ndata.url ||
      n8ndata.playback_url ||
      null;

    return NextResponse.json(
      { success: true, data: { output: outputUrl, raw: n8ndata } },
      { status: 200 }
    );

  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
