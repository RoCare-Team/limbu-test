import axios from "axios";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FacebookPage from "@/models/FacebookPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  console.log("📌 Facebook Post API called");

  try {
    // 1️⃣ DB CONNECT
    console.log("🔌 Connecting to DB...");
    await dbConnect();
    console.log("✅ DB connected");

    // 2️⃣ SESSION CHECK
    const session = await getServerSession(authOptions);
    console.log("👤 Session:", session);

    if (!session || !session.user?.id) {
      console.error("❌ No valid session");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("🆔 User ID:", userId);

    // 3️⃣ REQUEST BODY
    const body = await req.json();
    console.log("📦 Request Body:", body);

    const { pageId, message } = body;

    if (!pageId || !message) {
      console.error("❌ Missing pageId or message");
      return NextResponse.json(
        { success: false, error: "pageId or message missing" },
        { status: 400 }
      );
    }

    // 4️⃣ FETCH PAGE FROM DB
    console.log("🔍 Fetching Facebook Page from DB...");
    const page = await FacebookPage.findOne({ userId, pageId });

    console.log("📄 Page Found:", page);

    if (!page) {
      console.error("❌ Page not found for user");
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 403 }
      );
    }

    // 5️⃣ POST TO FACEBOOK
    console.log("🚀 Posting to Facebook...");
    console.log("➡️ Page ID:", pageId);
    console.log("➡️ Access Token Exists:", !!page.pageAccessToken);

    const fbResponse = await axios.post(
      `https://graph.facebook.com/v24.0/${pageId}/feed`,
      {
        message,
        published: true, // REQUIRED for public post
        access_token: "EAALZCcWoGmZCkBQUqSg2ncMPYMRB7dITF3L2bmV5hBvndNuCWoJbRM0skPomUS77gPvIPoZAqZB31CAU1Feq7Pj7DEAJl9b7vvAugfHjnhejAYPJDGkyVSeetAG5JqTLUqNCt0MaOzD7Lkq4z3zKnOliqmPTT1453j6dEOBIPn5KUQDYbQAe2piQUg0k7iHX8zGSJkuX",
      }
    );

    console.log("✅ Facebook Response:", fbResponse.data);

    return NextResponse.json({
      success: true,
      facebookResponse: fbResponse.data,
    });

  } catch (err) {
    console.error("🔥 Facebook Post Error");

    if (err.response) {
      console.error("❌ FB Error Status:", err.response.status);
      console.error("❌ FB Error Data:", err.response.data);
    } else {
      console.error("❌ Error Message:", err.message);
    }

    return NextResponse.json(
      {
        success: false,
        error: err.response?.data || err.message,
      },
      { status: 500 }
    );
  }
}
