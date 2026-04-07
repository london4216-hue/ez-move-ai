import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, AlertTriangle, Loader2, Package } from "lucide-react";

export default function BoxDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    base44.entities.Box.filter({ id }).then(r => {
      setBox(r[0] || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );

  if (!box) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-3">
      <Package className="w-12 h-12 text-slate-200" />
      <p className="text-slate-400 font-medium">Box not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <p className="font-black text-slate-900 text-sm">Box #{box.boxNumber || "—"} Details</p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {box.photo && (
          <img src={box.photo} alt="box" className="w-full h-56 object-cover rounded-2xl border border-slate-100" />
        )}

        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Room</p>
              <p className="text-lg font-black text-orange-500">{box.room}</p>
            </div>
            {box.fragile && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-black text-red-600">FRAGILE</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Contents</p>
            <p className="text-sm text-slate-700 leading-relaxed">{box.contentsSummary || "—"}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Weight Estimate</p>
            <p className="text-sm font-bold text-slate-700">{box.weightEstimate || "—"}</p>
          </div>
        </div>

        {box.qrCode && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center gap-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">QR Code</p>
            <img src={box.qrCode} alt="QR" className="w-32 h-32" />
          </div>
        )}
      </div>
    </div>
  );
}