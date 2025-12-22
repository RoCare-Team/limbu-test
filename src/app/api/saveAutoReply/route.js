import dbConnect from "@/lib/dbConnect";
import AutoReply from "@/models/AutoReply";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  const { userId, refreshToken, locations, autoReply } = body;

  // Construct update object to avoid overwriting refreshToken with null if not provided
  const updateData = { locations, autoReply, updatedAt: new Date() };
  if (refreshToken) {
    updateData.refreshToken = refreshToken;
  }

  await AutoReply.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}
