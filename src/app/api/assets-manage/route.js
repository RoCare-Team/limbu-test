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
// Helper → Upload Image
// -------------------------------
const uploadToCloud = async (url, folder) => {
  if (!url || !url.trim()) return null;

  const uploaded = await cloudinary.uploader.upload(url, {
    folder,
    resource_type: "image",
  });

  return uploaded.secure_url;
};

// -------------------------------
// Helper → Update Images Only If Provided
// -------------------------------
const processImage = async (incoming, existing, folder) => {
  return incoming ? await uploadToCloud(incoming, folder) : existing;
};

// -------------------------------
// POST → Create Asset
// -------------------------------
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      userId,
      colourPalette,
      size,
      characterImage,
      uniformImage,
      productImage,
      backgroundImage,
      logoImage,
    } = body;

    if (!userId) {
      return Response.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const saved = await Assets.create({
      userId,
      colourPalette,
      size,
      characterImage: await uploadToCloud(characterImage, "ai_assets/character"),
      uniformImage: await uploadToCloud(uniformImage, "ai_assets/uniform"),
      productImage: await uploadToCloud(productImage, "ai_assets/product"),
      backgroundImage: await uploadToCloud(backgroundImage, "ai_assets/background"),
      logoImage: await uploadToCloud(logoImage, "ai_assets/logo"),
    });

    return Response.json(
      { success: true, message: "Asset created", data: saved },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// -------------------------------
// GET → Fetch All / By User
// -------------------------------
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const query = userId ? { userId } : {};
    const results = await Assets.find(query).sort({ createdAt: -1 });

    return Response.json(
      { success: true, data: results },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// -------------------------------
// PUT → Update Asset
// -------------------------------
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      id,
      colourPalette,
      size,
      characterImage,
      uniformImage,
      productImage,
      backgroundImage,
      logoImage,
    } = body;

    if (!id)
      return Response.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );

    const existing = await Assets.findById(id);
    if (!existing)
      return Response.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );

    const updated = await Assets.findByIdAndUpdate(
      id,
      {
        colourPalette: colourPalette ?? existing.colourPalette,
        size: size ?? existing.size,
        characterImage: await processImage(
          characterImage,
          existing.characterImage,
          "ai_assets/character"
        ),
        uniformImage: await processImage(
          uniformImage,
          existing.uniformImage,
          "ai_assets/uniform"
        ),
        productImage: await processImage(
          productImage,
          existing.productImage,
          "ai_assets/product"
        ),
        backgroundImage: await processImage(
          backgroundImage,
          existing.backgroundImage,
          "ai_assets/background"
        ),
        logoImage: await processImage(
          logoImage,
          existing.logoImage,
          "ai_assets/logo"
        ),
        updatedAt: new Date(),
      },
      { new: true }
    );

    return Response.json(
      { success: true, message: "Asset updated", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// -------------------------------
// DELETE → Remove Asset
// -------------------------------
export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return Response.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );

    const deleted = await Assets.findByIdAndDelete(id);

    if (!deleted)
      return Response.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );

    return Response.json(
      { success: true, message: "Asset deleted", data: deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
