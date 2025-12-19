import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus";
import { NextResponse } from "next/server";
// NOTE: Adjust this import path to point to your actual postToGmbAction file
import { postToGmbAction } from "@/app/actions/postToGmbAction";

// Prevent caching for this route so it always runs fresh
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await dbConnect();

    const now = new Date();
    // Fetch posts that are scheduled and due for publishing
    const posts = await Post.find({
      status: "scheduled",
      scheduledDate: { $lte: now },
    });

    if (posts.length === 0) {
      return NextResponse.json({ success: true, message: "No scheduled posts due." });
    }

    const results = [];

    for (const post of posts) {
      try {
        console.log(`Processing scheduled post: ${post._id}`);

        // 🔍 Debug: Log raw locations from DB
        console.log(`🔍 Raw locations for post ${post._id}:`, JSON.stringify(post.locations, null, 2));

        // 0. Validate Locations (Strict Check)
        if (!post.locations || !Array.isArray(post.locations) || post.locations.length === 0) {
          console.error(`⚠ Invalid or empty locations (raw) for post ${post._id}. Marking as failed.`);
          post.status = "failed";
          post.error = "Invalid or empty locations in database record.";
          await post.save();
          results.push({ id: post._id, status: "failed", error: "Invalid or empty locations" });
          continue;
        }

        // 1. Validate Refresh Token
        if (!post.refreshToken) {
          throw new Error("Missing refreshToken for scheduled post.");
        }

        // 2. Generate Fresh Access Token
        const tokenParams = new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: post.refreshToken,
          grant_type: "refresh_token",
        });

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams,
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          throw new Error(`Token refresh failed: ${tokenData.error_description || JSON.stringify(tokenData)}`);
        }

const newAccessToken = tokenData.access_token?.replace(/^Bearer\s+/i, "");
        console.log("newAccessTokennewAccessToken",newAccessToken);
        

        // 3. Prepare Payload for postToGmbAction
        // Reconstruct locations array to match the format expected by "Post Now"
        const locationsPayload = post.locations.map((loc) => ({
          locationId: loc.locationId,
          accountId: loc.accountId,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          locality: loc.locality,
          websiteUrl: loc.websiteUrl,
        }));

        const payload = {
          userId: post.userId,
          description: post.description,
          aiOutput: post.aiOutput, // Contains media/content info
          promat: post.promat,
          locations: locationsPayload,
          accessToken: newAccessToken, // Pass the fresh token
        };

        console.log("payloadpayloadpayload",payload);
        

        // 4. Call the action to post to GMB
        const response = await postToGmbAction(payload);

        // 5. Update Database based on result
        if (response && response.success) {
          post.status = "posted";
          post.apiResponse = response; // Store response for debugging
          post.postedAt = new Date();
        } else {
          post.status = "failed";
          post.error = response?.error || "Unknown error from postToGmbAction";
        }

        await post.save();
        results.push({ id: post._id, status: post.status, response });

      } catch (err) {
        console.error(`Failed to process post ${post._id}:`, err);
        post.status = "failed";
        post.error = err.message;
        await post.save();
        results.push({ id: post._id, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("Cron Job Error:", err);
    return NextResponse.json({ success: false, error: err.message }, 500);
  }
}