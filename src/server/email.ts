import { Resend } from 'resend';

let runtimeResendApiKey: string | null = null;

export function setRuntimeResendApiKey(key: string | null) {
  runtimeResendApiKey = key ? key.trim() : null;
}

export function getResendStatus() {
  const apiKey = runtimeResendApiKey || process.env.RESEND_API_KEY;
  const isSet = Boolean(apiKey && apiKey.length > 5);
  const isSandbox = !isSet || apiKey?.startsWith('re_test_') || apiKey === 're_123456789';
  return {
    isConfigured: isSet,
    mode: isSet ? (isSandbox ? 'sandbox' : 'live') : 'simulated',
    targetEmail: process.env.SUPPORT_EMAIL || 'martorefe@gmail.com',
    senderEmail: process.env.RESEND_FROM_EMAIL || 'AlterEgo Support <onboarding@resend.dev>',
  };
}

export interface SupportEmailRequest {
  fromEmail?: string;
  name?: string;
  subject?: string;
  category?: string;
  message: string;
  userClass?: string;
  chapter?: number;
  seasonXp?: number;
  isPro?: boolean;
}

export interface SupportEmailResponse {
  success: boolean;
  messageId?: string;
  mode: 'live' | 'simulated';
  note?: string;
  error?: string;
}

export interface ReceiptEmailRequest {
  customerEmail: string;
  customerName?: string;
  amount: string;
  currency: string;
  reference: string;
  userClass?: string;
  chapter?: number;
}

