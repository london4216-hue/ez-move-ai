/**
 * Global email exception handler
 * london4216@gmail.com is allowed to:
 * - Register unlimited times
 * - Act as any role
 * - Bypass duplicate email validation
 * - Bypass role restrictions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EXCEPTION_EMAIL = 'london4216@gmail.com';

export function isExceptionEmail(email) {
  return email && email.toLowerCase().trim() === EXCEPTION_EMAIL.toLowerCase();
}

Deno.serve(async (req) => {
  try {
    const { email, action } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const isException = isExceptionEmail(email);

    // Return exception status
    return Response.json({
      email,
      isException,
      action,
      allowedActions: isException ? ['register_unlimited', 'any_role', 'bypass_validation', 'bypass_duplicates'] : []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});