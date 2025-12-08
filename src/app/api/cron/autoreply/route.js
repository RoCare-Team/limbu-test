import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const users = await AutoReply.find({ autoReply: true });

    console.log("CRON STARTED. Auto Users:", users.length);

    for (const user of users) {
      try {
        // Step 1 — Fetch reviews
        const res = await fetch(
          "https://n8n.srv968758.hstgr.cloud/webhook/b3f4dda4-aef1-4e87-a426-b503cee3612b",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              acc_id: user.locations[0].accountId,
              locationIds: user.locations.map((l) => l.locationId),
              access_token: user.accessToken
            }),
          }
        );

        const data = await res.json();
        if (!data?.reviews) continue;

        // Step 2 — Filter pending reviews (no reply)
        const pending = data.reviews.filter(
          (r) => !r.reviewReply?.comment?.trim()
        );

        console.log(`User ${user._id} pending reviews:`, pending.length);

        // Step 3 — Auto Reply to each review
        for (const r of pending) {
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
        }
      } catch (err) {
        console.error("Cron user loop error:", err);
      }
    }

    return NextResponse.json({ success: true, message: "Cron executed" });
  } catch (err) {
    console.error("Cron main error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
