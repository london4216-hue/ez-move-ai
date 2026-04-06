/**
 * Feature flags for controlling app functionality
 * Set ENABLE_REGISTRATION=true when real clients go live
 */

export const featureFlags = {
  ENABLE_REGISTRATION: false, // Hide signup/registration when false
};

// Named export for backward compatibility
export const ENABLE_REGISTRATION = featureFlags.ENABLE_REGISTRATION;

export default featureFlags;