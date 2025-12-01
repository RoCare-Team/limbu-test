import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/dbConnect";
import Assets from "@/models/assets";

// -------------------------------
// Cloudinary Config
// -------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------------------
// Helper: Upload to Cloudinary
// -------------------------------
async function uploadToCloudinary(imageUrl, folderName) {
  if (!imageUrl || imageUrl.trim() === "") return null;

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: folderName,
    resource_type: "image",
  });

  return result.secure_url;
}

// -------------------------------
// MAIN API FUNCTION
// -------------------------------
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      userId,                  // 🔥 required field
      colourPalette,
      size,
      characterImage,
      uniformImage,
      productImage,
      backgroundImage,
      logoImage,
    } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userId is required" }),
        { status: 400 }
      );
    }

    console.log("Uploading images…");

    const finalCharacter = await uploadToCloudinary(characterImage, "ai_assets/character");
    const finalUniform = await uploadToCloudinary(uniformImage, "ai_assets/uniform");
    const finalProduct = await uploadToCloudinary(productImage, "ai_assets/product");
    const finalBackground = await uploadToCloudinary(backgroundImage, "ai_assets/background");
    const finalLogo = await uploadToCloudinary(logoImage, "ai_assets/logo");

    // Save in DB
    const savedData = await Assets.create({
      userId,                                  // 🔥 save user id
      colourPalette,
      size,
      characterImage: finalCharacter,
      uniformImage: finalUniform,
      productImage: finalProduct,
      backgroundImage: finalBackground,
      logoImage: finalLogo,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Saved to DB", data: savedData }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}


// 
export async function GET(req) {
  try {
    await connectDB();

    // Get search params (example: /api/assets?userId=123)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let results;

    if (userId) {
      // Fetch assets for a specific user
      results = await Assets.find({ userId }).sort({ createdAt: -1 });
    } else {
      // Fetch all assets
      results = await Assets.find().sort({ createdAt: -1 });
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("GET API Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
