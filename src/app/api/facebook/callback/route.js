import axios from "axios";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FacebookPage from "@/models/FacebookPage";

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state"); // 🔥 FROM LOGIN

    if (!code || !userId) {
      throw new Error("Missing code or userId");
    }

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

    console.log("tokenRestokenRes",tokenRes);
    

    const userToken = tokenRes.data.access_token;
    console.log("userTokenuserToken",userToken);
    

    // 2️⃣ Fetch pages
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v24.0/me/accounts",
      { params: { access_token: userToken } }
    );

    console.log("pagesRespagesRes",pagesRes);
    

    // 3️⃣ Clear old pages
    await FacebookPage.deleteMany({
      userId,
      platform: "facebook",
    });

    // 4️⃣ Save pages
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
    console.error("FB CALLBACK ERROR:", err.message);
    return NextResponse.redirect(
      `${process.env.BASE_URL}/dashboard?fb=error`
    );
  }
}
