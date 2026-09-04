import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. Enforce authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in route handlers if called during response
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be logged in to dispatch emails.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { to, subject, html } = body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid recipient email address.' }, { status: 400 });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Email subject is required.' }, { status: 400 });
    }

    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Email content is required.' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Pixorva Agent <info@pixorva.com>',
      to: to.trim(),
      replyTo: user.email || 'info@pixorva.com',
      subject: subject.slice(0, 200),
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}