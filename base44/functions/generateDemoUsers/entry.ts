import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can generate demo users
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const roleConfigs = {
      agent: { inviteRole: 'user', domain: 'moveez.com' },
      client: { inviteRole: 'user', domain: 'ezmove.com' },
      broker: { inviteRole: 'admin', domain: 'ezmove.com' },
      superadmin: { inviteRole: 'admin', domain: 'ezmove.com' },
    };

    const createdAccounts = [];

    // Process each role
    for (const [roleType, config] of Object.entries(roleConfigs)) {
      // Get or create counter
      let settings = (await base44.asServiceRole.entities.DemoSettings.filter({ role: roleType }))[0];
      
      if (!settings) {
        settings = await base44.asServiceRole.entities.DemoSettings.create({
          role: roleType,
          counter: 1,
        });
      }

      const counter = settings.counter;
      const email = `${roleType}+${counter}@${config.domain}`;

      // Invite user (platform only supports 'user' or 'admin')
      await base44.users.inviteUser(email, roleConfigs[roleType].inviteRole);

      // Increment counter
      await base44.asServiceRole.entities.DemoSettings.update(settings.id, {
        counter: counter + 1,
      });

      // Create matching entity record for the role
      if (roleType === 'client') {
        // Clients don't have a dedicated Client entity at invite time
        // This is created when they register
        createdAccounts.push({
          role: roleType,
          email,
          status: 'invited',
          note: 'Client record will be created on registration',
        });
      } else if (roleType === 'agent') {
        // Create Agent record
        await base44.asServiceRole.entities.Agent.create({
          company_name: `Demo Agent ${counter}`,
          account_type: 'agent',
          contact_name: email.split('@')[0],
          agents_count: 1,
        });
        createdAccounts.push({
          role: roleType,
          email,
          status: 'invited',
          note: 'Agent record created',
        });
      } else if (roleType === 'broker') {
        // Create Agent record with broker type
        await base44.asServiceRole.entities.Agent.create({
          company_name: `Demo Broker ${counter}`,
          account_type: 'broker_firm',
          agents_count: 1,
        });
        createdAccounts.push({
          role: roleType,
          email,
          status: 'invited',
          note: 'Broker firm record created',
        });
      } else if (roleType === 'superadmin') {
        createdAccounts.push({
          role: roleType,
          email,
          status: 'invited',
          note: 'Super admin account created',
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Demo users invited successfully',
      accounts: createdAccounts,
      instruction: 'Users will receive invite emails. They should click the invite link and set their password to "password".',
    });
  } catch (error) {
    console.error('Error generating demo users:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});