// models/FbLeadsData.js
import mongoose from "mongoose";

const FbLeadsDataSchema = new mongoose.Schema(
  {
    type: { type: String },       // leadgen / whatsapp / unknown
    leadId: { type: String },
    formId: { type: String },
    payload: { type: Object },    // store raw data
    messageFrom: { type: String },
    messageText: { type: String },
  },
  { timestamps: true }
);

// Avoid model overwrite error
export default mongoose.models.FbLeadsData ||
  mongoose.model("FbLeadsData", FbLeadsDataSchema);
