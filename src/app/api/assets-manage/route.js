import dbConnect from "@/lib/dbConnect";
import Assets from "@/models/assets";

/* --------------------------------
   POST → Create Asset (Base64)
--------------------------------- */
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
      characterImage,     // base64
      uniformImage,       // base64
      productImage,       // base64
      backgroundImage,    // base64
      logoImage,          // base64
    });

    return Response.json(
      { success: true, message: "Asset created", data: saved },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* --------------------------------
   GET → Fetch Assets
--------------------------------- */
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
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* --------------------------------
   PUT → Update Asset (Base64)
--------------------------------- */
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

    if (!id) {
      return Response.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }

    const existing = await Assets.findById(id);
    if (!existing) {
      return Response.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    const updated = await Assets.findByIdAndUpdate(
      id,
      {
        colourPalette: colourPalette ?? existing.colourPalette,
        size: size ?? existing.size,
        characterImage: characterImage ?? existing.characterImage,
        uniformImage: uniformImage ?? existing.uniformImage,
        productImage: productImage ?? existing.productImage,
        backgroundImage: backgroundImage ?? existing.backgroundImage,
        logoImage: logoImage ?? existing.logoImage,
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
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* --------------------------------
   DELETE → Clear One Field
--------------------------------- */
export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const field = searchParams.get("field");

    if (!id || !field) {
      return Response.json(
        { success: false, error: "id & field are required" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "characterImage",
      "uniformImage",
      "productImage",
      "backgroundImage",
      "logoImage",
      "size",
      "colourPalette",
    ];

    if (!allowedFields.includes(field)) {
      return Response.json(
        { success: false, error: "Invalid field" },
        { status: 400 }
      );
    }

    const updated = await Assets.findByIdAndUpdate(
      id,
      { $set: { [field]: "" } },
      { new: true }
    );

    if (!updated) {
      return Response.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: `${field} removed successfully`,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
