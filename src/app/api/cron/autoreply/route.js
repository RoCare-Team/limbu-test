// app/api/cron/autoreply/route.js
import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";
import { NextResponse } from "next/server";

// Make sure this runs in Node.js (for Mongoose)
export const runtime = "nodejs";
// Optional: increase timeout if needed (Vercel Pro/Team)
export const maxDuration = 60;

export async function GET() {
  console.log("[CRON] /api/cron/autoreply triggered at", new Date().toISOString());

  try {
    await dbConnect();

    // Get all users who enabled auto reply
    const users = await AutoReply.find({ autoReply: true });

    console.log("[CRON] Auto users found:", users.length);

    for (const user of users) {
      try {
        // 1) Fetch reviews from n8n
        const res = await fetch(
          "https://n8n.srv968758.hstgr.cloud/webhook/b3f4dda4-aef1-4e87-a426-b503cee3612b",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              acc_id: user.locations[0].accountId,
              locationIds: user.locations.map((l) => l.locationId),
              access_token: user.accessToken,
            }),
          }
        );

        if (!res.ok) {
          console.error("[CRON] Failed to fetch reviews for user", user._id, "status:", res.status);
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
                  access_token: user.accessToken,
                  acc_id,
                  locationIds: locationId,
                  Reviewer_Name: r.reviewer?.displayName || "Customer",
                  Star_Rating: r.starRating,
                  Review_Content: r.comment,
                  Review_ID: r.reviewId,
                }),
              }
            );
          } catch (err) {
            console.error("[CRON] Error replying to review", r.reviewId, "user", user._id, err);
          }
        }
      } catch (err) {
        console.error("[CRON] Error in user loop for user", user._id, err);
      }
    }

    return NextResponse.json({ success: true, message: "Cron executed" });
  } catch (err) {
    console.error("[CRON] Main error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
