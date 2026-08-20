import { NextResponse } from 'next/server';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Update this string to match the error message's expected type
  apiVersion: '2026-01-28.clover', 
});

export async function POST(req: Request) {
  try {
    const { agentId, agentName, userId } = await req.json();

    // 1. Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
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
            unit_amount: 499900, // ₹4,999.00 (in paise)
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Or 'subscription' if you want recurring
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&agent_id=${agentId}&agent_name=${encodeURIComponent(agentName)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/employees?canceled=true`,
      metadata: {
        userId: userId,
        agentId: agentId,
        agentName: agentName
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}