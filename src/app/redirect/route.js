import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("zoom"); // zoom= के बाद जो भी है

  if (!targetUrl) {
    return NextResponse.json({ error: "URL missing" }, { status: 400 });
  }

  // Redirect to whatever URL is provided
  return NextResponse.redirect(targetUrl);
}
