import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ================================
// 🔵 1) DATABASE CONNECTION
// ================================
async function dbConnect() {
  if (mongoose.connection.readyState === 1) return;

  return mongoose.connect(process.env.MONGODB_URI, {
    dbName: "test",
  });
}

// ================================
// 🔵 2) SCHEMA + MODEL
// ================================
const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "contactForm",
  }
);

const Contact =
  mongoose.models.contactForm || mongoose.model("contactForm", ContactSchema);

// ================================
// 🔵 3) POST API → SAVE DATA
// ================================
export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, phone, message } = await request.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const saved = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Message saved successfully.",
      data: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ================================
// 🔵 4) GET API → FETCH ALL DATA
// ================================
export async function GET() {
  try {
    await dbConnect();

    const data = await Contact.find().sort({ createdAt: -1 }); // latest first

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
