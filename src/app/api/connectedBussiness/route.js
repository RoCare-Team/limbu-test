import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("yourdbname");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" });

    // 1) Find the main user in test.users
    const mainUser = await db.collection("test.users").findOne({ userId });

    if (!mainUser) {
      return NextResponse.json({
        connected: false,
        count: 0,
        list: []
      });
    }

    // 2) Now match same email in gmb_dashboard.users
    const connections = await db.collection("gmb_dashboard.users").find({
      email: mainUser.email
    }).toArray();

    const count = connections.length;

    return NextResponse.json({
      connected: count > 0,
      count,
      list: connections
    });

  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
