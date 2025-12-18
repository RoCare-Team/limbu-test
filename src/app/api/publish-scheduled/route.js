import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus";
import User from "@/models/User";
import { postToGmbAction } from "@/lib/gmb/postToGmb";

/* -------------------------------------------------- 
   DEBUG LOGGER
-------------------------------------------------- */
let debugLogs = [];
const log = (...args) => {
  const formatted = args.map(a => {
    if (a instanceof Error) {
      return a.stack || a.message;
    }
    if (typeof a === "object" && a !== null) {
      return JSON.stringify(a, null, 2);
    }
    return a;
  });
  try { console.log(...formatted); } catch {}
  debugLogs.push(formatted.join(" "));
};

/* -------------------------------------------------- 
   REFRESH ACCESS TOKEN
-------------------------------------------------- */
async function getFreshAccessToken(refreshToken) {
  log("🔄 Refreshing access token");

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
    log("❌ Token refresh failed", data);
    throw new Error(data.error_description || "Token refresh failed");
  }

  log("✅ Access token refreshed");
  return data.access_token;
}

/* -------------------------------------------------- 
   GET REFRESH TOKEN FROM gmb_dashboard.users
-------------------------------------------------- */
async function getRefreshTokenByEmail(email) {
  console.log("emsaillll",email);
  
  if (!email) return null;

  const gmbDb = mongoose.connection.useDb("gmb_dashboard");
  const gmbUsers = gmbDb.collection("users");

  const user = await gmbUsers.findOne(
    { email },
    { projection: { projects: 1 } }
  );

  if (!user || !Array.isArray(user.projects) || user.projects.length === 0) {
    return null;
  }

  const latestProject = user.projects[user.projects.length - 1];
  log("🔑 Refresh token found for", email);

  return latestProject.refreshToken || null;
}

