import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can purge demo users
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const demoPatterns = ['agent+', 'newbuyer+', 'broker+', 'superadmin+'];

    let deletedCount = 0;
    let resetCounters = 0;

    // Delete all demo users
    const allUsers = await base44.asServiceRole.entities.User.list();
    for (const u of allUsers) {
      if (demoPatterns.some(pattern => u.email.includes(pattern))) {
        await base44.asServiceRole.entities.User.delete(u.id);
        deletedCount++;
      }
    }

    // Delete demo Agent records (those with "Demo Agent" or "Demo Broker" in company_name)
    const allAgents = await base44.asServiceRole.entities.Agent.list();
    for (const agent of allAgents) {
      if (agent.company_name && (agent.company_name.includes('Demo Agent') || agent.company_name.includes('Demo Broker'))) {
        await base44.asServiceRole.entities.Agent.delete(agent.id);
      }
    }

    // Reset all DemoSettings counters to 1
    const allSettings = await base44.asServiceRole.entities.DemoSettings.list();
    for (const setting of allSettings) {
      await base44.asServiceRole.entities.DemoSettings.update(setting.id, { counter: 1 });
      resetCounters++;
    }

    return Response.json({
      success: true,
      message: 'Demo users purged successfully',
      deleted_users: deletedCount,
      reset_counters: resetCounters,
    });
  } catch (error) {
    console.error('Error purging demo users:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});