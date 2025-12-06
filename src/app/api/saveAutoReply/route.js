import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  const { userId, accessToken, locations, autoReply } = body;

  await AutoReply.findOneAndUpdate(
    { userId },
    { accessToken, locations, autoReply, updatedAt: new Date() },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
