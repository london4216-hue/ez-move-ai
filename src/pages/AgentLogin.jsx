import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// This page just handles redirects — the main portal is Home
export default function AgentLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.role === "super_admin") navigate("/SuperAdmin");
      else if (user?.role === "admin") navigate(createPageUrl("AgentDashboard"));
      else if (user?.registration_date && !user?.needs_onboarding) navigate(createPageUrl("Dashboard"));
      else if (user) navigate(createPageUrl("Register"));
      else navigate("/");
    }).catch(() => navigate("/"));
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}