import mongoose from "mongoose";

const FranchiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    city: {
      type: String,
      required: [true, "Please provide a city"],
    },
    experience: {
      type: String,
      required: [true, "Please provide experience details"],
    },
    investment: {
      type: String,
      required: [true, "Please provide investment capacity"],
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Franchise || mongoose.model("Franchise", FranchiseSchema);