// Determines which portal a user belongs to
// Supports both new explicit roles and legacy admin+account_type pattern

export function getPortalRole(user) {
  if (!user) return null;

  // Yopmail users get super_admin access for testing
  if (user.email?.toLowerCase().endsWith("@yopmail.com")) return "super_admin";

  // Explicit roles (including aliases)
  if (user.role === "super_admin" || user.role === "superadmin") return "super_admin";
  if (user.role === "broker") return "broker";
  if (user.role === "agent") return "agent";
  if (user.role === "buyer" || user.role === "seller" || user.role === "user") return "user";

  // Legacy: admin role → super_admin (platform owner / builder account)
  if (user.role === "admin") return "super_admin";

  return "user";
}

export function getPortalPath(user) {
  const role = getPortalRole(user);
  switch (role) {
    case "super_admin": return "/SuperAdmin";
    case "broker":      return "/BrokerDashboard";
    case "agent":       return "/AgentDashboard";
    case "user":        return "/Dashboard";
    default:            return "/Dashboard";
  }
}

export function canAccess(user, requiredRoles) {
  const role = getPortalRole(user);
  return requiredRoles.includes(role);
}