import { NextResponse } from "next/server"; // ✅ MISSING IMPORT
import dbConnect from "@/lib/dbConnect";
import ServiceBooking from "@/models/ServiceBooking";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, message: "Request body is empty" },
        { status: 400 }
      );
    }

    const booking = await ServiceBooking.create(body);

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Service Booking Error:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
