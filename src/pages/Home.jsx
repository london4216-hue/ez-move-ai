import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user?.onboarded) {
          navigate(createPageUrl("Dashboard"));
        } else {
          navigate(createPageUrl("Register"));
        }
      })
      .catch(() => navigate(createPageUrl("Register")));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#4F7EFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}