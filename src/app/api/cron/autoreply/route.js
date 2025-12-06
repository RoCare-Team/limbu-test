import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const users = await AutoReply.find({ autoReply: true });

  for (const user of users) {
    try {
        console.log("usersss",users);
        
      console.log("Running auto reply for user:", user.userId);

      // Fetch all reviews
      const res = await fetch("https://n8n.srv968758.hstgr.cloud/webhook/b3f4dda4-aef1-4e87-a426-b503cee3612b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acc_id: user.locations[0].accountId,
          locationIds: user.locations.map(l => l.locationId),
          access_token: user.accessToken
        })
      });

      const data = await res.json();
      if (!data.reviews) continue;

      // Filter reviews without reply
      const pendingReviews = data.reviews.filter(
        r => !r.reviewReply || !r.reviewReply.comment?.trim()
      );

      for (const review of pendingReviews) {
        // AI reply webhook
        await fetch("https://n8n.srv968758.hstgr.cloud/webhook/59634515-0550-4cb5-9031-0d82bc0a303d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: user.accessToken,
            acc_id: review.name.split("/")[1],
            locationIds: review.name.split("/")[3],
            Reviewer_Name: review.reviewer?.displayName,
            Star_Rating: review.starRating,
            Review_Content: review.comment,
            Review_ID: review.reviewId
          })
        });
      }

    } catch (err) {
      console.error("Cron error:", err);
    }
  }

  return NextResponse.json({ success: true });
}
