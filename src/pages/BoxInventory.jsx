import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Package, AlertTriangle, Loader2 } from "lucide-react";
import { PUBLIC_DEMO_MODE } from "@/lib/featureFlags";

function getDemoUserId() {
  return localStorage.getItem('demo_user_id') || 'demo-user';
}

export default function BoxInventory() {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const userId = PUBLIC_DEMO_MODE
        ? getDemoUserId()
        : (await base44.auth.me().catch(() => null))?.id;
      if (!userId) { setLoading(false); return; }
      const res = await base44.entities.Box.filter({ userId }, "-created_date");
      setBoxes(res || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <p className="font-black text-slate-900 text-sm">QR Labels & Box Inventory</p>
            <p className="text-[11px] text-slate-400">{boxes.length} box{boxes.length !== 1 ? "es" : ""} labeled</p>
          </div>
        </div>
        <button onClick={() => navigate("/AddBox")}
          className="w-9 h-9 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="px-4 py-5 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {!loading && boxes.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-500 text-center">No boxes labeled yet</p>
            <p className="text-xs text-slate-400 text-center max-w-52">Upload a photo of a box and we'll generate a smart QR label with AI-analyzed contents.</p>
            <button onClick={() => navigate("/AddBox")}
              className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-black text-sm shadow-md shadow-orange-200">
              + Label First Box
            </button>
          </div>
        )}

        {boxes.map(box => (
          <button key={box.id} onClick={() => navigate("/LabelPreview?id=" + box.id)}
            className="w-full bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
            {box.photo ? (
              <img src={box.photo} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-black text-slate-900 text-sm">Box #{box.boxNumber || "?"}</p>
                {box.fragile && <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
              </div>
              <p className="text-xs font-bold text-orange-500 mb-1">{box.room}</p>
              <p className="text-xs text-slate-400 truncate">{box.contentsSummary || "No description"}</p>
            </div>
            {box.qrCode && <img src={box.qrCode} alt="qr" className="w-10 h-10 flex-shrink-0 rounded-lg" />}
          </button>
        ))}
      </div>
    </div>
  );
}