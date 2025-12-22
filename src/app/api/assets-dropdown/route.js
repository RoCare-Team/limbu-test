import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AssetsDropdownValue from "@/models/AssetsDropdownValue";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");

    // ❌ type missing
    if (!typeParam) {
      return NextResponse.json(
        { success: false, message: "type is required" },
        { status: 400 }
      );
    }

    const type = Number(typeParam);

    // ❌ invalid type
    if (![1, 2].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid type. Use 1 or 2." },
        { status: 400 }
      );
    }

    // ✅ fetch data
    const data = await AssetsDropdownValue.find({
      type,
      isActive: { $ne: false }, // backward compatibility
    })
      .select("label value colors type") // clean response
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("assets-dropdown error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
