import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL missing" }, { status: 400 });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="download-${Date.now()}.jpg"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
