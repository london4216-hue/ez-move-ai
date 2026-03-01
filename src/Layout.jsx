import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children, currentPageName }) {
  const isDashboard = currentPageName === "Dashboard";

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif; }
      `}</style>
      {children}
      {!isDashboard && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
          <div className="flex border-t border-[#E5E7EB] bg-white">
            <Link
              to={createPageUrl("Dashboard")}
              className="flex-shrink-0 px-5 py-3 flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#F97316]"
            >
              <span className="text-base">🏠</span>
              Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}