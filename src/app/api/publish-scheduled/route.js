import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus";
import User from "@/models/User";
import { postToGmbAction } from "@/lib/gmb/postToGmb";
import { deductFromWalletAction } from "@/app/actions/postActions";

// Vercel & Next.js Config
// --------------------------------------------------
// Allow up to 5 minutes for execution (Vercel Pro plan limit).
// We aim to finish much faster, but this prevents premature 504s.
export const maxDuration = 300;
// Ensure the route is never cached so cron always sees fresh data.
export const dynamic = "force-dynamic";

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
   TIMEOUT HELPER
-------------------------------------------------- */
async function fetchWithTimeout(promise, ms = 20000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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

    // 1. Find candidates with LIMIT and SORT
    // We limit to 25 posts per run to process batches efficiently.
    // We sort by scheduledDate ASC to process the oldest pending posts first.
    const BATCH_SIZE = 25;
    const candidates = await Post.find({
      status: "scheduled",
      scheduledDate: { $lte: now },
    })
    .sort({ scheduledDate: 1 })
    .limit(BATCH_SIZE)
    .select("_id")
    .lean();

    if (!candidates.length) {
      return NextResponse.json({ success: true, message: "No scheduled posts due.", logs: debugLogs });
    }

    log(`Found ${candidates.length} posts to process (Batch Limit: ${BATCH_SIZE}).`);

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
        { _id: candidate._id, status: "scheduled" }, // Ensure we only pick up scheduled ones
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
            checkmark: ["post", "photo", "both"].includes(post.checkmark) ? post.checkmark : "both",
          };

          log("📦 Payload:", payload);

          // Wrap the GMB call in a timeout to prevent hanging
          const result = await fetchWithTimeout(postToGmbAction(payload), 20000);

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

          // IMMEDIATE SAVE: Persist isPosted status and wallet deduction
          await post.save();

          processedLocIds.add(loc.locationId);

        } catch (err) {
          log(`❌ Error posting to location ${loc.locationId}:`, err.message || "Unknown error");
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

    log("✅ Batch processing complete", stats);
    return NextResponse.json({ success: true, stats, logs: debugLogs });

  } catch (err) {
    log("💥 CRON CRASH", err.stack);
    return NextResponse.json({ success: false, error: err.message, logs: debugLogs });
  }
}
