import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronRight, CheckCircle2, ChevronLeft, LogOut } from "lucide-react";

const week1Questions = [
  { id: "w1-1", title: "Confirm what stays vs. goes", description: "Furniture, appliances, personal items" },
  { id: "w1-2", title: "Estate sale decision", description: "Find local estate sale professionals" },
  { id: "w1-3", title: "Request mover quotes", description: "Compare 3 top-rated movers side by side" },
  { id: "w1-4", title: "Start donation / sell pile", description: "What's worth selling vs. donating" }
];

export default function Register() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [estimatedMoveCost, setEstimatedMoveCost] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.registration_date) navigate(createPageUrl("Dashboard"));
    }).catch(() => {});
    
    // Extract invite code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) setInviteCode(codeFromUrl);
    
    // Restore saved progress
    const savedProgress = localStorage.getItem('register_progress');
    if (savedProgress) {
      try {
        const state = JSON.parse(savedProgress);
        setEstimatedMoveCost(state.estimatedMoveCost || "");
        setMoveDate(state.moveDate || "");
        setPhoneNumber(state.phoneNumber || "");
        setStreetAddress(state.streetAddress || "");
        setCity(state.city || "");
        setZipCode(state.zipCode || "");
        setDetailsSaved(state.detailsSaved || false);
      } catch (e) {}
    }

    // Auto-detect location
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address || {};
          const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
          setStreetAddress(prev => prev || street || "");
          setCity(prev => prev || addr.city || addr.town || addr.village || addr.county || "");
          setZipCode(prev => prev || addr.postcode || "");
        } catch (e) {}
        setLocationLoading(false);
      }, () => setLocationLoading(false));
    }
  }, []);

  const handlePhoneChange = (val) => {
    const d = val.replace(/\D/g, "");
    if (d.length <= 10) setPhoneNumber(d);
  };

  const handleSaveDetails = () => {
    if (!moveDate || !estimatedMoveCost || !phoneNumber || !streetAddress.trim() || !city.trim() || !zipCode.trim()) {
      setError("Please fill in all fields including your address");
      return;
    }
    if (phoneNumber.length !== 10) {
      setError("Phone number must be 10 digits");
      return;
    }
    setDetailsSaved(true);
    setError("");
  };

  const handleVerify = async () => {
    const code = inviteCode;
    if (!detailsSaved) {
      setError("Please save your move details first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const currentUser = await base44.auth.me();
      const fullAddress = `${streetAddress}, ${city}, ${zipCode}`;
      const clients = await base44.entities.Client.filter({ invitation_code: code });
      if (clients.length === 0 && code !== "1016") {
        setError("Invalid invite link. Contact your agent.");
        setLoading(false);
        return;
      }
      if (clients.length > 0) {
        const client = clients[0];
        await base44.entities.Client.update(client.id, { status: "registered", user_email: currentUser.email });
        await base44.auth.updateMe({
          home_address: fullAddress || client.home_address || "",
          estimated_close_date: client.close_date || "",
          registration_date: new Date().toISOString().split("T")[0],
          estimated_move_cost: estimatedMoveCost || "",
          move_date: moveDate || "",
          phone: phoneNumber || "",
        });
      } else {
        await base44.auth.updateMe({
          home_address: fullAddress || "",
          registration_date: new Date().toISOString().split("T")[0],
          estimated_move_cost: estimatedMoveCost || "",
          move_date: moveDate || "",
          phone: phoneNumber || "",
        });
      }
      setLoading(false);
      setShowOnboarding(true);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    const question = week1Questions[onboardingStep];
    const updatedAnswers = { ...answers, [question.id]: answer };
    setAnswers(updatedAnswers);
    
    if (onboardingStep === week1Questions.length - 1) {
      // Save Week 1 selections and mark as complete
      const user = await base44.auth.me();
      
      // Save the answers directly (IDs already match w1-1, w1-2, w1-3, w1-4)
      const taskSelections = updatedAnswers;
      
      localStorage.setItem(`user_selections_${user.id}`, JSON.stringify(taskSelections));
      localStorage.setItem(`week1_answers_${user.id}`, JSON.stringify(taskSelections));
      localStorage.setItem(`walkthrough_done_w1_${user.id}`, "1");
      navigate(createPageUrl("Dashboard"));
    } else {
      setOnboardingStep(prev => prev + 1);
    }
  };

  const currentQuestion = week1Questions[onboardingStep];
  const progress = ((onboardingStep) / week1Questions.length) * 100;

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-end justify-center">
        <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <button
              onClick={() => {
                if (onboardingStep > 0) {
                  setOnboardingStep(prev => prev - 1);
                } else {
                  setShowOnboarding(false);
                }
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-bold">Back</span>
            </button>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Week 1 Setup · {onboardingStep + 1}/{week1Questions.length}
            </p>
            <div className="flex gap-1">
              {week1Questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < onboardingStep ? "bg-orange-500 w-3" : i === onboardingStep ? "bg-orange-400 w-5" : "bg-slate-200 w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-5 pt-4 pb-8">
            <div className="mb-6">
              <p className="text-2xl mb-3">
                {onboardingStep === 0 ? "📋" : onboardingStep === 1 ? "🚚" : onboardingStep === 2 ? "📦" : "⚡"}
              </p>
              <h2 className="text-xl font-black text-slate-900 mb-2">{currentQuestion.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{currentQuestion.description}</p>
            </div>

            <p className="text-xs text-slate-400 font-semibold mb-3">Will you do this this week?</p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleAnswer("yes")}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes, add to my plan
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => handleAnswer("maybe")}
                className="w-full py-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-700 text-sm font-bold active:scale-[0.98] transition-transform"
              >
                🤔 Maybe — add later
              </button>
              <button
                onClick={() => handleAnswer("skip")}
                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-400 text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                ⏰ Not at this time
              </button>
              {onboardingStep > 0 && (
                <button
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
      <div className="absolute top-5 left-5">
        <h1 className="text-2xl font-black text-slate-800">Version 7</h1>
      </div>
      
      <button
        onClick={() => {
          const currentState = { estimatedMoveCost, moveDate, phoneNumber, streetAddress, city, zipCode, detailsSaved, timestamp: Date.now() };
          localStorage.setItem('register_progress', JSON.stringify(currentState));
          base44.auth.logout();
        }}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-semibold"
      >
        <LogOut className="w-4 h-4" />
        Save & Exit
      </button>
      
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white text-sm font-black">EZ</span>
          </div>
          <span className="text-slate-800 font-bold text-lg tracking-tight">
            EZ Move <span className="text-orange-500">AI</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl mt-16">
        <div className="text-center mb-6">
          <h1 className="text-lg font-black text-slate-800 mb-1">Set Up Your Move</h1>
          <p className="text-sm text-slate-500">Fill in your details to get started</p>
          {locationLoading && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-xs text-blue-600 font-semibold">Detecting your location...</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {!detailsSaved ? (
            <button
              onClick={handleSaveDetails}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm active:scale-[0.98] transition-all"
            >
              Save Details
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600">Details saved</span>
            </div>
          )}
          
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Street Address <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123 Main St"
              value={streetAddress}
              autoComplete="street-address"
              onChange={(e) => { setStreetAddress(e.target.value); setDetailsSaved(false); }}
              disabled={detailsSaved}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">City <span className="text-orange-500">*</span></label>
              <input
                type="text"
                placeholder="New York"
                value={city}
                autoComplete="address-level2"
                onChange={(e) => { setCity(e.target.value); setDetailsSaved(false); }}
                disabled={detailsSaved}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">ZIP Code <span className="text-orange-500">*</span></label>
              <input
                type="text"
                placeholder="10001"
                value={zipCode}
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={10}
                onChange={(e) => { setZipCode(e.target.value.replace(/[^0-9-]/g,'')); setDetailsSaved(false); }}
                disabled={detailsSaved}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Move Date</label>
            <input
              type="date"
              value={moveDate}
              onChange={(e) => { setMoveDate(e.target.value); setDetailsSaved(false); }}
              disabled={detailsSaved}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Estimated Move Cost</label>
            <input
              type="text"
              placeholder="e.g., $2,500"
              value={estimatedMoveCost}
              onChange={(e) => { setEstimatedMoveCost(e.target.value); setDetailsSaved(false); }}
              disabled={detailsSaved}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number</label>
            <input
              type="tel"
              placeholder="1234567890"
              value={phoneNumber}
              onChange={(e) => { handlePhoneChange(e.target.value); setDetailsSaved(false); }}
              disabled={detailsSaved}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">{phoneNumber.length}/10 digits</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const currentState = { estimatedMoveCost, moveDate, phoneNumber, streetAddress, city, zipCode, detailsSaved, timestamp: Date.now() };
              localStorage.setItem('register_progress', JSON.stringify(currentState));
              navigate(-1);
            }}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || !detailsSaved}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Continue →"}
          </button>
        </div>


      </div>
    </div>
  );
}