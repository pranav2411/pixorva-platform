import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { LocalDb } from '../../../utils/LocalDatabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {}
          },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Retrieve user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Retrieve all active agents for this user
    const { data: allAgents } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const agentsList = allAgents || [];
    const subscriptionAgents = agentsList.filter(a => !a.is_paid_individually);
    const paidAgents = agentsList;

    // 3. Retrieve real API Keys
    const apiKeys = await LocalDb.getApiKeys(supabase, user.id);

    // 4. Retrieve real Billing Invoices
    const payments = await LocalDb.getPayments(supabase, user.id);

    // 5. Retrieve LLM usage
    const { data: totalRuns } = await supabase
      .from('tasks')
      .select('result')
      .eq('user_id', user.id);
    let totalTokens = 0;
    if (totalRuns) {
      totalTokens = totalRuns.reduce((acc: number, t: any) => acc + Math.ceil((t.result ? t.result.length : 0) / 4), 0);
    }
    const usage = {
      tokensUsed: totalTokens,
      runHours: totalRuns ? totalRuns.length * 0.05 : 0
    };

    // 6. Retrieve session details
    const userAgentRaw = headersList.get('user-agent') || 'Unknown Device';
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';

    let deviceName = 'Web Browser';
    if (/macintosh|mac os x/i.test(userAgentRaw)) deviceName = 'Chrome Browser • macOS';
    else if (/windows/i.test(userAgentRaw)) deviceName = 'Chrome Browser • Windows';
    else if (/iphone|ipad|ipod/i.test(userAgentRaw)) deviceName = 'Safari Mobile • iOS';
    else if (/android/i.test(userAgentRaw)) deviceName = 'Chrome Mobile • Android';
    else if (/linux/i.test(userAgentRaw)) deviceName = 'Firefox Browser • Linux';

    let location = 'Jaipur, Rajasthan, India';
    if (clientIp.startsWith('127.') || clientIp.includes('::1')) {
      location = 'Local Development Session';
    }

    return NextResponse.json({
      success: true,
      email: user.email || profile?.email || '',
      fullName: profile?.full_name || user.user_metadata?.full_name || '',
      userId: user.id,
      plan: profile?.plan || 'free',
      paidAgents,
      subscriptionAgents,
      apiKeys,
      payments,
      usage,
      activeSession: {
        device: deviceName,
        ip: clientIp.split(',')[0].trim(),
        location,
        userAgent: userAgentRaw
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
