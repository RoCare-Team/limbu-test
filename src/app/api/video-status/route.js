import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/videoModels";

// -----------------------------
// SAVE VIDEO (POST)
// -----------------------------
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userId, videoUrl } = body;

    if (!userId || !videoUrl) {
      return NextResponse.json({
        success: false,
        error: "userId and videoUrl are required",
      });
    }

    const newVideo = await Video.create({
      userId,
      videoUrl,
      status: "pending", // default
    });

    return NextResponse.json({ success: true, data: newVideo });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// -----------------------------
// GET VIDEO BY USERID (GET)
// -----------------------------
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "userId query param is required",
      });
    }

    const videos = await Video.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: videos });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { id, status } = body;

    // 1. Check required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Video ID (id) is required",
      });
    }

    if (!status) {
      return NextResponse.json({
        success: false,
        error: "Status is required",
      });
    }

    // 2. Allowed statuses only
    const allowedStatuses = ["pending", "approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: "Invalid status value",
      });
    }

    // 3. Update only status
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedVideo) {
      return NextResponse.json({
        success: false,
        error: "Video not found",
      });
    }

    return NextResponse.json({ success: true, data: updatedVideo });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