/* -------------------------------------------------- 
   MAIN CRON FUNCTION
-------------------------------------------------- */
export async function GET() {
  debugLogs = [];
  log("🚀 Cron started");

  try {
    await dbConnect();
    log("📦 Mongo connected");

    const now = new Date();

    const posts = await Post.find({
      status: "scheduled",
      scheduledDate: { $lte: now },
    }).lean();

    log(`Found ${posts.length} posts to process.`);

    if (!posts.length) {
      log("ℹ No scheduled posts");
      return NextResponse.json({ success: true, logs: debugLogs });
    }

    const stats = {
      total: posts.length,
      processed: 0,
      skipped: 0,
      failed: 0,
      posted: 0,
    };

    const tokenCache = new Map(); // email → accessToken

    /* -------------------------------------------------- 
       LOOP POSTS
    -------------------------------------------------- */
    for (const rawPost of posts) {
      const postId = rawPost._id.toString();
      log(`📝 Processing post ${postId}`);

      // DEBUG: Log raw post locations to debug "Invalid or empty locations" error
      console.log(`🔍 DEBUG: Post ${postId} raw locations:`, JSON.stringify(rawPost.locations, null, 2));

      if (!rawPost.userId) {
        log(`❌ Post ${postId} is missing a userId.`);
        stats.skipped++;
        continue;
      }

      // 🚨 HARD GUARD — raw data
      if (!Array.isArray(rawPost.locations) || rawPost.locations.length === 0) {
        log("⚠ Invalid or empty locations (raw)");
        stats.failed++;
        continue;
      }

      const user = await User.findOne({ userId: rawPost.userId });
      if (!user || !user.email) {
        log(`❌ User/email not found for userId: ${rawPost.userId}`);
        stats.skipped++;
        continue;
      }

      const refreshToken = await getRefreshTokenByEmail(user.email);
      if (!refreshToken) {
        log("❌ No refreshToken for", user.email);
        stats.failed++;
        await Post.updateOne(
          { _id: postId },
          { $set: { status: "failed", error: "GMB refresh token not found." } }
        );
        continue;
      }

      let accessToken = tokenCache.get(user.email);
      if (!accessToken) {
        try {
          accessToken = await getFreshAccessToken(refreshToken);
          tokenCache.set(user.email, accessToken);
        } catch (err) {
          log(`❌ Token refresh error for ${user.email}:`, err.message);
          stats.failed++;
          await Post.updateOne(
            { _id: postId },
            { $set: { status: "failed", error: err.message } }
          );
          continue;
        }
      }

      const post = await Post.findById(postId);
      if (!post) {
        log("❌ Post vanished");
        stats.skipped++;
        continue;
      }

      // 🚨 CRITICAL FIX — normalize locations
      if (!Array.isArray(post.locations)) {
        log("🚨 FIXED corrupt locations field");
        post.locations = [];
        post.status = "failed";
        post.error = "Invalid locations data";
        await post.save();
        stats.failed++;
        continue;
      }

      // 🧹 SANITIZE LOCATIONS: Remove non-object entries (like "") that crash Mongoose validation
      const validLocs = post.locations.filter(l => l && typeof l === "object");
      if (validLocs.length !== post.locations.length) {
        log(`🧹 Removed ${post.locations.length - validLocs.length} invalid location entries`);
        post.locations = validLocs;
      }

      if (post.locations.length === 0) {
        log("❌ No valid locations to post to");
        post.status = "failed";
        post.error = "No valid locations found";
        await post.save();
        stats.failed++;
        continue;
      }

      let failed = false;

      /* -------------------------------------------------- 
         LOCATION LOOP
      -------------------------------------------------- */
      for (let i = 0; i < post.locations.length; i++) {
        const loc = post.locations[i];

        if (
          !loc ||
          typeof loc !== "object" ||
          !loc.locationId ||
          loc.isPosted === true
        ) {
          log("⚠ Skipping invalid location entry");
          continue;
        }

        log(`📍 Posting to ${loc.name || loc.locationId}`);

        try { 
          const payload = {
            account: loc.accountId,
            locationData: [{
              city: loc.locationId,
              cityName: loc.locality || loc.city || "",
              bookUrl: loc.websiteUrl || "",
            }],
            output: post.aiOutput,
            description: post.description || "",
            accessToken,
            checkmark: "post",
          };

          console.log("---------------------------------------------------");
          console.log("📦 FULL PAYLOAD BEING SENT TO GMB (DEBUG):");
          console.log(JSON.stringify({ 
            ...payload, 
            accessToken: accessToken ? accessToken : "MISSING" 
          }, null, 2));
          console.log("---------------------------------------------------");

          const result = await postToGmbAction(payload);

          log(`📬 GMB Action Result:`, JSON.stringify(result, null, 2));

          if (!result?.ok) {
            throw new Error(result?.data?.message || "GMB post failed");
          }

          post.locations[i].isPosted = true;
          post.locations[i].postedAt = new Date();
          post.locations[i].apiResponse = result;
          log(`✅ Successfully posted to ${loc.name || loc.locationId}`);

          user.wallet = Math.max((user.wallet || 0) - 20, 0);
          await user.save();

          log("🪙 20 coins deducted");
        } catch (err) {
          log(`❌ GMB post failed for location ${loc.locationId}:`, err.message);
          post.status = "failed";
          post.error = `Location ${loc.locationId}: ${err.message}`;
          failed = true;
          break;
        }
      }

      /* -------------------------------------------------- 
         FINALIZE POST
      -------------------------------------------------- */
      if (!failed) {
        const done = post.locations.every(l => l.isPosted === true);
        post.status = done ? "posted" : "scheduled";
        post.error = null;
        if (done) stats.posted++;
        log(`✅ Post ${postId} status updated to '${post.status}'.`);
      } else {
        stats.failed++;
        log(`❌ Post ${postId} marked as 'failed'. Error: ${post.error}`);
      }

      await post.save();
      stats.processed++;
    }

    return NextResponse.json({ success: true, stats, logs: debugLogs });

  } catch (err) {
    log("💥 CRON CRASH", err.stack);
    return NextResponse.json({
      success: false,
      error: err.message,
      logs: debugLogs
    });
  }
}
