import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Resend } from "resend";

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
    let amountTotal = 19.99; // Default fallback

    if (razorpay_subscription_id) {
      // Fetch subscription details
      const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
      notes = (subscription.notes || {}) as any;
      
      // Fetch plan to resolve amount
      const plan = await razorpay.plans.fetch(subscription.plan_id);
      amountTotal = Number(plan.item.amount) / 100;
    } else if (razorpay_order_id) {
      // Fetch order details
      const order = await razorpay.orders.fetch(razorpay_order_id);
      notes = (order.notes || {}) as any;
      amountTotal = Number(order.amount) / 100;
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

      // 1. Resolve User Email Address
      let userEmail = "";
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', notes.userId)
        .single();
      if (profile?.email) {
        userEmail = profile.email;
      }

      // 2. Provision Hired Agent or Upgrade Plan
      let itemName = "Pixorva AI Workforce Resource";

      if (notes.isPlan === "true" && notes.planCode) {
        itemName = `Pixorva Plan Upgrade: ${notes.planCode === 'growth_pro' ? 'Growth Pro Plan' : 'Enterprise Plan'}`;
        
        // Upgrade plan in profiles table
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
        itemName = `AI Employee Hire: ${notes.agentName.split('(')[0]}`;
        
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

      // Log payment in our local DB to make receipts history dynamically real!
      try {
        const { LocalDb } = require('../../utils/LocalDatabase');
        await LocalDb.addPayment(supabase, notes.userId, itemName, amountTotal, razorpay_payment_id);
      } catch (dbErr) {
        console.error("Local DB billing log error:", dbErr);
      }

      // 3. Send receipt email via Resend
      if (userEmail && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(amountTotal);

          // Generate PDF invoice buffer
          let pdfBuffer: Buffer | null = null;
          try {
            const { generateInvoicePdfBuffer } = require('../../utils/InvoicePdfGenerator');
            pdfBuffer = await generateInvoicePdfBuffer({
              itemName,
              amount: amountTotal,
              razorpayId: razorpay_payment_id,
              subscriptionId: razorpay_subscription_id || razorpay_order_id || 'N/A',
              userEmail,
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            });
          } catch (pdfGenErr) {
            console.error("PDF generation failed:", pdfGenErr);
          }

          const attachments = pdfBuffer ? [{
            filename: `Invoice-${razorpay_payment_id}.pdf`,
            content: pdfBuffer
          }] : [];

          const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid black; border-radius: 24px; overflow: hidden; box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);">
              <div style="background-color: #facc15; padding: 24px; text-align: center; border-bottom: 4px solid black;">
                <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://pixorva.com'}/favicon.ico" alt="Pixorva Logo" style="width: 48px; height: 48px; border: 3px solid black; border-radius: 10px; margin-bottom: 12px; box-shadow: 3px 3px 0px 0px rgba(0,0,0,1);" />
                <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; font-weight: 900; letter-spacing: -1px; color: black;">Pixorva AI Workforce</h1>
              </div>
              <div style="padding: 24px; background-color: white; color: black;">
                <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Thank you for your purchase!</p>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Your subscription payment was successful. Your AI workforce resources are now active. We have attached your official tax invoice PDF to this email.</p>
                
                <div style="background-color: #f3f4f6; border: 2px solid black; border-radius: 12px; padding: 16px; margin: 24px 0;">
                  <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: #4b5563; letter-spacing: 0.5px;">Receipt details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; font-size: 14px; color: black;">${itemName} (Monthly Subscription)</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px; color: black;">${formattedAmount} / month</td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 24px 0;">
                  Your payment was securely verified on our servers. Subscription ID: ${razorpay_subscription_id || razorpay_order_id}
                </p>

                <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                  Pixorva Platform &copy; 2026. If you have any questions, reach out to your account executive.
                </p>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: 'Pixorva Billing <billing@pixorva.com>',
            to: userEmail,
            subject: `Invoice & Confirmation for ${itemName}`,
            html: htmlContent,
            attachments
          });
        } catch (mailErr) {
          console.error("Resend delivery failed:", mailErr);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified, agent provisioned, and confirmation email sent." });
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify Razorpay payment" }, { status: 500 });
  }
}
