// Guards a portal page — redirects to /login if not authenticated or wrong role
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "@/lib/internalAuth";

export default function InternalGuard({ allowedRole, children }) {
  const navigate = useNavigate();
  const user = getSession();

  useEffect(() => {
    if (!user) { navigate("/Login", { replace: true }); return; }
    if (user.role !== allowedRole) { navigate("/Login", { replace: true }); }
  }, []);

  if (!user || user.role !== allowedRole) return null;
  return children;
}