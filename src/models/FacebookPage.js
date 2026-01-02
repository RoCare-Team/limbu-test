import mongoose from "mongoose";

const FacebookPageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    pageId: { type: String, required: true },
    pageName: String,
    pageAccessToken: String,
    platform: { type: String, default: "facebook" },
  },
  { timestamps: true }
);

FacebookPageSchema.index({ userId: 1, pageId: 1 }, { unique: true });

export default mongoose.models.FacebookPage ||
  mongoose.model("FacebookPage", FacebookPageSchema);
