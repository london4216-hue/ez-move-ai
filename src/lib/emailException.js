// Global email exception for testing
const TEST_EMAIL = "london4216@gmail.com";

export const isTestEmail = (email) => {
  return email?.toLowerCase() === TEST_EMAIL.toLowerCase();
};

export const allowTestEmailException = (email) => {
  // Always allow test email for:
  // - Registration (unlimited times)
  // - Login (any role)
  // - Onboarding
  // - Portal access
  // - License assignment
  // - Role assignment
  // - Any validation that checks unique emails
  return isTestEmail(email);
};