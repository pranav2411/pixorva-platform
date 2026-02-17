import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html } = body;

    // --- UNLOCKED VERSION ---
    // We are now using the REAL 'to' address you typed.
    // ⚠️ WARNING: On Resend Free Plan, this email (to) MUST be 
    // the same email you used to sign up for Resend. 
    // If you try to send to anyone else, it will fail.
    
    const data = await resend.emails.send({
      from: 'Pixorva Agent <onboarding@resend.dev>',
      to: to, // <--- CHANGED FROM 'delivered@resend.dev' TO 'to'
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}