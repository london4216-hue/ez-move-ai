import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getPortalPath } from "@/lib/usePortalRole";
import { SAFE_EDIT_MODE } from "@/lib/safeEditMode";

// Auto-redirects logged-in users to their portal.
// Non-authenticated users see the Preview/landing page.
export default function RoleRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    // SAFE_EDIT_MODE: skip all redirects so routes stay frozen during structural edits
    if (SAFE_EDIT_MODE) return;

    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        navigate("/Preview", { replace: true });
        return;
      }
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        navigate("/Preview", { replace: true });
        return;
      }
      navigate(getPortalPath(user), { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}