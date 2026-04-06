import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getPortalPath } from "@/lib/usePortalRole";

export default function RoleRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      navigate(getPortalPath(user), { replace: true });
    }).catch(() => {
      navigate("/AgentDashboard", { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}