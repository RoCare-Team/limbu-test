import cron from "node-cron";
import connectToDatabase  from "@/lib/mongodb"; // your MongoDB connection file
import Post from "@/models/PostStatus"; // your Mongoose Post model
import { postToGmbAction } from "@/app/actions/postActions"; // Assuming this action can be called server-side

let jobStarted = false;

export async function GET(req) {
  if (!jobStarted) {
    console.log("✅ Scheduler started...");
    jobStarted = true;

    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        await connectToDatabase();

        // Find scheduled posts whose time has arrived and have locations not yet posted
        const posts = await Post.find({
          status: "scheduled",
          scheduledDate: { $lte: now },
          "locations.isPosted": false, // At least one location is not yet posted
        });

        for (const post of posts) {
          console.log(`Processing scheduled post: ${post._id} for date ${post.scheduledDate}`);

          let allLocationsPosted = true;
          for (let i = 0; i < post.locations.length; i++) {
            const location = post.locations[i];

            if (!location.isPosted) {
              console.log(`Attempting to post to location: ${location.name} (${location.id})`);

              // --- IMPORTANT: Access Token Management ---
              // The `postToGmbAction` currently relies on `session.accessToken`.
              // In a cron job, `session` is not available.
              // You need a mechanism to get a valid, non-expired access token for the user
              // who scheduled the post. This typically involves:
              // 1. Storing the user's Google Refresh Token in your User model.
              // 2. Using the Refresh Token to obtain a new Access Token before calling GMB API.
              //
              // For this example, I'm assuming `postToGmbAction` is modified to handle
              // token retrieval or that a valid token can be passed.
              // If `postToGmbAction` cannot handle this, you'd need to fetch the user's
              // refresh token here and generate a new access token.
              const dummyAccessToken = "YOUR_FETCHED_OR_STORED_ACCESS_TOKEN"; // Placeholder
              // You would need to fetch the user associated with the post and get their token.
              // Example: const user = await User.findById(post.userId);
              // const accessToken = await getFreshAccessToken(user.refreshToken);

              try {
                const { ok: responseOk, data } = await postToGmbAction({
                  account: location.accountId,
                  locationData: [{ city: location.id, cityName: location.city, bookUrl: "" }], // Simplified, adjust as needed
                  output: post.aiOutput,
                  description: post.description,
                  accessToken: dummyAccessToken, // Replace with actual token
                  checkmark: post.checkmark, // Assuming checkmark is stored with the post
                });

                if (responseOk) {
                  post.locations[i].isPosted = true; // Mark this specific location as posted
                  console.log(`Successfully posted to ${location.name}`);
                } else {
                  console.error(`Failed to post to ${location.name}:`, data);
                  allLocationsPosted = false; // If one fails, not all are posted
                }
              } catch (postError) {
                console.error(`Error posting to ${location.name}:`, postError);
                allLocationsPosted = false;
              }
            }
          }
          // Update the post in the database
          if (allLocationsPosted) {
            post.status = "posted"; // All locations for this post are now posted
            console.log(`Post ${post._id} fully posted.`);
          }
          await post.save();
        }
      } catch (error) {
        console.error("Scheduler error:", error);
      }
    });
  }

  res.status(200).json({ message: "Scheduler is running" });
}
