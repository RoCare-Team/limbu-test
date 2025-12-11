import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus"; // your Mongoose Post model
import User from "@/models/User"; // Import the User model
import { postToGmbAction } from "@/lib/gmb/postToGmb"; // Assuming this action can be called server-side

/**
 * Uses the user's refresh token to get a new, valid access token from Google.
 * @param {string} refreshToken - The user's Google refresh token.
 * @returns {Promise<string>} A new access token.
 */
async function getFreshAccessToken(refreshToken) {
  console.log("🔄 Attempting to refresh access token...");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("❌ Failed to refresh access token:", data);
    throw new Error("Failed to refresh access token. " + (data.error_description || ""));
  }

  console.log("✅ Access token refreshed successfully.");
  return data.access_token;
}

export async function GET(req) {
  console.log("✅ Cron job for scheduled posts started...");

  try {
    // Look for posts scheduled up to 60 seconds in the future
    // to account for cron job timing variations.
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 60 * 1000); // 60 seconds from now

    await dbConnect();

    let successCount = 0;
    let failureCount = 0;

    // Find scheduled posts whose time has arrived and have locations not yet posted
    const posts = await Post.find({
      status: "scheduled",
      scheduledDate: { $lte: futureLimit },
      "locations.isPosted": { $ne: true },
    });

    if (posts.length === 0) {
      console.log("No posts to process at this time.");
      return NextResponse.json({ message: "No posts to process." }, { status: 200 });
    }

    for (const post of posts) {
      console.log(`Processing scheduled post: ${post._id} for date ${post.scheduledDate}`);
      let postFailed = false;
      let processingError = null;

      try {
        // Find the user who created the post to get their refresh token
        const user = await User.findById(post.userId);
        if (!user) {
          const errorMessage = `User ${post.userId} not found for post ${post._id}.`;
          post.status = 'failed';
          post.error = errorMessage;
          await post.save();
          throw new Error(errorMessage);
        }
        if (!user.refreshToken) {
          const errorMessage = `User ${user.email} has no refresh token for post ${post._id}.`;
          post.status = 'failed';
          post.error = errorMessage;
          await post.save();
          throw new Error(errorMessage);
        }

        // Get a fresh access token once per user for this cron run
        const accessToken = await getFreshAccessToken(user.refreshToken);

        for (let i = 0; i < post.locations.length; i++) {
          const locationRef = post.locations[i];

          if (!locationRef.isPosted) {
            console.log(`Attempting to post to location: ${locationRef.name} (${locationRef.id})`);

            // 1. Find the user who created the post to get their refresh token
            // const user = await User.findById(post.userId);
            // if (!user || !user.refreshToken) {
            //   throw new Error(`User ${post.userId} not found or has no refresh token.`);
            // }
            
            // 3. Call the posting action with the new token
            const { ok: responseOk, data } = await postToGmbAction({
              account: locationRef.accountId,
              locationData: [{ city: locationRef.id, cityName: locationRef.city, bookUrl: "" }],
              output: post.aiOutput,
              description: post.description,
              accessToken: accessToken, // Use the freshly obtained token
              checkmark: post.checkmark, // Assuming checkmark is stored with the post
            });

            if (responseOk) {
              locationRef.isPosted = true; // Mark this specific location as posted
              console.log(`✅ Successfully posted to ${locationRef.name}`);

              // Deduct coins for successful post
              user.wallet = (user.wallet || 0) - 20; // Deduct 20 coins
              await user.save();
              console.log(`🪙 20 coins deducted from user ${user.email}. New balance: ${user.wallet}`);
            } else {
              console.error(`❌ Failed to post to ${locationRef.name}:`, data);
              postFailed = true;
              post.status = 'failed';
              post.error = `Failed at location '${locationRef.name}': ${data?.error?.message || data.error || 'Unknown GMB API error'}`;
              // Break the inner loop for this post as it has already failed.
              break; 
            }
          }
        }

        // Check if all locations for this post have been processed
        const allDone = post.locations.every(loc => loc.isPosted);
        if (allDone) {
          post.status = 'posted';
          post.error = null; // Clear any previous error
          successCount++;
          console.log(`✅ Post ${post._id} fully posted to all locations.`);
        } else if (!postFailed) {
          console.log(`📝 Post ${post._id} partially posted. Will retry remaining locations later.`);
        } else {
          failureCount++;
          console.log(`🔻 Post ${post._id} marked as failed.`);
        }

        await post.save();

      } catch (postProcessingError) {
        console.error(`[CRON] Critical error processing post ${post._id}:`, postProcessingError.message);
        // The error is already saved to the post inside the try block for specific errors
        // This catch handles more generic errors during user/token fetching.
        // The post status is set to 'failed' inside the conditions above.
        
        // FIX: Save the failure status to DB so it doesn't loop forever
        try {
          post.status = 'failed';
          post.error = postProcessingError.message || "Unknown system error";
          await post.save();
          failureCount++;
        } catch (saveError) {
          console.error("Failed to save error status for post:", post._id, saveError);
        }

        continue; // Move to the next post
      }
    }

    return NextResponse.json({ message: `Processed ${posts.length} posts.` }, { status: 200 });
    return NextResponse.json({ 
      success: true,
      message: `Processed ${posts.length} posts.`,
      stats: {
        total: posts.length,
        successful: successCount,
        failed: failureCount
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ message: "Scheduler error", error: error.message }, { status: 500 });
  }
}
