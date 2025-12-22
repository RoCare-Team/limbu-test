import mongoose from "mongoose";

const AssetsDropdownValueSchema = new mongoose.Schema(
  {
    type: {
      type: Number, // 1 = size, 2 = color
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    colors: {
      type: [String], // only for color palettes
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.assetsDropdownValue ||
  mongoose.model("assetsDropdownValue", AssetsDropdownValueSchema);
