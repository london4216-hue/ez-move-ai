export default function Preview() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-900/40">
          <span className="text-white font-black text-xl">EZ</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">EZ Move AI Preview</h1>
        <p className="text-slate-400 text-sm mb-6">Access the live preview environment:</p>
        <a
          href="https://app.base44.com/apps/69a4327be3c6be2ca74b3ad5/editor/preview"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
        >
          Open EZ Move AI Preview →
        </a>
        <p className="text-slate-500 text-xs mt-6">Testing environment · Powered by Base44</p>
      </div>
    </div>
  );
}