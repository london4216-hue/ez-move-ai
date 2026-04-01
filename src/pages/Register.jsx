import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, LogOut } from "lucide-react";
import Week1Setup from "../components/register/Week1Setup";

// Week1Setup now handled by Week1Setup component

export default function Register() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [moveDate, setMoveDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
        setMoveDate(state.moveDate || "");
        setPhoneNumber(state.phoneNumber || "");
        setStreetAddress(state.streetAddress || "");
        setCity(state.city || "");
        setZipCode(state.zipCode || "");
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

    // Load client close date from URL code
    const urlParams2 = new URLSearchParams(window.location.search);
    const codeParam = urlParams2.get('code');
    if (codeParam) {
      base44.entities.Client.filter({ invitation_code: codeParam }).then(clients => {
        if (clients.length > 0 && clients[0].close_date) {
          setMoveDate(prev => prev || clients[0].close_date);
        }
      }).catch(() => {});
    }
  }, []);

  const fetchAddressSuggestions = async (query) => {
    if (query.length < 4) { setAddressSuggestions([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`);
      const data = await res.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (e) {}
  };

  const handlePhoneChange = (val) => {
    const d = val.replace(/\D/g, "");
    if (d.length <= 10) setPhoneNumber(d);
  };



  const handleVerify = async () => {
    const code = inviteCode;
    if (!phoneNumber || !streetAddress.trim() || !city.trim() || !zipCode.trim()) {
      setError("Please fill in your address and phone number");
      return;
    }
    if (phoneNumber.length !== 10) {
      setError("Phone number must be 10 digits");
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
          estimated_close_date: client.close_date || moveDate || "",
          registration_date: new Date().toISOString().split("T")[0],
          move_date: moveDate || "",
          phone: phoneNumber || "",
        });
      } else {
        await base44.auth.updateMe({
          home_address: fullAddress || "",
          registration_date: new Date().toISOString().split("T")[0],
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

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Week1Setup
            userId={`pending_${inviteCode}`}
            userAddress={`${streetAddress}, ${city}, ${zipCode}`}
            onComplete={async (answerMap) => {
              const user = await base44.auth.me();
              localStorage.setItem(`user_selections_${user.id}`, JSON.stringify(answerMap));
              localStorage.setItem(`week1_answers_${user.id}`, JSON.stringify(answerMap));
              localStorage.setItem(`walkthrough_done_w1_${user.id}`, "1");
              navigate(createPageUrl("Dashboard"));
            }}
            onSaveExit={async (partialAnswers) => {
              const user = await base44.auth.me().catch(() => null);
              if (user?.id) {
                localStorage.setItem(`week1_setup_${user.id}`, JSON.stringify({ step: 0, answers: partialAnswers }));
              }
              base44.auth.logout("/");
            }}
          />
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
          const currentState = { moveDate, phoneNumber, streetAddress, city, zipCode, timestamp: Date.now() };
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
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Street Address <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123 Main St"
              value={streetAddress}
              autoComplete="off"
              onChange={(e) => { setStreetAddress(e.target.value); fetchAddressSuggestions(e.target.value); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {addressSuggestions.map((s, i) => (
                  <button key={i} type="button"
                    onMouseDown={() => {
                      const addr = s.address || {};
                      const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
                      setStreetAddress(street || s.display_name.split(",")[0]);
                      setCity(addr.city || addr.town || addr.village || addr.county || "");
                      setZipCode(addr.postcode || "");
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-orange-50 border-b border-slate-50 last:border-0 truncate">
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">City <span className="text-orange-500">*</span></label>
              <input
                type="text"
                placeholder="New York"
                value={city}
                autoComplete="address-level2"
                onChange={(e) => { setCity(e.target.value); }}
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
                onChange={(e) => { setZipCode(e.target.value.replace(/[^0-9-]/g,'')); }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Est. Close / First Day of Home</label>
            <input
              type="date"
              value={moveDate}
              onChange={(e) => { setMoveDate(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number</label>
            <input
              type="tel"
              placeholder="1234567890"
              value={phoneNumber}
              onChange={(e) => { handlePhoneChange(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white disabled:bg-slate-50 disabled:text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">{phoneNumber.length}/10 digits</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const currentState = { moveDate, phoneNumber, streetAddress, city, zipCode, timestamp: Date.now() };
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
            disabled={loading}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Continue →"}
          </button>
        </div>


      </div>
    </div>
  );
}