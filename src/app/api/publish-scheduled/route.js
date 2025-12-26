import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus";
import User from "@/models/User";
import { postToGmbAction } from "@/lib/gmb/postToGmb";
import { deductFromWalletAction } from "@/app/actions/postActions";

/* -------------------------------------------------- 
   DEBUG LOGGER
-------------------------------------------------- */
let debugLogs = [];
const log = (...args) => {
  const formatted = args.map(a => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === "object" && a !== null) return JSON.stringify(a, null, 2);
    return a;
  });
  try { console.log(...formatted); } catch {}
  debugLogs.push(formatted.join(" "));
};

/* -------------------------------------------------- 
   REFRESH ACCESS TOKEN
-------------------------------------------------- */
async function getFreshAccessToken(refreshToken) {
  console.log("refreshTokenrefreshTokenrefreshToken",refreshToken);
  
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
  if (!email) return null;

  const gmbDb = mongoose.connection.useDb("gmb_dashboard");
  const gmbUsers = gmbDb.collection("users");

  const user = await gmbUsers.findOne(
    { email },
    { projection: { projects: 1 } }
  );

  if (!user?.projects?.length) return null;

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

    // 1. Find candidates (fetch IDs only first)
    const candidates = await Post.find({
      status: "scheduled",
      scheduledDate: { $lte: now },
    }).select("_id").lean();

    log(`Found ${candidates.length} posts to process.`);

    if (!candidates.length) {
      return NextResponse.json({ success: true, logs: debugLogs });
    }

    const stats = {
      total: candidates.length,
      processed: 0,
      skipped: 0,
      failed: 0,
      posted: 0,
    };

    for (const candidate of candidates) {
      // 2. ATOMIC LOCK: Transition to 'processing' to prevent race conditions
      const post = await Post.findOneAndUpdate(
        { _id: candidate._id, status: "scheduled" },
        { status: "processing" },
        { new: true }
      );

      if (!post) {
        log(`- Post ${candidate._id} skipped (locked or status changed).`);
        stats.skipped++;
        continue;
      }

      const postId = post._id.toString();
      log(`📝 Processing post ${post._id.toString()}`);

      if (!Array.isArray(post.locations) || !post.locations.length) {
        log("⚠ Invalid or empty locations");
        post.status = "failed";
        post.error = "Scheduled post has no locations.";
        await post.save();
        stats.failed++;
        continue;
      }

      const user = await User.findOne({ userId: post.userId });
      if (!user) {
        log("❌ User not found for post " + postId);
        post.status = "failed";
        post.error = "Owner user not found.";
        await post.save();
        stats.skipped++;
        continue;
      }

      const refreshToken = post.refreshToken;

      if (!refreshToken) {
        log("❌ No refresh token on post document:", postId);
        post.status = "failed";
        post.error = "GMB refresh token not found on post document";
        await post.save();
        stats.failed++;
        continue;
      }

      log("🔑 Using stored refreshToken from post document to get a fresh access token.");
      const accessToken = await getFreshAccessToken(refreshToken);
      let failed = false;
      const processedLocIds = new Set();

      for (let i = 0; i < post.locations.length; i++) {
        const loc = post.locations[i];
        // Skip if invalid, already posted, or duplicate in this run
        if (!loc?.locationId || loc.isPosted || processedLocIds.has(loc.locationId)) continue;

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
            checkmark: post.checkmark || "both",
          };

          log("📦 Payload:", payload);

          const result = await postToGmbAction(payload);
          if (!result?.ok) throw new Error("GMB post failed");

          // ✅ Wallet deduction ONLY after success
          const walletData = await deductFromWalletAction(user.userId, {
            amount: 20,
            type: "deduct",
            reason: "Post-on-GMB",
            metadata: {
              aiPrompt: post.promat || "",
              logoUsed: !!post.logoUrl,
              postId: post._id.toString(),
              locationId: loc.locationId,
            },
          });

          console.log("wallletDaat",walletData);
          

          if (walletData?.message !== "Wallet updated") {
            throw new Error("Wallet deduction failed");
          }

          log("🪙 20 coins deducted via wallet action");

          // Mark this location and any duplicates as posted
          post.locations.forEach(l => {
            if (l.locationId === loc.locationId) {
              l.isPosted = true;
              l.postedAt = new Date();
              l.apiResponse = result;
            }
          });
          processedLocIds.add(loc.locationId);

        } catch (err) {
          log(`❌ Error posting to location ${loc.locationId}:`, err.message);
          post.status = "failed";
          post.error = err.message;
          failed = true;
          break;
        }
      }

      if (!failed) {
        post.status = post.locations.every(l => l.isPosted) ? "posted" : "failed";
        post.error = null;
        stats.posted++;
      } else {
        stats.failed++;
      }

      await post.save();
      stats.processed++;
    }

    return NextResponse.json({ success: true, stats, logs: debugLogs });

  } catch (err) {
    log("💥 CRON CRASH", err.stack);
    return NextResponse.json({ success: false, error: err.message, logs: debugLogs });
  }
}
