/**
 * PublicVersionGate
 * Wraps any public page. Checks if URL ?v= matches the current
 * published version stored in AppSettings. Redirects to /AccessExpired if not.
 *
 * Authenticated users (logged-in) bypass the check entirely.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function PublicVersionGate({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Authenticated users always pass
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) { setChecking(false); return; }

      // Read ?v= from URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlVersion = urlParams.get("v");

      // Fetch current version from DB
      let currentVersion = "1";
      try {
        const settings = await base44.entities.AppSettings.filter({ key: "public_version" });
        if (settings.length > 0) currentVersion = settings[0].value;
      } catch {
        // If fetch fails, let them through (don't punish network errors)
        setChecking(false);
        return;
      }

      // If no ?v= at all, or version mismatch → expired
      if (!urlVersion || urlVersion !== currentVersion) {
        navigate("/AccessExpired");
        return;
      }

      setChecking(false);
    };

    check();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}