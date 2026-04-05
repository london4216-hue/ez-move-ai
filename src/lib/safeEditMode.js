/**
 * SAFE EDIT MODE
 * ==============
 * Set to `true` while making structural edits to routing, portals, or navigation.
 * When enabled, RoleRouter will NOT auto-redirect — every route stays exactly where it is.
 *
 * ⚠️  This has ZERO effect on production end-user behavior.
 * ⚠️  Set back to `false` before deploying or demoing.
 *
 * Files protected by convention when this is true:
 *   - pages/RoleRouter      (redirects frozen)
 *   - lib/usePortalRole.js  (do not edit role logic)
 *   - App.jsx               (do not add/remove routes)
 *   - pages/Preview         (do not change module overview)
 *   - pages/SuperAdmin      (do not change sidebar nav)
 *   - pages/BrokerDashboard (do not change portal identity)
 *   - pages/AgentDashboard  (do not change portal identity)
 */
export const SAFE_EDIT_MODE = false;