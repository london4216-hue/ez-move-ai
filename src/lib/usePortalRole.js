// Determines which portal a user belongs to
// Supports both new explicit roles and legacy admin+account_type pattern

export function getPortalRole(user) {
  if (!user) return null;

  // Check nested data.user_type first (takes precedence)
  if (user.data?.user_type === "seller") return "user"; // client/buyer
  if (user.data?.user_type === "agent") return "agent";
  if (user.data?.user_type === "broker") return "broker";

  // New explicit roles
  if (user.role === "super_admin") return "super_admin";
  if (user.role === "broker") return "broker";
  if (user.role === "agent") return "agent";
  if (user.role === "user") return "user";

  // Legacy: admin role with account_type
  if (user.role === "admin") {
    if (user.account_type === "broker") return "broker";
    return "agent"; // default admin = agent
  }

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