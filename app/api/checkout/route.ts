import { NextResponse } from 'next/server';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover', 
});

export async function POST(req: Request) {
  try {
    const { agentName, userId, icon, steps, amount, isPlan, planName, planCode } = await req.json();

    let session;

    if (isPlan) {
      // 1. Create a subscription session for a plan
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: planName,
                description: `Subscribe to Pixorva ${planName}`,
                images: ['https://cdn-icons-png.flaticon.com/512/3176/3176395.png'], // Tier/Crown Icon
              },
              unit_amount: amount, // Plan amount in paise
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planCode}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
        metadata: {
          userId: userId,
          plan: planCode,
        },
      });
    } else {
      // 2. Create a standard one-time payment session for a single agent
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Hire Agent: ${agentName}`,
                description: 'Monthly salary for AI Employee',
                images: ['https://cdn-icons-png.flaticon.com/512/4712/4712035.png'], // Generic Bot Icon
              },
              unit_amount: amount, // Dynamic amount in paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        invoice_creation: {
          enabled: true,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}&agent_name=${encodeURIComponent(agentName)}&icon=${encodeURIComponent(icon)}&steps=${encodeURIComponent(JSON.stringify(steps))}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/employees?canceled=true`,
        metadata: {
          userId: userId,
          agentName: agentName,
          icon: icon,
          steps: JSON.stringify(steps)
        },
      });
    }

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}