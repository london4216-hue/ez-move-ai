import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.25.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      return Response.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const getAgentByCustomer = async (customerId) => {
      const agents = await base44.asServiceRole.entities.Agent.list();
      return agents.find(a => a.stripe_customer_id === customerId) || null;
    };

    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object;
        const agent = await getAgentByCustomer(invoice.customer);
        if (agent) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await base44.asServiceRole.entities.Agent.update(agent.id, {
            subscription_status: 'active',
            subscription_renewal_date: new Date(sub.current_period_end * 1000).toISOString().split('T')[0],
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const agent = await getAgentByCustomer(invoice.customer);
        if (agent) {
          await base44.asServiceRole.entities.Agent.update(agent.id, { subscription_status: 'past_due' });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const agent = await getAgentByCustomer(sub.customer);
        if (agent) {
          await base44.asServiceRole.entities.Agent.update(agent.id, {
            subscription_status: sub.status,
            subscription_renewal_date: new Date(sub.current_period_end * 1000).toISOString().split('T')[0],
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const agent = await getAgentByCustomer(sub.customer);
        if (agent) {
          await base44.asServiceRole.entities.Agent.update(agent.id, {
            subscription_status: 'cancelled',
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});