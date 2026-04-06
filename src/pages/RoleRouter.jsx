import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPortalPath } from "@/lib/usePortalRole";
import { SAFE_EDIT_MODE } from "@/lib/safeEditMode";
import { useUserContext } from "@/lib/useUserContext";

// Auto-redirects logged-in users to their portal.
// Non-authenticated users see the Preview/landing page.
export default function RoleRouter() {
  const navigate = useNavigate();
  const { authStatus, user, isLoading } = useUserContext();

  useEffect(() => {
    if (SAFE_EDIT_MODE) return;
    if (isLoading) return;

    if (authStatus !== "authenticated" || !user) {
      navigate("/Preview", { replace: true });
      return;
    }
    navigate(getPortalPath(user), { replace: true });
  }, [isLoading, authStatus, user]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}