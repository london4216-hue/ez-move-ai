import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.25.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { agent_id, email, name } = await req.json();

    if (!agent_id || !email) {
      return Response.json({ error: 'Missing agent_id or email' }, { status: 400 });
    }

    const customer = await stripe.customers.create({ email, name });

    await base44.asServiceRole.entities.Agent.update(agent_id, {
      stripe_customer_id: customer.id,
    });

    return Response.json({ customer_id: customer.id, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});