// app/api/subscribe/verify/route.js
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  await dbConnect();
  

  try {
    const { userId, plan, payment } = await req.json();

    if (!userId || !plan || !payment) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;

    // ✅ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid signature" }),
        { status: 400 }
      );
    }

    // 🔹 Query using custom userId field
    const user = await User.findOne({ userId }); // <--- use userId, not _id
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404 }
      );
    }

    // ✅ Update subscription

     const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + 3); 
    user.subscription = {
      plan,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
     date: purchaseDate,
      expiry: expiryDate,      status: "active",
    };
    await user.save();

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and plan activated" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Verification failed" }),
      { status: 500 }
    );
  }
}
