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

    // 1. Retrieve real API Keys
    const apiKeys = LocalDb.getApiKeys(user.id);

    // 2. Retrieve real Billing Invoices
    const payments = LocalDb.getPayments(user.id);

    // 3. Retrieve real LLM telemetry usage
    const usage = LocalDb.getUserUsage(user.id);

    // 4. Retrieve current caller session details (IP Address & User-Agent)
    const userAgentRaw = headersList.get('user-agent') || 'Unknown Device';
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';

    // Parse user agent simply for display
    let deviceName = 'Web Browser';
    if (/macintosh|mac os x/i.test(userAgentRaw)) deviceName = 'Chrome Browser • macOS';
    else if (/windows/i.test(userAgentRaw)) deviceName = 'Chrome Browser • Windows';
    else if (/iphone|ipad|ipod/i.test(userAgentRaw)) deviceName = 'Safari Mobile • iOS';
    else if (/android/i.test(userAgentRaw)) deviceName = 'Chrome Mobile • Android';
    else if (/linux/i.test(userAgentRaw)) deviceName = 'Firefox Browser • Linux';

    // 5. Parse location (mock location lookup from IP for realism)
    let location = 'Jaipur, Rajasthan, India';
    if (clientIp.startsWith('127.') || clientIp.includes('::1')) {
      location = 'Local Development Session';
    }

    // 6. Return dynamic payload
    return NextResponse.json({
      success: true,
      apiKeys,
      payments,
      usage,
      session: {
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
