import jwt from "jsonwebtoken";
import User from "@/models/User";
import GmbUser from "@/models/GmbUser";
import connectDB from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = await req.json();

    // 1️⃣ ADMIN TOKEN CHECK
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Admin token missing" }, { status: 401 });
    }

    const adminToken = authHeader.split(" ")[1];
    if (adminToken !== process.env.ADMIN_MASTER_TOKEN) {
      return Response.json({ error: "Invalid admin token" }, { status: 401 });
    }

    // 2️⃣ OTP USER
    const otpUser = await User.findOne({ userId }).lean();
    if (!otpUser) {
      return Response.json({ error: "OTP user not found" }, { status: 404 });
    }

    // 3️⃣ GMB USER (EMAIL MATCH)
    const gmbUser = await GmbUser.findOne({ email: otpUser.email }).lean();

    let googleData = null;
    let googleProjects = [];

    if (gmbUser) {
      googleData = gmbUser;                  // पूरा GMB user object
      googleProjects = gmbUser.projects || []; // सारे projects
    }

    // 4️⃣ JWT TOKEN
    const secret = process.env.JWT_SECRET || "fallback-secret-key";

    const userToken = jwt.sign(
      {
        userId: otpUser.userId,
        email: otpUser.email,
        role: "user",
        impersonated: true,
      },
      secret,
      { expiresIn: "6h" }
    );

    // 5️⃣ FINAL MERGED RESPONSE
    return Response.json({
      success: true,
      message: "User impersonated successfully",
      token: userToken,

      user: {
        ...otpUser,         // OTP USER DATA
        gmbData: googleData, // पूरा GMB user object
        gmbProjects: googleProjects // सारे projects tokens
      }
    });

  } catch (err) {
    console.log("ERROR in login-as-user:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
