import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_name, user_email } = await req.json();

    // Send setup email to new user
    await base44.integrations.Core.SendEmail({
      to: user_email,
      subject: '🏠 Welcome to EZ Move AI - Your Moving Starts Now',
      body: `Hi ${user_name},

Welcome to EZ Move AI! Your real estate agent has set up your personalized moving timeline.

What you can do now:
✓ View your 4-week moving plan
✓ Track your progress
✓ Book local services (movers, cleaners, etc)
✓ Get reminders and updates via text

Log in to your dashboard to get started.

Questions? Contact your agent or reply to this email.

Best regards,
EZ Move AI Team`
    });

    // Send congratulations email to agent
    const agents = await base44.entities.Agent.filter({});
    if (agents.length > 0) {
      const agent = agents[0];
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🎉 New Client Registered - ${user_name}`,
        body: `Hi ${agent.company_name || 'Agent'},

Great news! ${user_name} (${user_email}) has just registered with EZ Move AI.

They're now in your client dashboard and you can track their progress.

$40 has been charged to your account for this client.

Log in to your agent portal to manage their details.

Best regards,
EZ Move AI Team`
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});