/**
 * PortalGuard — wraps any portal page and handles auth/role checks.
 *
 * Props:
 *   allowedRoles  - array of roles that may access this portal (e.g. ["agent","super_admin"])
 *   loginHint     - next-URL hint sent to the login redirect (e.g. "/AgentDashboard")
 *   children      - rendered only when auth + role checks pass
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useUserContext } from "@/lib/useUserContext";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";

export default function PortalGuard({ allowedRoles, loginHint, children }) {
  const { authStatus, role, isLoading } = useUserContext();
  const navigate = useNavigate();

  const { user } = useUserContext();
  // Super admins bypass all role checks (yopmail OR explicit super_admin role)
  const isSuperAdmin = user?.email?.toLowerCase().endsWith("@yopmail.com") || ["super_admin", "superadmin", "admin"].includes(user?.role);

  useEffect(() => {
    if (isLoading) return;
    // In demo mode, skip all auth/role checks
    if (PUBLIC_DEMO_MODE) return;
    if (authStatus !== "authenticated") {
      base44.auth.redirectToLogin(loginHint || "/");
      return;
    }
    // Super admins bypass role checks for testing/oversight
    if (isSuperAdmin) return;
    if (!role || !allowedRoles.includes(role)) {
      navigate("/", { replace: true });
    }
  }, [isLoading, authStatus, role, isSuperAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!PUBLIC_DEMO_MODE && authStatus !== "authenticated") return null;
  if (!PUBLIC_DEMO_MODE && !isSuperAdmin && (!role || !allowedRoles.includes(role))) return null;

  return children;
}