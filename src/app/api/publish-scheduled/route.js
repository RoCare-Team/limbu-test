import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus";
import User from "@/models/User";
import { postToGmbAction } from "@/lib/gmb/postToGmb";

/* ==================================================
   DEBUG LOGGER (STRUCTURED)
================================================== */
let debugLogs = [];

const log = (level, message, data = null) => {
  const time = new Date().toISOString();
  let entry = `[${time}] [${level}] ${message}`;

  if (data) {
    try {
      entry += " | " + JSON.stringify(data, null, 2);
    } catch {
      entry += " | [Unserializable Data]";
    }
  }

  console.log(entry);
  debugLogs.push(entry);
};

/* ==================================================
   REFRESH ACCESS TOKEN
================================================== */
async function getFreshAccessToken(refreshToken) {
  log("INFO", "Refreshing access token");

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
  log("DEBUG", "Google token API response", data);

  if (!res.ok) {
    log("ERROR", "Token refresh failed", data);
    throw new Error(data.error_description || "Token refresh failed");
  }

  log("SUCCESS", "Access token refreshed");
  return data.access_token;
}

/* ==================================================
   GET REFRESH TOKEN FROM gmb_dashboard.users
================================================== */
async function getRefreshTokenByEmail(email) {
  if (!email) return null;

  const gmbDb = mongoose.connection.useDb("gmb_dashboard");
  const gmbUsers = gmbDb.collection("users");

  const user = await gmbUsers.findOne(
    { email },
    { projection: { projects: 1 } }
  );

  if (!user || !Array.isArray(user.projects) || !user.projects.length) {
    log("WARN", "No GMB project found for user", { email });
    return null;
  }

  const latestProject = user.projects[user.projects.length - 1];
  log("INFO", "Refresh token found", { email });

  return latestProject.refreshToken || null;
}

/* ==================================================
   MAIN CRON FUNCTION
================================================== */
export async function GET() {
  debugLogs = [];
  log("INFO", "🚀 Cron started");

  try {
    await dbConnect();
    log("SUCCESS", "MongoDB connected");

    const now = new Date();

    // ✅ FIXED QUERY (duplicate scheduledDate removed)
    const posts = await Post.find({
      status: "scheduled",
      scheduledDate: { $lte: now },
    }).lean();

    log("INFO", "Scheduled posts fetched", { count: posts.length });

    if (!posts.length) {
      return NextResponse.json({ success: true, logs: debugLogs });
    }

    const stats = {
      total: posts.length,
      processed: 0,
      failed: 0,
      posted: 0,
      skipped: 0,
    };

    const tokenCache = new Map(); // email → accessToken

    /* ==================================================
       LOOP POSTS
    ================================================== */
    for (const rawPost of posts) {
      const postId = rawPost._id.toString();

      log("INFO", "Processing post", {
        postId,
        userId: rawPost.userId,
        scheduledDate: rawPost.scheduledDate,
      });

      /* ---------- VALIDATIONS ---------- */
      if (!rawPost.userId) {
        log("ERROR", "Missing userId", { postId });
        await Post.updateOne(
          { _id: postId },
          { $set: { status: "failed", error: "Missing userId" } }
        );
        stats.failed++;
        continue;
      }

      if (!Array.isArray(rawPost.locations) || !rawPost.locations.length) {
        log("ERROR", "Invalid raw locations (empty or not array)", { postId, locations: rawPost.locations });
        await Post.updateOne(
          { _id: postId },
          { $set: { status: "failed", error: "Invalid locations" } }
        );
        stats.failed++;
        continue;
      }

      const user = await User.findOne({ userId: rawPost.userId });
      if (!user?.email) {
        log("ERROR", "User not found", { userId: rawPost.userId });
        stats.failed++;
        continue;
      }

      /* ---------- TOKEN ---------- */
      const refreshToken = await getRefreshTokenByEmail(user.email);
      if (!refreshToken) {
        log("ERROR", "Refresh token missing", { email: user.email });
        stats.failed++;
        continue;
      }

      let accessToken = tokenCache.get(user.email);
      if (!accessToken) {
        accessToken = await getFreshAccessToken(refreshToken);
        tokenCache.set(user.email, accessToken);
      }

      const post = await Post.findById(postId);
      if (!post) {
        log("WARN", "Post vanished", { postId });
        stats.skipped++;
        continue;
      }

      /* ---------- LOCATION SANITIZE ---------- */
      const originalLocationCount = post.locations.length;
      post.locations = post.locations.filter(
        (l) => l && typeof l === "object" && l.locationId
      );

      if (!post.locations.llid eocations after sanntize", { postIg,toriginahL)c tionCount });{
        log("status = "failEd";
        post.eRROR", "No valid locations after sanitize", { postId, originalLocationCount });
        post.status = "fa;
        stats.failed++iled";
        post.error = "No valid locations (missing locationId)";
        await post.save();
        stats.failed++;
        continue;
      }

      let failed = false;

      /* ==================================================
         GROUP BY ACCOUNT
      ================================================== */
      const pending = post.locations.filter((l) => !l.isPosted);
      const grouped = {};

      for (const loc of pending) {
        const acc = loc.accountId || "default";
        grouped[acc] ||= [];
        grouped[acc].push(loc);
      }

      for (const [accountId, locs] of Object.entries(grouped)) {
        const locationData = locs.map((l) => ({
          city: l.locationId,
          cityName: l.locality || l.city || "",
          bookUrl: l.websiteUrl || "",
        }));

        const payload = {
          account: accountId === "default" ? "" : accountId,
          locationData,
          output: post.aiOutput,
          description: post.description || "",
          accessToken: "PRESENT", // 🔒 masked
          checkmark: post.checkmark || false,
        };

        log("INFO", "Posting to GMB", {
          postId,
          accountId,
          locations: locs.length,
          payload,
        });

        try {
          const result = await postToGmbAction({
            ...payload,
            accessToken,
          });

          log("DEBUG", "GMB response", result);

          if (!result?.ok) {
            throw new Error(result?.data?.message || "GMB failed");
          }

          locs.forEach((l) => (l.isPosted = true));

          const cost = locs.length * 20;
          user.wallet = Math.max((user.wallet || 0) - cost, 0);
          await user.save();

          log("SUCCESS", "GMB posted & wallet updated", {
            cost,
            wallet: user.wallet,
          });
        } catch (err) {
          log("ERROR", "GMB post failed", {
            postId,
            accountId,
            error: err.message,
          });
          post.status = "failed";
          post.error = err.message;
          failed = true;
          break;
        }
      }

      /* ---------- FINAL STATUS ---------- */
      if (!failed) {
        post.status = post.locations.every((l) => l.isPosted)
          ? "posted"
          : "scheduled";
        post.error = null;
        if (post.status === "posted") stats.posted++;
        log("SUCCESS", "Post finalized", { postId, status: post.status });
      } else {
        stats.failed++;
      }

      await post.save();
      stats.processed++;
    }

    return NextResponse.json({ success: true, stats, logs: debugLogs });

  } catch (err) {
    log("CRASH", "Cron crashed", err.stack);
    return NextResponse.json({
      success: false,
      error: err.message,
      logs: debugLogs,
    });
  }
}
