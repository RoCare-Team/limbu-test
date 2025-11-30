import { v2 as cloudinary } from "cloudinary";

// -------------------------------
// Cloudinary Config
// -------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------------------
// Helper: Upload image to Cloudinary
// -------------------------------
async function uploadToCloudinary(imageUrl, folderName) {
  if (!imageUrl || imageUrl.trim() === "") return null; // Skip if empty

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
    const body = await req.json();

    const {
      colourPalette,
      size,
      characterImage,
      uniformImage,
      productImage,
      backgroundImage,
      logoImage,
    } = body;

    console.log("Uploading images (if provided)…");

    // Upload images to Cloudinary (optional fields)
    const finalCharacter = await uploadToCloudinary(characterImage, "ai_assets/character");
    const finalUniform = await uploadToCloudinary(uniformImage, "ai_assets/uniform");
    const finalProduct = await uploadToCloudinary(productImage, "ai_assets/product");
    const finalBackground = await uploadToCloudinary(backgroundImage, "ai_assets/background");
    const finalLogo = await uploadToCloudinary(logoImage, "ai_assets/logo");

    console.log("Upload complete!");

    // -------------------------------
    // FINAL GENERATED PAYLOAD
    // -------------------------------
    const resultPayload = {
      colourPalette,
      size,
      characterImage: finalCharacter,
      uniformImage: finalUniform,
      productImage: finalProduct,
      backgroundImage: finalBackground,
      logoImage: finalLogo,
    };

    return new Response(JSON.stringify({ success: true, data: resultPayload }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("API Error:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
