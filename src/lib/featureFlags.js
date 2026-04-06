/**
 * Feature flags for controlling app functionality
 * Set ENABLE_REGISTRATION=true when real clients go live
 */

export const featureFlags = {
  ENABLE_REGISTRATION: false, // Hide signup/registration when false
  PUBLIC_DEMO_MODE: true, // When true: blocks all signup routes, removes personal email from landing
};

// Named exports for backward compatibility
export const ENABLE_REGISTRATION = featureFlags.ENABLE_REGISTRATION;
export const PUBLIC_DEMO_MODE = featureFlags.PUBLIC_DEMO_MODE;

export default featureFlags;