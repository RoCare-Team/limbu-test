import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User"; // Update based on your schema

export async function POST(req) {
  try {
    await dbConnect();

    const { destination, templateParams } = await req.json();

    if (!destination || !templateParams) {
      return NextResponse.json(
        { success: false, message: "destination & templateParams are required" },
        { status: 400 }
      );
    }


    // FIXED PAYLOAD FOR AISENSY
    const payload = {
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzZhOWFjMTNhNjFmMGQ3YjExYmQ1NCIsIm5hbWUiOiJMaW1idUFJIiwiYXBwTmFtZSI6IkFpU2Vuc3kiLCJjbGllbnRJZCI6IjY2NjhhNWZmYTNhMzhjNTJhMDVmZDYzOCIsImFjdGl2ZVBsYW4iOiJGUkVFX0ZPUkVWRVIiLCJpYXQiOjE3NjUxOTAwNjB9.Xps-oRJ5QqgkCs5BaBuPd1KS9Yxnv4D2PCYB-g5zgr4",

      campaignName: "welcome_bonus",
      destination,
      userName: "LimbuAI",
      templateParams,
      source: "new-landing-page form",
      media: {},
      buttons: [],
      carouselCards: [],
      location: {},
      attributes: {},
      paramsFallbackValue: { FirstName: "user" },
    };

    // AISENSY URL
    const API_URL = "https://backend.aisensy.com/campaign/t1/api/v2";

    // SEND REQUEST TO AISENSY
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: payload.apiKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return NextResponse.json(
      {
        success: true,
        alreadyExists: false,
        message: "Message sent successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
