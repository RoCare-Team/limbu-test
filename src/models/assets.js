import mongoose from "mongoose";

const AssetsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },   // 🔥 added
    colourPalette: String,
    size: String,
    characterImage: String,
    uniformImage: String,
    productImage: String,
    backgroundImage: String,
    logoImage: String,
  },
  { timestamps: true }
);

export default mongoose.models.Assets || mongoose.model("Assets", AssetsSchema);
