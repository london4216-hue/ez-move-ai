/**
 * Feature Flags
 *
 * ENABLE_REGISTRATION — controls all user-visible registration/sign-up flows.
 *   false (default) = published app hides signup; existing users can still log in.
 *   true            = re-enables full registration flow for real client onboarding.
 *
 * To re-enable registration: set ENABLE_REGISTRATION = true here and redeploy.
 */
export const ENABLE_REGISTRATION = false;