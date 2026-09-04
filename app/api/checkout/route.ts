import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover', 
});

const CANONICAL_PLANS: Record<string, { price: number; name: string }> = {
  growth_pro: { price: 499900, name: "Growth Pro Plan" },
  enterprise: { price: 1999900, name: "Enterprise Plan" },
};
const DEFAULT_AGENT_PRICE = 99900;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please log in to checkout." }, { status: 401 });
    }

    const { agentName, icon, steps, isPlan, planCode } = await req.json();

    let session;

    if (isPlan) {
      const planConfig = CANONICAL_PLANS[planCode];
      if (!planConfig) {
        return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
      }

      // 1. Create a subscription session for a plan
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: planConfig.name,
                description: `Subscribe to Pixorva ${planConfig.name}`,
                images: ['https://cdn-icons-png.flaticon.com/512/3176/3176395.png'],
              },
              unit_amount: planConfig.price,
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
          userId: user.id,
          plan: planCode,
        },
      });
    } else {
      // 2. Create a monthly recurring subscription session for a single agent/utility
      const cleanAgentName = agentName ? String(agentName).slice(0, 80) : "AI Employee";
      const isGovernance = cleanAgentName.toLowerCase().includes("governance");
      const unitAmount = isGovernance ? 199900 : DEFAULT_AGENT_PRICE;

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Hire Agent: ${cleanAgentName}`,
                description: 'Monthly salary for AI Employee',
                images: ['https://cdn-icons-png.flaticon.com/512/4712/4712035.png'],
              },
              unit_amount: unitAmount,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}&agent_name=${encodeURIComponent(cleanAgentName)}&icon=${encodeURIComponent(icon || 'Bot')}&steps=${encodeURIComponent(JSON.stringify(steps || []))}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/employees?canceled=true`,
        metadata: {
          userId: user.id,
          agentName: cleanAgentName,
          icon: icon || 'Bot',
          steps: JSON.stringify(steps || [])
        },
      });
    }

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}