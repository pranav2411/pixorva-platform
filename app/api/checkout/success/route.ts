import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover', 
});

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // 1. Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Fetch the invoice details if available (Stripe generates this automatically)
    let invoicePdf = null;
    if (session.invoice) {
      const invoice = await stripe.invoices.retrieve(session.invoice as string);
      invoicePdf = invoice.invoice_pdf;
    }

    // 3. Resolve user email address from profile
    let userEmail = session.customer_details?.email;
    if (!userEmail && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      if (profile?.email) userEmail = profile.email;
    }

    if (!userEmail) {
      console.warn("Could not find email address for checkout receipt");
      return NextResponse.json({ success: true, message: "No email resolved" });
    }

    // 4. Extract amount and purchased item name
    const amountTotal = (session.amount_total || 0) / 100;
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amountTotal);

    let itemName = "Pixorva AI Service";
    if (session.metadata?.agentName) {
      itemName = `AI Employee Hire: ${session.metadata.agentName}`;
    } else if (session.metadata?.plan) {
      itemName = `Pixorva Plan Upgrade: ${session.metadata.plan === 'growth_pro' ? 'Growth Pro' : 'Enterprise'}`;
    }

    // 5. Compose and send the styled invoice receipt email via Resend
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid black; border-radius: 24px; overflow: hidden; box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);">
        <div style="background-color: #facc15; padding: 24px; text-align: center; border-bottom: 4px solid black;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://pixorva.com'}/favicon.ico" alt="Pixorva Logo" style="width: 48px; height: 48px; border: 3px solid black; border-radius: 10px; margin-bottom: 12px; box-shadow: 3px 3px 0px 0px rgba(0,0,0,1);" />
          <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; font-weight: 900; letter-spacing: -1px; color: black;">Pixorva AI Workforce</h1>
        </div>
        <div style="padding: 24px; background-color: white; color: black;">
          <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Thank you for your purchase!</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Your payment was successful and your AI workforce resources have been provisioned.</p>
          
          <div style="background-color: #f3f4f6; border: 2px solid black; border-radius: 12px; padding: 16px; margin: 24px 0;">
            <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; color: #4b5563; letter-spacing: 0.5px;">Purchase Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; font-size: 14px; color: black;">${itemName}</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px; color: black;">${formattedAmount}</td>
              </tr>
            </table>
          </div>

          ${invoicePdf ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${invoicePdf}" target="_blank" style="background-color: black; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; text-transform: uppercase; border: 2px solid black; display: inline-block; box-shadow: 4px 4px 0px 0px rgba(250,204,21,1);">Download PDF Bill</a>
          </div>
          ` : `
          <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 24px 0;">
            Your official Stripe PDF receipt will be sent directly by Stripe.
          </p>
          `}

          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 48px; border-t: 1px solid #e5e7eb; padding-top: 16px;">
            Pixorva Platform &copy; 2026. If you have any questions, reach out to your account executive.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: 'Pixorva Billing <billing@pixorva.com>',
      to: userEmail,
      subject: `Invoice & Confirmation for ${itemName}`,
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error("Resend delivery failed:", emailResponse.error);
      return NextResponse.json({ error: emailResponse.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailResponse });

  } catch (error: unknown) {
    console.error("Success API Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