export async function sendSupportEmail(payload: SupportEmailRequest): Promise<SupportEmailResponse> {
  const apiKey = runtimeResendApiKey || process.env.RESEND_API_KEY;
  const targetEmail = process.env.SUPPORT_EMAIL || 'martorefe@gmail.com';
  
  // Public webmail domains cannot be verified or used as envelope sender in Resend
  const isWebmailDomain = (email: string) => {
    const webmails = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'live.com', 'msn.com'];
    return webmails.some(d => email.toLowerCase().includes(`@${d}`));
  };

  const defaultFrom = 'AlterEgo Support <onboarding@resend.dev>';
  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const fromEmail = (configuredFrom && !isWebmailDomain(configuredFrom)) ? configuredFrom : defaultFrom;

  const subjectCategory = payload.category ? `[${payload.category}] ` : '';
  const cleanSubject = payload.subject?.trim() || 'New Support & Feedback Message';
  const fullSubject = `AlterEgo Support: ${subjectCategory}${cleanSubject} (${payload.userClass || 'Candidate'})`;

  const userEmail = payload.fromEmail?.trim() || 'Not specified (Anonymous)';
  const senderName = payload.name?.trim() || 'AlterEgo Operative';
  const userClass = payload.userClass || 'Unassigned Archetype';
  const chapter = payload.chapter ? `Chapter ${payload.chapter}` : 'Chapter 1';
  const xp = payload.seasonXp !== undefined ? `${payload.seasonXp} Season XP` : '0 XP';
  const tier = payload.isPro ? 'AlterEgo Sovereign Pass (Pro)' : 'Standard Operative';
  const timestamp = new Date().toUTCString();

  const textBody = `
=== ALTEREGO SUPPORT DISPATCH ===
From: ${senderName} <${userEmail}>
Subject: ${cleanSubject}
Category: ${payload.category || 'General'}
User Archetype / Class: ${userClass}
Current Progress: ${chapter} (${xp})
Membership Tier: ${tier}
Timestamp: ${timestamp}

--- USER MESSAGE ---
${payload.message}

---
Dispatched via Resend Transactional Email Engine
Destination: ${targetEmail}
`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #131b2e; border: 1px solid rgba(99,102,241,0.3); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4338ca, #6366f1, #9333ea); padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 1.5px; }
    .content { padding: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.4); margin-bottom: 16px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    .meta-table td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,200,0.06); }
    .meta-table td.label { color: #94a3b8; font-weight: 600; width: 140px; }
    .meta-table td.val { color: #f8fafc; font-weight: 500; }
    .message-box { background: rgba(0,0,0,0.4); border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap; }
    .footer { padding: 16px 24px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AlterEgo Sovereign Support</h1>
      <p>Direct Resend Dispatch • Qubators AI Foundry</p>
    </div>
    <div class="content">
      <span class="badge">${payload.category || 'Support Inquiry'}</span>
      
      <table class="meta-table">
        <tr>
          <td class="label">Sender / Reply:</td>
          <td class="val"><strong style="color: #38bdf8;">${userEmail}</strong></td>
        </tr>
        <tr>
          <td class="label">Executive Class:</td>
          <td class="val">${userClass}</td>
        </tr>
        <tr>
          <td class="label">Progress:</td>
          <td class="val">${chapter} &bull; ${xp}</td>
        </tr>
        <tr>
          <td class="label">Membership:</td>
          <td class="val"><span style="color: ${payload.isPro ? '#fbbf24' : '#94a3b8'}; font-weight: 700;">${tier}</span></td>
        </tr>
        <tr>
          <td class="label">Timestamp:</td>
          <td class="val">${timestamp}</td>
        </tr>
      </table>

      <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #a5b4fc;">User Inquiry / Feedback:</h3>
      <div class="message-box">${payload.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <div class="footer">
      Sent to <strong>${targetEmail}</strong> via Resend API.
    </div>
  </div>
</body>
</html>
`;

  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not set. Simulating transactional email transmission in development mode.');
    return {
      success: true,
      mode: 'simulated',
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      note: 'Resend service connected! Transaction processed in simulated development mode. (Provide RESEND_API_KEY in environment or launch hub for live dispatch to martorefe@gmail.com).',
    };
  }

  try {
    const resend = new Resend(apiKey);
    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [targetEmail],
      replyTo: payload.fromEmail?.trim() || undefined,
      subject: fullSubject,
      text: textBody,
      html: htmlBody,
    });

    if (error && (error.message?.toLowerCase().includes('domain') || error.message?.toLowerCase().includes('verify'))) {
      console.warn('[Resend] Custom sender domain unverified. Falling back to default sandbox sender:', error.message);
      const fallbackResult = await resend.emails.send({
        from: defaultFrom,
        to: [targetEmail],
        replyTo: payload.fromEmail?.trim() || undefined,
        subject: fullSubject,
        text: textBody,
        html: htmlBody,
      });
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('[Resend Error]', error);
      return {
        success: false,
        mode: 'live',
        error: error.message || 'Failed to dispatch email via Resend',
      };
    }

    return {
      success: true,
      mode: 'live',
      messageId: data?.id,
      note: 'Email successfully delivered to support desk via Resend API.',
    };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return {
      success: false,
      mode: 'live',
      error: err?.message || 'Unexpected failure connecting to Resend API.',
    };
  }
}

export async function sendReceiptEmail(payload: ReceiptEmailRequest): Promise<SupportEmailResponse> {
  const apiKey = runtimeResendApiKey || process.env.RESEND_API_KEY;
  const targetEmail = payload.customerEmail.trim();
  const adminEmail = process.env.SUPPORT_EMAIL || 'martorefe@gmail.com';
  const defaultFrom = 'AlterEgo Pass <onboarding@resend.dev>';
  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const fromEmail = (configuredFrom && !configuredFrom.includes('@gmail.com')) ? configuredFrom : defaultFrom;

  const subject = `AlterEgo Sovereign Pass Receipt - Reference #${payload.reference.slice(-8).toUpperCase()}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050811; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(168,85,247,0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #4338ca, #7c3aed, #d946ef); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.9); letter-spacing: 1px; }
    .content { padding: 28px 24px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: rgba(234,179,8,0.2); color: #fde047; border: 1px solid rgba(234,179,8,0.4); margin-bottom: 20px; }
    .receipt-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .perks-list { margin: 20px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #cbd5e1; }
    .footer { padding: 20px 24px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sovereign Pass Unlocked</h1>
      <p>Midnight Studio &bull; Qubators AI Foundry</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="badge">&starf; SOVEREIGN PRO OPERATIVE &starf;</span>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
        Greetings <strong>${payload.customerName || 'Operative'}</strong>,
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
        Your transaction through Paystack has been verified. You now hold sovereign access across all AlterEgo season chapters.
      </p>

      <div class="receipt-box">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Item:</td>
            <td style="padding: 6px 0; text-align: right; color: #f8fafc; font-weight: 600;">AlterEgo Sovereign Pass</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Archetype Class:</td>
            <td style="padding: 6px 0; text-align: right; color: #c084fc;">${payload.userClass || 'Operative'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Transaction Reference:</td>
            <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #38bdf8;">${payload.reference}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Payment Gateway:</td>
            <td style="padding: 6px 0; text-align: right; color: #10b981;">Paystack Direct</td>
          </tr>
          <tr style="border-top: 1px solid rgba(255,255,255,0.15);">
            <td style="padding: 12px 0 0; color: #f8fafc; font-weight: 700; font-size: 15px;">Total Paid:</td>
            <td style="padding: 12px 0 0; text-align: right; color: #ec4899; font-weight: 800; font-size: 16px;">${payload.amount} ${payload.currency}</td>
          </tr>
        </table>
      </div>

      <h4 style="margin: 20px 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #c084fc;">Unlocked Privileges:</h4>
      <ul class="perks-list">
        <li>Unlimited AI Task Copilot breakdowns for every quest</li>
        <li>Priority Ikigai blueprint generation</li>
        <li>Instant access to all chapters and seasonal questlines</li>
        <li>Direct founder support line</li>
      </ul>
    </div>
    <div class="footer">
      Support Desk: <strong>${adminEmail}</strong> &bull; AlterEgo AI Studio
    </div>
  </div>
</body>
</html>
`;

  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not set. Simulating receipt email transmission to', targetEmail);
    return {
      success: true,
      mode: 'simulated',
      messageId: `receipt_sim_${Date.now()}`,
      note: `Receipt simulated! Email prepared for ${targetEmail} and copy to ${adminEmail}. Provide RESEND_API_KEY for live delivery.`,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const recipients = [targetEmail];
    if (adminEmail && adminEmail !== targetEmail) {
      recipients.push(adminEmail);
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html: htmlBody,
    });

    if (error) {
      console.error('[Resend Receipt Error]', error);
      return {
        success: false,
        mode: 'live',
        error: error.message || 'Failed to dispatch receipt via Resend',
      };
    }

    return {
      success: true,
      mode: 'live',
      messageId: data?.id,
      note: `Receipt dispatched successfully to ${targetEmail} and copy to ${adminEmail}!`,
    };
  } catch (err: any) {
    console.error('[Resend Receipt Exception]', err);
    return {
      success: false,
      mode: 'live',
      error: err?.message || 'Error communicating with Resend',
    };
  }
}

export async function sendTestEmail(targetEmail?: string): Promise<SupportEmailResponse> {
  const destination = targetEmail?.trim() || process.env.SUPPORT_EMAIL || 'martorefe@gmail.com';
  return sendSupportEmail({
    fromEmail: 'test-agent@alterego.internal',
    name: 'AlterEgo Health Probe',
    subject: 'Verification & Diagnostic Ping',
    category: 'System Integration Test',
    message: `This is a live integration verification message sent to verify Resend Transactional Email connectivity for project AlterEgo.\nTarget Destination: ${destination}\nTimestamp: ${new Date().toISOString()}`,
    userClass: 'Chief Architect',
    chapter: 1,
    seasonXp: 1000,
    isPro: true,
  });
}
