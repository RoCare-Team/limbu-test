import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      required: true 
    },

    // credit = add coins
    // debit = deduct coins
    type: { 
      type: String, 
      enum: ["credit", "debit"], 
      required: true 
    },

    amount: { 
      type: Number, 
      required: true 
    }, // always positive number

    balanceAfter: { 
      type: Number, 
      required: true 
    },

    // WHY the transaction happened?
   reason: {
  type: String,
  default: "other",
},


    // Extra info (everything dynamic)
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent model compile errors
export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
