import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FacebookPage from "@/models/FacebookPage";
import InstagramPage from "@/models/InstagramPage";

export async function GET() {
  await dbConnect();

  const pages = await InstagramPage.find({ platform: "instagram" }).sort({
    createdAt: -1,
  });

  console.log("pagespagespages",pages);
  

  return NextResponse.json({ success: true, pages });
}
