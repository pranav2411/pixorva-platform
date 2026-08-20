import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency, receipt, notes } = body;

    // Validation: Check minimum amount
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount. Minimum 100 paise required." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Error: Missing keys
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured on server." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create Razorpay order" }, { status: 500 });
  }
}
