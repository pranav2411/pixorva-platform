import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '../../../utils/supabase/client'; 

export async function POST(req: Request) {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

  const secret = process.env.RAZORPAY_KEY_SECRET!;

  // 1. Generate Signature
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_payment_id + '|' + razorpay_subscription_id)
    .digest('hex');

  // 2. Compare Signatures
  if (generated_signature === razorpay_signature) {
    const supabase = createClient();
    
    // 3. Update DB status to 'active'
    await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('sub_id', razorpay_subscription_id);

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}