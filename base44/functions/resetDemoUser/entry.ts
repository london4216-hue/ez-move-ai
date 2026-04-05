import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admins or the user themselves to reset
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Missing email parameter' }, { status: 400 });
    }

    // Fetch the user to reset
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = users[0];

    // Only admins or the user themselves can reset
    if (user.role !== 'admin' && user.email !== email) {
      return Response.json({ error: 'Forbidden: Can only reset your own account or be admin' }, { status: 403 });
    }

    // Update only the clean fields (don't change role if app owner)
    const updatePayload = {
      onboarded: false,
      registration_date: null,
      home_address: null,
      estimated_close_date: null,
      move_date: null,
      phone: null,
      estimated_move_cost: null,
    };

    // If not app owner, also reset role and account_type
    if (targetUser.email !== 'london4216@gmail.com' || user.role === 'super_admin') {
      updatePayload.role = 'agent';
      updatePayload.account_type = 'agent';
    }

    await base44.asServiceRole.entities.User.update(targetUser.id, updatePayload);

    return Response.json({
      success: true,
      message: `User ${email} has been reset — all client/seller data cleared. Routing via usePortalRole will handle role detection.`,
      user: {
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetUser.role,
        onboarded: false,
        registration_date: null,
      },
    });
  } catch (error) {
    console.error('resetDemoUser error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});