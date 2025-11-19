import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await dbConnect();

    // Check if subadmin exists
    const existingAdmin = await Admin.findOne({ email: "hanish@gmail.com" });
    if (existingAdmin) {
      return NextResponse.json({ message: "Sub Admin already exists" }, { status: 200 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("hanish@123", 10);

    // Create Sub Admin
    await Admin.create({
      fullName: "Sub Admin",
      email: "hanish@gmail.com",
      password: hashedPassword,
      role: "subadmin",
    });

    return NextResponse.json({ message: "Sub Admin created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating subadmin:", error);
    return NextResponse.json({ error: "Failed to create subadmin" }, { status: 500 });
  }
}
