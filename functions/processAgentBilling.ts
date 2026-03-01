import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { client_id } = await req.json();

    // Get client and update billing status
    const client = await base44.entities.Client.get(client_id);
    
    if (!client || client.billing_status === 'charged') {
      return Response.json({ error: 'Invalid client or already charged' }, { status: 400 });
    }

    // Update client billing status to charged
    await base44.entities.Client.update(client_id, {
      billing_status: 'charged',
      charge_date: new Date().toISOString().split('T')[0]
    });

    // Update agent revenue
    const agent = await base44.entities.Agent.get(client.agent_id);
    await base44.entities.Agent.update(client.agent_id, {
      clients_count: (agent.clients_count || 0) + 1,
      total_charged: (agent.total_charged || 0) + 40
    });

    return Response.json({ 
      success: true, 
      message: `$40 charged for ${client.user_name}` 
    });
  } catch (error) {
    console.error('Billing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});