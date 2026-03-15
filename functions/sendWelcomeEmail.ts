import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { user_name, user_email, invite_code, app_url } = await req.json();

    // Only redirect demo emails that use the specific london4216 domain trick
    const actualEmail = user_email.includes('@london4216.gmail.com')
      ? 'london4216@gmail.com'
      : user_email;

    // Use Base44's built-in email integration with HTML
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: actualEmail,
      subject: "Welcome to EZ Move AI - Your Moving Assistant Awaits",
      body: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to EZ Move AI! 🎉</h1>
          </div>
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #1e293b; margin-bottom: 20px;">Hi ${user_name},</p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Your agent has set up your personalized moving assistant! We're here to make your move smooth and stress-free.
            </p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">YOUR INVITATION CODE</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; color: #78350f; font-weight: bold; letter-spacing: 8px;">${invite_code}</p>
            </div>
            <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
              Click below to complete your registration and start planning your move:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${app_url}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);">
                Get Started →
              </a>
            </div>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              Need help? Contact your agent or reach out to our support team.
            </p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});