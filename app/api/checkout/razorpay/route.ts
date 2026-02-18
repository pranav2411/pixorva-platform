import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '../../../utils/supabase/client'; 

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const supabase = createClient();
  
  // 1. Authenticate User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { planId, agentId } = await req.json();

  try {
    // 2. Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId, // The Plan ID from your Dashboard (e.g. plan_H3...)
      customer_notify: 1,
      total_count: 120, // Max billing cycles (e.g. 10 years)
      notes: {
        user_id: user.id,
        agent_id: agentId, 
      },
    });

    // 3. Save pending subscription to DB
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      agent_id: agentId,
      plan_id: planId,
      sub_id: subscription.id,
      status: 'created',
    });

    return NextResponse.json({ sub_id: subscription.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}