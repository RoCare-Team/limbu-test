import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import OTP from "@/models/Otp";
import axios from "axios";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mannubhai_secret";

export async function POST(req) {
  try {
    await dbConnect();
    const { phone, otp, name, email } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // ✅ Step 1: SEND OTP
    if (!otp) {
      const existingUser = await User.findOne({ phone });
      const generatedOtp = Math.floor(1000 + Math.random() * 9000);

      const msg = `Dear Customer, Your OTP for Limbu AI profile verification is ${generatedOtp}. Regards, Limbu AI`;
      const tmpid = "1007299270481342940";
      const key = "kD4WSoAW";
      const from = "TLGCRO";
      const entityid = "1401519300000012435";
      const encodedMsg = encodeURIComponent(msg);

      const url = `https://api.savshka.co.in/api/sms?key=${key}&from=${from}&to=${phone}&body=${encodedMsg}&entityid=${entityid}&templateid=${tmpid}`;


      await axios.get(url).catch(() => {
        throw new Error("Failed to send OTP via Savshka");
      });

      await OTP.findOneAndUpdate(
        { phone },
        { otp: generatedOtp, createdAt: new Date() },
        { upsert: true }
      );

      return NextResponse.json({
        message: "OTP sent successfully",
        isExistingUser: !!existingUser,
        status: 200
      });
    }

    // ✅ Step 2: VERIFY OTP
    const otpRecord = await OTP.findOne({ phone });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not sent yet. Please request a new one." },
        { status: 400 }
      );
    }

    const isExpired = (Date.now() - otpRecord.createdAt.getTime()) / 1000 / 60 > 5;
    if (isExpired) {
      return NextResponse.json(
        { error: "OTP expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.otp.toString() !== otp.toString()) {
      return NextResponse.json(
        { error: "OTP not correct. Please try again." },
        { status: 400 }
      );
    }

    // ✅ Step 3: Check user existence
    let user = await User.findOne({ phone });

    // For new users, ensure name + email provided
    if (!user && (!name || !email)) {
      return NextResponse.json({
        step: "collect_details",
        message: "New user — please provide name and email",
      });
    }

    // ✅ Step 4: Register new user if not exist
    if (!user) {
      // Check if email already used
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return NextResponse.json(
          { error: "This email address is already registered. Please use another one." },
          { status: 400 }
        );
      }

      user = await User.create({
        userId: `USR${Date.now()}`,
        fullName: name,
        email,
        phone,
        wallet: 500,
        freeUsedCount:2,

        subscription: {
          status: "inactive",
          plan: "Free",
          startDate: null,
          endDate: null,
        },
      });
    }

    // ✅ Delete OTP after successful verification
    await OTP.deleteOne({ phone });

    // ✅ Generate JWT (include subscription in payload)
    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
        fullName: user.fullName,
        phone: user.phone,
        subscription: user.subscription || {},
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Return token + user
    return NextResponse.json({
      message: "Login successful",
      token,
      user,
      redirectTo: user.subscription?.status === "active" ? "/dashboard" : "/subscription",
    });
  } catch (err) {
    console.error("OTP API Error:", err);

    // Handle duplicate email error from MongoDB (just in case)
    if (err.code === 11000 && err.keyPattern?.email) {
      return NextResponse.json(
        { error: "This email address is already registered. Please use another one." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
