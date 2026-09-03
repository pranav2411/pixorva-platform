import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency, receipt, notes, isSubscription = true } = body;

    // Validation: Check minimum amount (100 paise = ₹1)
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount. Minimum 100 paise required." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured on server." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (isSubscription) {
      // 1. Create a Plan dynamically
      const rawName = notes?.agentName || "AI Employee";
      const cleanName = rawName.split('(')[0].trim();
      const plan = await razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: `${cleanName} - Monthly Subscription`,
          amount: Math.round(amount),
          currency: currency || "INR"
        }
      });

      // 2. Create a Subscription dynamically
      const subscription = await razorpay.subscriptions.create({
        plan_id: plan.id,
        customer_notify: 1,
        total_count: 60, // 5 years monthly duration
        notes: notes || {}
      });

      return NextResponse.json({
        subscription_id: subscription.id,
        amount: amount,
        currency: currency || "INR"
      });
    } else {
      // One-time order fallback
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
    }
  } catch (err: any) {
    console.error("Razorpay order/subscription creation error:", err);
    const errorMsg = err.error?.description || err.message || "Failed to create Razorpay item";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
