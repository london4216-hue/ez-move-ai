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

export default function PortalGuard({ allowedRoles, loginHint, children }) {
  const { authStatus, role, isLoading } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // wait for auth to resolve

    if (authStatus !== "authenticated") {
      base44.auth.redirectToLogin(loginHint || "/");
      return;
    }

    if (!role || !allowedRoles.includes(role)) {
      // Authenticated but wrong role — send to root so RoleRouter can redirect
      navigate("/", { replace: true });
    }
  }, [isLoading, authStatus, role]);

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

  if (authStatus !== "authenticated" || !role || !allowedRoles.includes(role)) {
    // Guard is redirecting — render nothing
    return null;
  }

  return children;
}