import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ServiceBooking from "@/models/ServiceBooking";

// ✅ CREATE SERVICE BOOKING
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

// ✅ GET ALL SERVICE BOOKINGS
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const planType = searchParams.get("planType");

    const query = {};
    if (planType) query.planType = planType;

    const bookings = await ServiceBooking
      .find(query)
      .sort({ createdAt: -1 }); // latest first

    return NextResponse.json(
      { success: true, data: bookings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Service Bookings Error:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
