import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_name, user_email, invite_code, app_url } = await req.json();

    // Use Base44's built-in email integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user_email,
      subject: "Welcome to EZ Move AI",
      body: `Welcome ${user_name},\n\nYour invite code is: ${invite_code}\n\nRegister here: ${app_url}\n\nUse this code to complete your registration and access your personalized moving assistant.\n\nBest regards,\nEZ Move AI Team`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});