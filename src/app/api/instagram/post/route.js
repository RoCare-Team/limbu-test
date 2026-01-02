import axios from "axios";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import InstagramPage from "@/models/InstagramPage";

export async function POST(req) {
  await dbConnect();

  const { userId, igId, imageUrl, caption } = await req.json();

  const ig = await InstagramPage.findOne({ userId, igId });
  if (!ig) throw new Error("Instagram not connected");

  // 1️⃣ Create media
  const mediaRes = await axios.post(
    `https://graph.facebook.com/v24.0/${igId}/media`,
    {
      image_url: imageUrl,
      caption,
      access_token: ig.pageAccessToken,
    }
  );

  // 2️⃣ Publish media
  await axios.post(
    `https://graph.facebook.com/v24.0/${igId}/media_publish`,
    {
      creation_id: mediaRes.data.id,
      access_token: ig.pageAccessToken,
    }
  );

  return NextResponse.json({ success: true });
}
