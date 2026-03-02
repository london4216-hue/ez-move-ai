export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif; background-color: #f1f5f9; }
      `}</style>
      {children}
    </div>
  );
}