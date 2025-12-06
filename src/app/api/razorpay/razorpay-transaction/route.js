import dbConnect from "@/lib/dbConnect";
import RazorpayTransaction from "@/models/RazorpayTransaction";
import User from "@/models/User"; // <-- Add this import

export async function POST(req) {
  await dbConnect();

  try {
    const { userId, payment, amount, gstAmount, totalAmount, gstin } =
      await req.json();

    if (!userId || !payment || !amount || !totalAmount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      payment;

    const newTransaction = new RazorpayTransaction({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount,
      gstAmount,
      totalAmount,
      gstin: gstin || "",
    });

    await newTransaction.save();

    return new Response(
      JSON.stringify({ success: true, message: "Transaction saved successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving Razorpay transaction:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
}


export async function GET(req) {
  await dbConnect();

  try {
    // 1️⃣ Get all transactions
    const transactions = await RazorpayTransaction.find().sort({ createdAt: -1 });

    // 2️⃣ Prepare array with user details inside each transaction
    const finalData = [];

    for (const tx of transactions) {
      const user = await User.findOne(
        { userId: tx.userId },
        { fullName: 1, email: 1, wallet: 1, _id: 0 }
      );

      finalData.push({
        ...tx.toObject(),
        user: user || null, // attach user details
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalTransactions: finalData.length,
        transactions: finalData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
