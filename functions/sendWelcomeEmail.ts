import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail({ to, subject, body }) {
  // Use Resend if API key is set, otherwise log a warning
  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EZ Move AI <onboarding@resend.dev>",
        to: [to],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Email send failed: ${err}`);
    }
    return await res.json();
  } else {
    // Fallback: log the email (for development/testing)
    console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\n\n${body}`);
    return { id: "logged" };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_name, user_email, invite_code, app_url } = await req.json();

    await sendEmail({
      to: user_email,
      subject: `Welcome to EZ Move AI`,
      body: `Welcome ${user_name},\n\nYour invite code: ${invite_code}\n\nRegister here: ${app_url}\n\n---\nTo unsubscribe, reply with "unsubscribe".`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});