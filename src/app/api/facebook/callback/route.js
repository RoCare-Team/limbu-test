import axios from "axios";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FacebookPage from "@/models/FacebookPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.BASE_URL}/login`);
    }

    const userId = session.user.id;
    const code = new URL(req.url).searchParams.get("code");

    // 1️⃣ Exchange code → user token
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v24.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: `${process.env.BASE_URL}/api/facebook/callback`,
          code,
        },
      }
    );

    const userToken = tokenRes.data.access_token;

    // 2️⃣ Fetch pages
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v24.0/me/accounts",
      { params: { access_token: userToken } }
    );

    // ❗ Remove old Facebook pages for this user
    await FacebookPage.deleteMany({
      userId,
      platform: "facebook",
    });

    // 3️⃣ Save ALL pages (user-specific)
    for (const page of pagesRes.data.data) {
      await FacebookPage.create({
        userId,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        platform: "facebook",
      });
    }

    return NextResponse.redirect(
      `${process.env.BASE_URL}/dashboard?fb=connected`
    );
  } catch (err) {
    console.error("FB CALLBACK ERROR:", err.response?.data || err.message);
    return NextResponse.redirect(
      `${process.env.BASE_URL}/dashboard?fb=error`
    );
  }
}
