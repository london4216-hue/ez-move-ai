import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, Loader2, Sparkles, AlertTriangle } from "lucide-react";

const ROOMS = ["Bedroom","Living Room","Kitchen","Bathroom","Office","Garage","Dining Room","Kids Room","Storage","Other"];

export default function AddBox() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [room, setRoom] = useState("");
  const [fragile, setFragile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!room) return alert("Please select a room.");
    setLoading(true);

    let uploadedUrl = null;
    if (photo) {
      setStatus("Uploading photo…");
      const res = await base44.integrations.Core.UploadFile({ file: photo });
      uploadedUrl = res.file_url;
    }

    let contentsSummary = "Contents unknown";
    let weightEstimate = "Unknown";

    if (uploadedUrl) {
      setStatus("Analyzing with AI…");
      const ai = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this photo of a moving box or items. Provide: 1. A short contents summary (2-3 sentences max listing main items visible). 2. A weight estimate (e.g. "Light (~10 lbs)", "Medium (~25 lbs)", "Heavy (~50+ lbs)").`,
        file_urls: [uploadedUrl],
        response_json_schema: {
          type: "object",
          properties: {
            contentsSummary: { type: "string" },
            weightEstimate: { type: "string" }
          }
        }
      });
      contentsSummary = ai.contentsSummary || contentsSummary;
      weightEstimate = ai.weightEstimate || weightEstimate;
    }

    setStatus("Creating label…");

    // Count existing boxes for this user to assign box number
    const user = await base44.auth.me().catch(() => ({ id: "demo" }));
    const existing = await base44.entities.Box.filter({ userId: user.id });
    const boxNumber = (existing.length || 0) + 1;

    const box = await base44.entities.Box.create({
      userId: user.id,
      photo: uploadedUrl,
      room,
      contentsSummary,
      fragile,
      weightEstimate,
      boxNumber,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/box/" + "PLACEHOLDER")}`
    });

    // Update with real QR code now that we have box id
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/box/" + box.id)}`;
    await base44.entities.Box.update(box.id, { qrCode });

    setLoading(false);
    navigate("/LabelPreview?id=" + box.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <p className="font-black text-slate-900 text-sm">Smart QR Label</p>
          <p className="text-[11px] text-slate-400">New box</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Photo upload */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Box Photo (optional)</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-2 hover:border-orange-300 transition-colors overflow-hidden"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="box" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-400 font-medium">Tap to upload photo</p>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </div>

        {/* Room */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Room</label>
          <select value={room} onChange={e => setRoom(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400">
            <option value="">Select room…</option>
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Fragile toggle */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-700">Fragile</span>
          </div>
          <button
            onClick={() => setFragile(f => !f)}
            className={`w-12 h-6 rounded-full transition-colors relative ${fragile ? "bg-orange-500" : "bg-slate-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${fragile ? "left-7" : "left-1"}`} />
          </button>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !room}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{status || "Working…"}</>
          ) : (
            <><Sparkles className="w-4 h-4" />Generate Label</>
          )}
        </button>

        <p className="text-center text-xs text-slate-400">AI will analyze the photo to summarize contents and estimate weight.</p>
      </div>
    </div>
  );
}