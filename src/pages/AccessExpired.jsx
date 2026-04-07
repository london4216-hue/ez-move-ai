export default function AccessExpired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-white text-3xl">🔒</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-3">This demo link has expired</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          This link is no longer valid. Please request the latest version from your EZ Move AI representative.
        </p>
        <a
          href="mailto:london4216@gmail.com?subject=Request New Demo Link&body=Hi, I'd like to request the latest EZ Move AI demo link."
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Request New Demo Link →
        </a>
        <p className="text-slate-400 text-xs mt-6">EZ Move AI · Powered by AI</p>
      </div>
    </div>
  );
}