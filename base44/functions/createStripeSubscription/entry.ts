import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.25.0';

// Price IDs — update with your actual Stripe price IDs
const PLANS = {
  agent_monthly:  { price_id: 'price_agent_monthly',  name: 'Agent Monthly',  amount: 4900 },
  broker_monthly: { price_id: 'price_broker_monthly', name: 'Broker Monthly', amount: 14900 },
  broker_annual:  { price_id: 'price_broker_annual',  name: 'Broker Annual',  amount: 149900 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { agent_id, plan, payment_method_id } = await req.json();

    if (!agent_id || !plan) {
      return Response.json({ error: 'Missing agent_id or plan' }, { status: 400 });
    }

    const planData = PLANS[plan];
    if (!planData) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const agents = await base44.asServiceRole.entities.Agent.filter({ id: agent_id });
    const agent = agents[0];
    if (!agent) return Response.json({ error: 'Agent not found' }, { status: 404 });

    let customerId = agent.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: agent.company_name });
      customerId = customer.id;
      await base44.asServiceRole.entities.Agent.update(agent_id, { stripe_customer_id: customerId });
    }

    if (payment_method_id) {
      await stripe.paymentMethods.attach(payment_method_id, { customer: customerId });
      await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: payment_method_id } });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planData.price_id }],
      expand: ['latest_invoice.payment_intent'],
    });

    const renewalDate = new Date(subscription.current_period_end * 1000).toISOString().split('T')[0];

    await base44.asServiceRole.entities.Agent.update(agent_id, {
      subscription_status: subscription.status,
      subscription_plan: plan,
      subscription_renewal_date: renewalDate,
    });

    return Response.json({
      subscription_id: subscription.id,
      status: subscription.status,
      renewal_date: renewalDate,
      success: true,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});