import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    videoUrl: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
