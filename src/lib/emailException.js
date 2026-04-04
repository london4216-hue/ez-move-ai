/**
 * Global email exception for testing
 * london4216@gmail.com is allowed:
 * - Unlimited registrations
 * - Any role (Super Admin, Broker, Agent, Buyer, Seller)
 * - Bypass all email validation
 * - No duplicate email restrictions
 */

export const EXCEPTION_EMAIL = 'london4216@gmail.com';

export function isExceptionEmail(email) {
  return email && email.toLowerCase().trim() === EXCEPTION_EMAIL.toLowerCase();
}