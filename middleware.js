import { NextResponse } from "next/server";

export async function middleware(req) {
  // ✅ Allow everything, no validation
  return NextResponse.next();
}

// ✅ Apply middleware to these routes
export const config = {
  matcher: ["/admin/:path*", "/adminLogin/:path*"],
};
