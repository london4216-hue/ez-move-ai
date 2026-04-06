import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";

export default function Register() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [moveDate, setMoveDate] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code') || localStorage.getItem('pending_invite_code');

    // Persist code to localStorage so it survives the login redirect
    if (urlParams.get('code')) {
      localStorage.setItem('pending_invite_code', urlParams.get('code'));
    }

    base44.auth.isAuthenticated().then(async (isAuthed) => {
      if (!isAuthed) {
        // Not logged in — redirect to login and return to this exact URL (with ?code=)
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const user = await base44.auth.me();

      // If there's an invite code, verify the logged-in user is the intended recipient.
      if (codeFromUrl) {
        const clients = await base44.entities.Client.filter({ invitation_code: codeFromUrl }).catch(() => []);
        const clientRecord = clients[0];

        const wrongUser =
          // Admin/agent is logged in — they should never go through client onboarding
          user.role === 'admin' ||
          // A specific client email is expected and it doesn't match the current user
          (clientRecord?.user_email && clientRecord.user_email !== user.email);

        if (wrongUser) {
          // Log out the current user and redirect straight back to this invite URL
          // so the correct client can log in fresh
          base44.auth.logout(window.location.href);
          return;
        }

        // Clear stale onboarding flags so journey starts fresh for this client
        localStorage.removeItem(`onboarding_done_${user.id}`);
        localStorage.removeItem(`onboarding_progress_${user.id}`);
        localStorage.removeItem(`week1_setup_${user.id}`);
      } else if (user?.registration_date) {
        // No invite code and already registered — go straight to dashboard
        navigate(createPageUrl("Dashboard"));
        return;
      }
    }).catch(() => {
      // On any auth error, redirect to login preserving current URL
      base44.auth.redirectToLogin(window.location.href);
    });

    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      base44.entities.Client.filter({ invitation_code: codeFromUrl }).then(clients => {
        if (clients.length > 0) {
          if (clients[0].close_date) setMoveDate(clients[0].close_date);
          if (clients[0].home_address) {
            const parts = clients[0].home_address.split(",").map(s => s.trim());
            setStreetAddress(parts[0] || "");
            if (parts.length >= 3) {
              setCity(parts[1] || "");
              const stateZip = (parts[2] || "").trim().split(" ");
              setZipCode(stateZip[stateZip.length - 1] || "");
            }
          }
        }
      }).catch(() => {});
    } else {
      // Only restore saved progress if NO invite code in URL
      const savedProgress = localStorage.getItem('register_progress');
      if (savedProgress) {
        try {
          const state = JSON.parse(savedProgress);
          setMoveDate(state.moveDate || "");
          setStreetAddress(state.streetAddress || "");
          setCity(state.city || "");
          setZipCode(state.zipCode || "");
        } catch (e) {}
      }
    }
  }, []);

  const fetchAddressSuggestions = async (query) => {
    if (query.length < 3) { setAddressSuggestions([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`);
      const data = await res.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (e) {}
  };

  const handleVerify = async () => {
    if (!streetAddress.trim() || !city.trim() || !zipCode.trim()) {
      setError("Please fill in your address");
      return;
    }
    setLoading(true);
    setError("");
    const code = inviteCode;
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        setError("Not authenticated. Please reload.");
        setLoading(false);
        return;
      }
      const fullAddress = `${streetAddress}, ${city}, ${zipCode}`;
      const clients = code ? await base44.entities.Client.filter({ invitation_code: code }) : [];
      if (code && code !== "1016" && clients.length === 0) {
        setError("Invalid invite link. Contact your agent.");
        setLoading(false);
        return;
      }
      if (clients.length > 0) {
        await base44.entities.Client.update(clients[0].id, { status: "registered", user_email: currentUser.email });
      }
      await base44.auth.updateMe({
        home_address: fullAddress,
        estimated_close_date: clients.length > 0 ? clients[0].close_date : moveDate,
        registration_date: new Date().toISOString().split("T")[0],
      });
      localStorage.removeItem('register_progress');
      localStorage.removeItem('pending_invite_code');
      // Clear onboarding so Dashboard always shows the modal fresh
      localStorage.removeItem(`onboarding_done_${currentUser.id}`);
      localStorage.removeItem(`onboarding_progress_${currentUser.id}`);
      localStorage.removeItem(`week1_setup_${currentUser.id}`);
      // Set a flag so Dashboard knows to force-show the onboarding modal
      localStorage.setItem('just_registered', currentUser.id);
      setLoading(false);
      navigate(createPageUrl("Dashboard"));
    } catch (e) {
      console.error("Register handleVerify error:", e);
      setError("Something went wrong: " + (e?.message || "Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8">

      <button
        onClick={() => {
          const currentState = { moveDate, streetAddress, city, zipCode, timestamp: Date.now() };
          localStorage.setItem('register_progress', JSON.stringify(currentState));
          base44.auth.logout();
        }}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all text-sm font-semibold shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        Save & Exit
      </button>

      <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white text-sm font-black">EZ</span>
          </div>
          <span className="text-slate-800 font-bold text-lg tracking-tight">
            EZ Move <span className="text-orange-500">AI</span>
          </span>
        </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-xl border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-slate-800 mb-2">Welcome to <span className="text-orange-500">EZ Move AI</span></h1>
          <p className="text-sm text-slate-500 leading-relaxed">Enter your new home address to get your personalized move plan.</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Home Address <span className="text-orange-500">*</span>
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
              <input type="text" placeholder="New York" value={city} autoComplete="address-level2"
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">ZIP Code <span className="text-orange-500">*</span></label>
              <input type="text" placeholder="10001" value={zipCode} autoComplete="postal-code" inputMode="numeric" maxLength={10}
                onChange={(e) => setZipCode(e.target.value.replace(/[^0-9-]/g, ''))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Est. Close Date <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
        )}

        <button onClick={handleVerify} disabled={loading}
          className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 min-h-[52px]"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Continue →"}
        </button>
      </div>
    </div>
  );
}