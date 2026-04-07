import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Printer, Download, AlertTriangle, Loader2 } from "lucide-react";

export default function LabelPreview() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const labelRef = useRef();

  useEffect(() => {
    if (!id) return;
    base44.entities.Box.filter({ id }).then(r => {
      setBox(r[0] || null);
      setLoading(false);
    });
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(labelRef.current, { scale: 2, backgroundColor: "#fff" });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `box-${box?.boxNumber || id}-label.png`;
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );

  if (!box) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400">Box not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 print:hidden">
        <button onClick={() => navigate("/BoxInventory")} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <p className="font-black text-slate-900 text-sm">Label Preview</p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* The printable label */}
        <div ref={labelRef} className="bg-white rounded-2xl border-2 border-slate-800 p-5 space-y-4">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EZ Move AI</p>
              <p className="text-4xl font-black text-slate-900">BOX #{box.boxNumber || "?"}</p>
              <p className="text-lg font-black text-orange-500 mt-1">{box.room}</p>
            </div>
            {box.fragile && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-black text-red-600">FRAGILE</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Contents</p>
            <p className="text-sm text-slate-700 leading-relaxed">{box.contentsSummary || "—"}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Weight</p>
              <p className="text-sm font-bold text-slate-700">{box.weightEstimate || "—"}</p>
            </div>
            {box.qrCode && (
              <img src={box.qrCode} alt="QR Code" className="w-20 h-20 rounded-xl border border-slate-100" />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 print:hidden">
          <button onClick={handlePrint}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownload}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-200">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>

        <button onClick={() => navigate("/AddBox")}
          className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm print:hidden">
          + Label Another Box
        </button>
        <button onClick={() => navigate("/BoxInventory")}
          className="w-full py-2.5 text-center text-xs text-slate-400 font-semibold print:hidden">
          View All Boxes →
        </button>
      </div>
    </div>
  );
}