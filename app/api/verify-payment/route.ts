import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = body;

    // Validation: Missing fields
    if ((!razorpay_order_id && !razorpay_subscription_id) || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required verification fields." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured on server." }, { status: 500 });
    }

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    if (razorpay_subscription_id) {
      // Subscription Verification format: payment_id + "|" + subscription_id
      hmac.update(razorpay_payment_id + "|" + razorpay_subscription_id);
    } else {
      // Order Verification format: order_id + "|" + payment_id
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    }
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Signature mismatch. Verification failed." }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    let notes: any = {};

    if (razorpay_subscription_id) {
      // Fetch subscription from Razorpay to read notes securely
      const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
      notes = (subscription.notes || {}) as any;
    } else if (razorpay_order_id) {
      // Fetch order from Razorpay to read notes securely
      const order = await razorpay.orders.fetch(razorpay_order_id);
      notes = (order.notes || {}) as any;
    }

    if (notes && notes.userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {
              // Ignore cookie writing in API routes
            }
          },
        },
      });

      if (notes.isPlan === "true" && notes.planCode) {
        // Upgrade plan in profiles
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: notes.userId,
            plan: notes.planCode
          });

        if (updateError) {
          console.error("Failed to update plan on Razorpay verification:", updateError.message);
          return NextResponse.json({ error: "Payment verified, but plan update failed." }, { status: 500 });
        }
      } else if (notes.agentName) {
        // Provision hired agent record in the agents table
        const { error: insertError } = await supabase.from('agents').insert({
          user_id: notes.userId,
          name: notes.agentName,
          icon: notes.icon || "Zap",
          steps: notes.steps ? JSON.parse(notes.steps) : [],
          schedule: 'Manual',
          is_paid_individually: true
        });

        if (insertError) {
          console.error("Failed to provision hired agent on Razorpay verification:", insertError);
          return NextResponse.json({ error: "Payment verified, but provisioning failed." }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified and agent provisioned." });
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify Razorpay payment" }, { status: 500 });
  }
}
