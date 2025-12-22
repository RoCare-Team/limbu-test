// app/api/cron/autoreply/route.js
import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";
import { NextResponse } from "next/server";

// Make sure this runs in Node.js (for Mongoose)
export const runtime = "nodejs";
// Optional: increase timeout if needed (Vercel Pro/Team)
export const maxDuration = 60;

async function getFreshAccessToken(refreshToken) {
  console.log("🔄 Refreshing access token for cron auto-reply");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Token refresh failed for cron auto-reply", data);
    throw new Error(data.error_description || "Token refresh failed");
  }

  console.log("✅ Access token refreshed for cron auto-reply");
  return data.access_token;
}

export async function GET() {
  console.log("[CRON] /api/cron/autoreply triggered at", new Date().toISOString());

  try {
    await dbConnect();

    // Get all users who enabled auto reply
    const users = await AutoReply.find({ autoReply: true });

    console.log("[CRON] Auto users found:", users.length);

    for (const user of users) {
      try {
        if (!user.refreshToken) {
          console.log(`[CRON] User ${user._id} has no refresh token, skipping.`);
          continue;
        }

        if (!user.locations || user.locations.length === 0) {
          console.log(`[CRON] User ${user._id} has no locations, skipping.`);
          continue;
        }

        const newAccessToken = await getFreshAccessToken(user.refreshToken);

        // 1) Fetch reviews from n8n
        const res = await fetch(
          "https://n8n.srv968758.hstgr.cloud/webhook/b3f4dda4-aef1-4e87-a426-b503cee3612b",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              acc_id: user.locations[0]?.accountId,
              locationIds: user.locations.map((l) => l.locationId),
              access_token: newAccessToken,
            }),
          }
        );

        if (!res.ok) {
          const errorBody = await res.text();
          console.error("[CRON] Failed to fetch reviews for user", user._id, "status:", res.status, "body:", errorBody);
          if (res.status === 401 || res.status === 403) {
            await AutoReply.updateOne({ _id: user._id }, { autoReply: false, error: 'Invalid refresh token. Disabled auto-reply.' });
            console.log(`[CRON] Disabled auto-reply for user ${user._id} due to auth error.`);
          }
          continue;
        }

        const data = await res.json();
        if (!data?.reviews || !Array.isArray(data.reviews)) {
          console.log("[CRON] No reviews array for user", user._id);
          continue;
        }

        // 2) Filter reviews that don't have any reply
        const pending = data.reviews.filter((r) => !r.reviewReply?.comment?.trim());
        console.log(`[CRON] User ${user._id} pending reviews:`, pending.length);

        // 3) Auto-reply for each pending review
        for (const r of pending) {
          try {
            const [_, acc_id, , locationId] = r.name.split("/");

            await fetch(
              "https://n8n.srv968758.hstgr.cloud/webhook/59634515-0550-4cb5-9031-0d82bc0a303d",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  access_token: newAccessToken,
                  acc_id,
                  locationIds: locationId,
                  Reviewer_Name: r.reviewer?.displayName || "Customer",
                  Star_Rating: r.starRating,
                  Review_Content: r.comment,
                  Review_ID: r.reviewId,
                }),
              }
            );
            console.log(`[CRON] Sent review ${r.reviewId} for user ${user._id} to auto-reply webhook.`);
          } catch (err) {
            console.error("[CRON] Error replying to review", r.reviewId, "user", user._id, err);
          }
        }
      } catch (err) {
        console.error("[CRON] Error in user loop for user", user._id, err);
        if (err.message.includes("Token refresh failed")) {
            await AutoReply.updateOne({ _id: user._id }, { autoReply: false, error: 'Invalid refresh token. Disabled auto-reply.' });
            console.log(`[CRON] Disabled auto-reply for user ${user._id} due to token refresh failure.`);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cron executed" });
  } catch (err) {
    console.error("[CRON] Main error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
