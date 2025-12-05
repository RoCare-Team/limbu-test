import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ------------------------------------
// 1) DB CONNECTION
// ------------------------------------
async function dbConnect() {
  if (mongoose.connection.readyState === 1) return;

  return mongoose.connect(process.env.MONGODB_URI, {
    dbName: "demoBookingDB",
  });
}

// ------------------------------------
// 2) SCHEMA + MODEL
// ------------------------------------
const DemoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    seminarTime: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "demoBookings",
  }
);

const DemoBooking =
  mongoose.models.demoBookings ||
  mongoose.model("demoBookings", DemoSchema);

// ------------------------------------
// 3) POST API → SAVE FORM DATA
// ------------------------------------
export async function POST(request) {
  try {
    await dbConnect();

    const { name, phone, seminarTime } = await request.json();

    if (!name || !phone || !seminarTime) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const saved = await DemoBooking.create({
      name,
      phone,
      seminarTime,
    });

    return NextResponse.json({
      success: true,
      message: "Demo booked successfully!",
      data: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ------------------------------------
// 4) GET API → FETCH ALL BOOKINGS
// ------------------------------------
export async function GET() {
  try {
    await dbConnect();

    const allBookings = await DemoBooking.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: allBookings.length,
      data: allBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
