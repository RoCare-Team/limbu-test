import mongoose from "mongoose";

const FacebookPageSchema = new mongoose.Schema(
  {
    userId: String,
    pageId: String,
    pageName: String,
    pageAccessToken: String,
    platform: { type: String, default: "facebook" },
  },
  { timestamps: true }
);

export default mongoose.models.FacebookPage ||
  mongoose.model("FacebookPage", FacebookPageSchema);
