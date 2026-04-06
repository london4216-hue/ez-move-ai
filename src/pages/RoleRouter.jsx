import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, ROLE_PATHS } from "@/lib/internalAuth";

export default function RoleRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate("/SignIn", { replace: true });
    } else {
      navigate(ROLE_PATHS[session.role] || "/SignIn", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}