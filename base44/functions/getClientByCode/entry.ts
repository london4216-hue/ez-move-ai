import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { invitation_code, update_status, user_email } = await req.json();

  if (!invitation_code) {
    return Response.json({ error: "invitation_code required" }, { status: 400 });
  }

  // Must use asServiceRole — the Client record was created by the agent, not the new user
  const clients = await base44.asServiceRole.entities.Client.filter({ invitation_code });

  if (clients.length === 0) {
    return Response.json({ client: null });
  }

  const c = clients[0];

  // Update client status using asServiceRole too (same RLS reason)
  if (update_status && c.id) {
    await base44.asServiceRole.entities.Client.update(c.id, {
      status: "registered",
      user_email: user_email || ""
    });
  }

  return Response.json({
    client: {
      id: c.id,
      close_date: c.close_date,
      user_name: c.user_name,
      agent_id: c.agent_id,
    }
  });
});