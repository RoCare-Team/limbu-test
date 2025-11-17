import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // ✅ remove unique:true
    aiOutput: { type: String }, // AI image URL
    description:{type: String},
    status: {
      type: String,
      enum: ["pending", "approved", "scheduled","posted"],
      default: "pending",
    },
    scheduledDate: { type: Date },
  },
  { timestamps: true }
);


export default mongoose.models.Post || mongoose.model("Post", PostSchema);
