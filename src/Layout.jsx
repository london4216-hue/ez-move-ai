export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-100">
      {children}
    </div>
  );
}