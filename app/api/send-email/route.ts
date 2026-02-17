import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html } = body;

    // ⚠️ IMPORTANT: On the Free Plan, Resend ONLY sends to your own email.
    // We force this here so your test works immediately.
    // Once you add a domain in Resend.com, you can remove this line.
    const data = await resend.emails.send({
      from: 'Pixorva Agent <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // This sends to the email you signed up with
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}