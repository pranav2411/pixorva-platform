import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe('sk_test_...', {
  // Update this string to match the error message's expected type
  apiVersion: '2026-01-28.clover', 
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { agentId, agentName, priceId, userId } = await req.json();

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

  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}