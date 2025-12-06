import mongoose from "mongoose";


const PostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // ✅ remove unique:true
    aiOutput: { type: String }, // AI image URL
    description:{type: String},
    promat:{type:String},

    status: {
      type: String,
      enum: ["pending", "approved", "scheduled","posted","rejected"],
      default: "pending",
    },
    scheduledDate: { type: Date },
    rejectReason: { type: String, default: "" },

  },
  { timestamps: true }
);


export default mongoose.models.Post || mongoose.model("Post", PostSchema);
