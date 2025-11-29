import { v2 as cloudinary } from "cloudinary";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✔ Function to upload URL image → Cloudinary
async function uploadToCloudinary(url, folder) {
  if (!url) return null;

  const upload = await cloudinary.uploader.upload(url, {
    folder,
    resource_type: "image",
  });

  return upload.secure_url;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      topic,
      colourPalette,
      size,
      characterImage,
      uniformImage,
      productImage,
      backgroundImage,
      logoImage,
    } = body;

    console.log("Uploading assets to Cloudinary...");

    // ✔ Upload each image → Cloudinary
    const uploadedCharacter = await uploadToCloudinary(characterImage, "ai_agent_assets/character");
    const uploadedUniform = await uploadToCloudinary(uniformImage, "ai_agent_assets/uniform");
    const uploadedProduct = await uploadToCloudinary(productImage, "ai_agent_assets/product");
    const uploadedBackground = await uploadToCloudinary(backgroundImage, "ai_agent_assets/background");
    const uploadedLogo = await uploadToCloudinary(logoImage, "ai_agent_assets/logo");

    console.log("All uploads completed!");

    // ✔ New payload for n8n
    const newPayload = {
      topic,
      colourPalette,
      size,
      characterImage: uploadedCharacter,
      uniformImage: uploadedUniform,
      productImage: uploadedProduct,
      backgroundImage: uploadedBackground,
      logoImage: uploadedLogo,
    };

    console.log("Forwarding to n8n...");

    // ✔ Send request to n8n webhook
    const n8nResponse = await fetch(
      "https://n8n.limbutech.in/webhook/6678555b-a0a2-4cbf-b157-7d0f831bd51c",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayload),
      }
    );

    const finalData = await n8nResponse.json();

    return new Response(JSON.stringify({ success: true, data: finalData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
