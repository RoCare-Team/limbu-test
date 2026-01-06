import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";

/**
 * 🔁 Exchange Authorization Code → Refresh Token
 */
async function exchangeCodeForRefreshToken(authCode) {
  console.log("🔄 Exchanging Auth Code for Refresh Token");

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,       // WEB CLIENT ID
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code: authCode,
    grant_type: "authorization_code",
    redirect_uri: "", // ✅ Mobile flow
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Google Token Exchange Failed:", data);
    throw new Error(data.error_description || "Token exchange failed");
  }

  // ⚠️ Google returns refresh_token ONLY first time
  if (!data.refresh_token) {
    throw new Error(
      "No refresh token returned. Account already connected or code reused."
    );
  }

  console.log("✅ Refresh Token received");
  return data.refresh_token;
}

/**
 * 🧠 POST API
 */
export async function POST(req) {
  try {
    await dbConnect();

    const { userId, refreshToken, locations, autoReply } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "refreshToken or auth code is required" },
        { status: 400 }
      );
    }

    let finalRefreshToken = refreshToken;

    /**
     * 🔥 If token starts with "4/" → it is an Auth Code
     */
    if (refreshToken.startsWith("4/")) {
      finalRefreshToken = await exchangeCodeForRefreshToken(refreshToken);
    }

    /**
     * 💾 Save in DB (Permanent Refresh Token)
     */
    await AutoReply.findOneAndUpdate(
      { userId },
      {
        userId,
        refreshToken: finalRefreshToken,
        locations,
        autoReply,
        provider: "google",
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Google account connected successfully",
    });

  } catch (error) {
    console.error("❌ API Error:", error.message);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
