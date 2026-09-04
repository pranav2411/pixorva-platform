import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { LocalDb } from '@/app/utils/LocalDatabase';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      website,
      industry,
      companySize,
      roles,
      integrations,
      bottlenecks,
      dailyVolume,
      hostingPreference,
      fullName,
      workEmail,
      phone,
      timeline,
      additionalNotes,
      userId
    } = body;

    // Validate essential fields
    if (!companyName || !workEmail || !fullName) {
      return NextResponse.json(
        { error: 'Company Name, Full Name, and Work Email are required.' },
        { status: 400 }
      );
    }

    // Generate unique reference ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const refId = `PX-REQ-${randomSuffix}`;

    // 1. Save request in database
    let savedRecord = null;
    try {
      savedRecord = await LocalDb.saveCustomAgentRequest(supabase, {
        refId,
        userId: userId || undefined,
        companyName,
        website: website || '',
        industry: industry || 'Technology',
        companySize: companySize || '1-10',
        roles: Array.isArray(roles) ? roles : [],
        integrations: Array.isArray(integrations) ? integrations : [],
        bottlenecks: bottlenecks || '',
        dailyVolume: dailyVolume || 'Standard (< 1,000 tasks/day)',
        hostingPreference: hostingPreference || 'Managed Cloud',
        fullName,
        workEmail,
        phone: phone || '',
        timeline: timeline || 'Immediate (< 2 weeks)',
        additionalNotes: additionalNotes || ''
      });
    } catch (dbErr) {
      console.error('Failed to save custom agent request to DB:', dbErr);
    }

    // 2. Compose rich confirmation email
    const rolesHtml = (Array.isArray(roles) && roles.length > 0)
      ? roles.map(r => `<span style="display:inline-block;background:#27272a;color:#ffc700;border:1px solid #3f3f46;border-radius:6px;padding:4px 8px;margin:2px 4px 2px 0;font-size:12px;font-weight:600;">${r}</span>`).join('')
      : '<span style="color:#a1a1aa;font-style:italic;">Not specified</span>';

    const integrationsHtml = (Array.isArray(integrations) && integrations.length > 0)
      ? integrations.map(i => `<span style="display:inline-block;background:#27272a;color:#ffffff;border:1px solid #3f3f46;border-radius:6px;padding:4px 8px;margin:2px 4px 2px 0;font-size:12px;">${i}</span>`).join('')
      : '<span style="color:#a1a1aa;font-style:italic;">Standard APIs</span>';

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Request Raised: Custom AI Agents — Pixorva</title>
      </head>
      <body style="margin:0;padding:0;background-color:#090a0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:20px auto;background:#141519;border:1px solid #27272a;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;background:linear-gradient(180deg,#1c1d24 0%,#141519 100%);border-bottom:1px solid #27272a;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display:inline-block;background:#ffc700;color:#000000;font-weight:900;font-size:11px;letter-spacing:1.5px;padding:4px 10px;border-radius:6px;text-transform:uppercase;margin-bottom:12px;">
                      PIXORVA ENTERPRISE
                    </div>
                    <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
                      Request Raised: Custom AI Agents
                    </h1>
                    <p style="margin:6px 0 0 0;font-size:13px;color:#a1a1aa;">
                      Reference ID: <strong style="color:#ffc700;letter-spacing:0.5px;">${refId}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Core Notice Banner -->
          <tr>
            <td style="padding:24px 32px;background:#18191f;border-bottom:1px solid #27272a;">
              <div style="background:#0e0f12;border-left:4px solid #ffc700;padding:16px 20px;border-radius:8px;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#e4e4e7;">
                  Hello <strong>${fullName}</strong>,<br /><br />
                  Your request has been created! Someone from our team will contact you soon with custom architecture blueprints and next steps based on the details you provided.
                </p>
              </div>
            </td>
          </tr>

          <!-- Request Summary Table -->
          <tr>
            <td style="padding:28px 32px;">
              <h2 style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">
                Summary of Submitted Details
              </h2>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;width:35%;font-weight:500;">Company</td>
                  <td style="padding:10px 0;color:#ffffff;font-weight:600;">${companyName}</td>
                </tr>
                ${website ? `
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Website</td>
                  <td style="padding:10px 0;color:#38bdf8;">${website}</td>
                </tr>` : ''}
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Industry</td>
                  <td style="padding:10px 0;color:#ffffff;">${industry || 'General'}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Team Size</td>
                  <td style="padding:10px 0;color:#ffffff;">${companySize || '1-10'}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;vertical-align:top;">Requested Roles</td>
                  <td style="padding:10px 0;">${rolesHtml}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;vertical-align:top;">Integrations</td>
                  <td style="padding:10px 0;">${integrationsHtml}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Daily Volume</td>
                  <td style="padding:10px 0;color:#ffffff;">${dailyVolume}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Hosting Preference</td>
                  <td style="padding:10px 0;color:#ffffff;">${hostingPreference}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Target Timeline</td>
                  <td style="padding:10px 0;color:#ffffff;">${timeline}</td>
                </tr>
                ${phone ? `
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;font-weight:500;">Phone / WhatsApp</td>
                  <td style="padding:10px 0;color:#ffffff;">${phone}</td>
                </tr>` : ''}
                ${bottlenecks ? `
                <tr>
                  <td style="padding:12px 0 0 0;color:#71717a;font-weight:500;vertical-align:top;">Specific Goals</td>
                  <td style="padding:12px 0 0 0;color:#d4d4d8;line-height:1.5;">${bottlenecks}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Support & Assistance Callout (Explicit requirement) -->
          <tr>
            <td style="padding:20px 32px;background:#18191f;border-top:1px solid #27272a;text-align:center;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                Have questions or need urgent onboarding? Reach us anytime directly at<br />
                <a href="mailto:support@pixorva.org" style="color:#ffc700;font-weight:700;text-decoration:none;">support@pixorva.org</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:#0e0f12;text-align:center;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:1px;">
                © ${new Date().getFullYear()} Pixorva Inc. • Autonomous Enterprise AI Workforce
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 3. Compose internal team notification email
    const teamEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>New Custom Agent Lead: ${companyName}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#090a0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:20px auto;background:#141519;border:1px solid #27272a;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(180deg,#1c1d24 0%,#141519 100%);border-bottom:1px solid #27272a;">
              <div style="display:inline-block;background:#3b82f6;color:#ffffff;font-weight:900;font-size:11px;letter-spacing:1px;padding:4px 10px;border-radius:6px;text-transform:uppercase;margin-bottom:10px;">
                NEW CUSTOM AGENT LEAD
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">
                ${companyName} (${fullName})
              </h1>
              <p style="margin:6px 0 0 0;font-size:13px;color:#a1a1aa;">
                Reference: <strong style="color:#ffc700;">${refId}</strong> • Timestamp: ${new Date().toUTCString()}
              </p>
            </td>
          </tr>

          <!-- Contact Details Callout -->
          <tr>
            <td style="padding:24px 32px;background:#18191f;border-bottom:1px solid #27272a;">
              <h3 style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#ffc700;text-transform:uppercase;letter-spacing:1px;">
                Direct Customer Contact Details
              </h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;">
                <tr>
                  <td style="padding:4px 0;color:#a1a1aa;width:30%;">Contact Name:</td>
                  <td style="padding:4px 0;color:#ffffff;font-weight:600;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#a1a1aa;">Work Email:</td>
                  <td style="padding:4px 0;"><a href="mailto:${workEmail}" style="color:#38bdf8;text-decoration:none;font-weight:700;">${workEmail}</a></td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding:4px 0;color:#a1a1aa;">Phone / WhatsApp:</td>
                  <td style="padding:4px 0;"><a href="tel:${phone}" style="color:#ffffff;text-decoration:none;font-weight:600;">${phone}</a></td>
                </tr>` : ''}
              </table>
              <div style="margin-top:16px;">
                <a href="mailto:${workEmail}?subject=Pixorva%20AI%20Workforce%20Architecture%20Proposal%20-%20${encodeURIComponent(companyName)}%20[${refId}]" style="display:inline-block;background:#ffc700;color:#000000;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 18px;border-radius:8px;text-decoration:none;">
                  Reply to Customer →
                </a>
              </div>
            </td>
          </tr>

          <!-- Requirements -->
          <tr>
            <td style="padding:28px 32px;">
              <h3 style="margin:0 0 16px 0;font-size:12px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">
                Full Business Requirements
              </h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;width:35%;">Company</td>
                  <td style="padding:8px 0;color:#ffffff;font-weight:600;">${companyName}</td>
                </tr>
                ${website ? `
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;">Website</td>
                  <td style="padding:8px 0;"><a href="${website.startsWith('http') ? website : 'https://' + website}" target="_blank" style="color:#38bdf8;text-decoration:none;">${website}</a></td>
                </tr>` : ''}
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;">Industry</td>
                  <td style="padding:8px 0;color:#ffffff;">${industry}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;">Headcount</td>
                  <td style="padding:8px 0;color:#ffffff;">${companySize}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;vertical-align:top;">Requested Roles</td>
                  <td style="padding:8px 0;">${rolesHtml}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;vertical-align:top;">Integrations</td>
                  <td style="padding:8px 0;">${integrationsHtml}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;">Daily Volume</td>
                  <td style="padding:8px 0;color:#ffffff;">${dailyVolume}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;">Hosting Preference</td>
                  <td style="padding:8px 0;color:#ffffff;">${hostingPreference}</td>
                </tr>
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:8px 0;color:#71717a;">Target Timeline</td>
                  <td style="padding:8px 0;color:#ffffff;">${timeline}</td>
                </tr>
                ${bottlenecks ? `
                <tr style="border-bottom:1px solid #27272a;">
                  <td style="padding:10px 0;color:#71717a;vertical-align:top;">Core Bottlenecks</td>
                  <td style="padding:10px 0;color:#e4e4e7;line-height:1.5;">${bottlenecks}</td>
                </tr>` : ''}
                ${additionalNotes ? `
                <tr>
                  <td style="padding:10px 0;color:#71717a;vertical-align:top;">Technical Notes</td>
                  <td style="padding:10px 0;color:#e4e4e7;line-height:1.5;">${additionalNotes}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 4. Send email to Customer
    let emailResult = null;
    try {
      emailResult = await resend.emails.send({
        from: 'Pixorva Enterprise <info@pixorva.com>',
        to: workEmail,
        subject: `Request Raised [${refId}]: Custom AI Agents — Pixorva`,
        html: emailHtml
      });
    } catch (emailErr) {
      console.warn('Resend customer email dispatch failed:', emailErr);
      try {
        emailResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: workEmail,
          subject: `Request Raised [${refId}]: Custom AI Agents — Pixorva`,
          html: emailHtml
        });
      } catch (fallbackErr) {
        console.warn('Fallback customer Resend attempt failed too:', fallbackErr);
      }
    }

    // 5. Send customer details and requirements to no-reply@pixorva.com
    let teamEmailResult = null;
    try {
      teamEmailResult = await resend.emails.send({
        from: 'Pixorva Lead Intake <info@pixorva.com>',
        to: 'no-reply@pixorva.com',
        replyTo: workEmail,
        subject: `[NEW LEAD] Custom AI Agent Request: ${companyName} (${fullName}) [${refId}]`,
        html: teamEmailHtml
      });
    } catch (teamErr) {
      console.warn('Resend team notification failed:', teamErr);
      try {
        teamEmailResult = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'no-reply@pixorva.com',
          replyTo: workEmail,
          subject: `[NEW LEAD] Custom AI Agent Request: ${companyName} (${fullName}) [${refId}]`,
          html: teamEmailHtml
        });
      } catch (fallbackTeamErr) {
        console.warn('Fallback team Resend attempt failed too:', fallbackTeamErr);
      }
    }

    return NextResponse.json({
      success: true,
      refId,
      message: 'Request is created. Someone from our team will contact you soon with all details you have filled. For more, contact support@pixorva.org.',
      emailSent: !!emailResult,
      teamNotified: !!teamEmailResult,
      record: savedRecord
    });
  } catch (error: any) {
    console.error('Error handling custom agent request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process custom agent request.' },
      { status: 500 }
    );
  }
}
