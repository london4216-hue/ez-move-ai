import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { invitation_code } = await req.json();

  if (!invitation_code) {
    return Response.json({ error: "invitation_code required" }, { status: 400 });
  }

  const clients = await base44.asServiceRole.entities.Client.filter({ invitation_code });
  if (clients.length === 0) {
    return Response.json({ client: null });
  }

  const c = clients[0];
  return Response.json({
    client: {
      id: c.id,
      close_date: c.close_date,
      user_name: c.user_name,
      agent_id: c.agent_id,
    }
  });
});