import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FacebookPage from "@/models/FacebookPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await FacebookPage.deleteMany({
    userId: session.user.id,
    platform: "facebook",
  });

  return NextResponse.json({ success: true });
}
