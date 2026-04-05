import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Truck, Users, Clock, DollarSign, MapPin, Package, ChevronDown, ChevronUp } from "lucide-react";

const TRUCK_SIZES = [
  { label: "Cargo Van",    maxCuFt: 250,  crewMin: 1, label2: "Studio / 1 room"      },
  { label: '10" Truck',   maxCuFt: 400,  crewMin: 2, label2: "1 BR apartment"         },
  { label: '14" Truck',   maxCuFt: 700,  crewMin: 2, label2: "2 BR apartment"         },
  { label: '17" Truck',   maxCuFt: 1000, crewMin: 3, label2: "3 BR home"              },
  { label: '20" Truck',   maxCuFt: 1400, crewMin: 3, label2: "4 BR home"              },
  { label: '26" Truck',   maxCuFt: 1800, crewMin: 4, label2: "5+ BR / large home"     },
];

const ROOM_VOLUMES = {
  "Studio / 1 Room": 300, "1 Bedroom": 500, "2 Bedrooms": 800,
  "3 Bedrooms": 1200, "4 Bedrooms": 1600, "5+ Bedrooms": 2000,
};

function getTruck(cuFt) {
  return TRUCK_SIZES.find(t => cuFt <= t.maxCuFt) || TRUCK_SIZES[TRUCK_SIZES.length - 1];
}

function Row({ label, value, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-slate-100 last:border-0 ${highlight ? "font-black text-slate-800" : ""}`}>
      <span className={`text-sm ${highlight ? "text-slate-800" : "text-slate-500"}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-slate-900 text-base" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

// Real driving distance via OSRM
async function getDrivingInfo(fromAddr, toAddr) {
  const geocode = async (addr) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1&countrycodes=us`);
    const d = await res.json();
    if (!d[0]) return null;
    return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) };
  };

  const [from, to] = await Promise.all([geocode(fromAddr), geocode(toAddr)]);
  if (!from || !to) return null;

  try {
    const osrm = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`
    );
    const data = await osrm.json();
    if (data.routes?.[0]) {
      const meters = data.routes[0].distance;
      const seconds = data.routes[0].duration;
      return {
        miles: Math.round(meters * 0.000621371),
        hours: Math.round(seconds / 3600 * 10) / 10,
      };
    }
  } catch {}

  // Haversine fallback
  const R = 3958.8;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lon - from.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(from.lat*Math.PI/180)*Math.cos(to.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  const miles = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  return { miles, hours: Math.round(miles / 50 * 10) / 10 };
}

export default function MoveQuoteCalculator({ client, onClose }) {
  const [form, setForm] = useState({
    homeSize:      "2 Bedrooms",
    boxes:         20,
    specialItems:  0,
    stairs:        0,
    needsPacking:  false,
    parkingDist:   "Close (< 50 ft)",
  });
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const calc = async () => {
    setLoading(true);
    setQuote(null);

    const from = client.moving_from_address;
    const to   = client.home_address;
    let driving = null;
    if (from && to) driving = await getDrivingInfo(from, to);

    const miles     = driving?.miles ?? (client.estimated_miles || 50);
    const driveHrs  = driving?.hours ?? Math.round(miles / 50 * 10) / 10;

    const cuFt      = (ROOM_VOLUMES[form.homeSize] || 800) + form.boxes * 1.5 + form.specialItems * 30;
    const truck     = getTruck(cuFt);
    const crew      = truck.crewMin;

    const LABOR_RATE     = 85;   // $/hr per mover
    const FUEL_PER_MILE  = 0.25;
    const TRUCK_RATE     = 120;  // flat truck day rate
    const PACKING_FLAT   = form.needsPacking ? 300 : 0;
    const STAIRS_SURCHARGE = form.stairs * 75;
    const PARKING_SURCHARGE = form.parkingDist.includes(">") ? 100 : 0;

    // Local vs long-distance logic
    const isLongDistance = miles > 100;
    let laborHrs, laborCost, fuelCost, truckCost, totalMin, totalMax;

    if (isLongDistance) {
      laborHrs  = 4 + driveHrs + 3; // load + drive + unload
      laborCost = Math.round(laborHrs * crew * LABOR_RATE);
      fuelCost  = Math.round(miles * FUEL_PER_MILE * 2);
      truckCost = Math.round(TRUCK_RATE * Math.ceil(driveHrs / 8 + 1));
    } else {
      laborHrs  = 2 + (cuFt / 200) + driveHrs;
      laborCost = Math.round(laborHrs * crew * LABOR_RATE);
      fuelCost  = Math.round(miles * FUEL_PER_MILE * 2);
      truckCost = TRUCK_RATE;
    }

    const base  = laborCost + fuelCost + truckCost + PACKING_FLAT + STAIRS_SURCHARGE + PARKING_SURCHARGE;
    totalMin    = Math.round(base * 0.92 / 50) * 50;
    totalMax    = Math.round(base * 1.12 / 50) * 50;

    setQuote({
      miles, driveHrs, cuFt,
      truck: truck.label, crew,
      laborHrs: Math.round(laborHrs * 10) / 10,
      laborCost, fuelCost, truckCost,
      packingCost: PACKING_FLAT,
      stairsCost: STAIRS_SURCHARGE,
      parkingCost: PARKING_SURCHARGE,
      totalMin, totalMax,
      isLongDistance,
    });
    setLoading(false);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">Move Quote Calculator</p>
              <p className="text-slate-400 text-[10px]">{client.user_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Route banner */}
          {(client.moving_from_address || client.home_address) && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Route</p>
              {client.moving_from_address && (
                <div className="flex items-start gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-xs">{client.moving_from_address}</p>
                </div>
              )}
              {client.home_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-xs">{client.home_address}</p>
                </div>
              )}
              {client.estimated_miles != null && (
                <p className="text-blue-600 text-xs font-bold mt-2">📍 ~{client.estimated_miles} miles (stored)</p>
              )}
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Home Size</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(ROOM_VOLUMES).map(s => (
                  <button key={s} onClick={() => set("homeSize", s)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${form.homeSize === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                  Boxes <span className="text-slate-300 normal-case font-normal">(approx)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={() => set("boxes", Math.max(0, form.boxes - 5))} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50">−</button>
                  <span className="flex-1 text-center font-black text-slate-800">{form.boxes}</span>
                  <button onClick={() => set("boxes", form.boxes + 5)} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50">+</button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Special Items</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => set("specialItems", Math.max(0, form.specialItems - 1))} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50">−</button>
                  <span className="flex-1 text-center font-black text-slate-800">{form.specialItems}</span>
                  <button onClick={() => set("specialItems", form.specialItems + 1)} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50">+</button>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5 text-center">piano, safe, etc.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Flights of Stairs</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => set("stairs", Math.max(0, form.stairs - 1))} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50">−</button>
                  <span className="flex-1 text-center font-black text-slate-800">{form.stairs}</span>
                  <button onClick={() => set("stairs", form.stairs + 1)} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-50">+</button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Parking Distance</label>
                <select value={form.parkingDist} onChange={e => set("parkingDist", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-400 bg-white">
                  <option>Close (&lt; 50 ft)</option>
                  <option>Medium (50–150 ft)</option>
                  <option>Far (&gt; 150 ft)</option>
                </select>
              </div>
            </div>

            <button onClick={() => set("needsPacking", !form.needsPacking)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${form.needsPacking ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-200"}`}>
              <Package className={`w-4 h-4 ${form.needsPacking ? "text-blue-600" : "text-slate-400"}`} />
              <span className={`text-sm font-bold ${form.needsPacking ? "text-blue-700" : "text-slate-600"}`}>Include professional packing service</span>
              <span className={`ml-auto text-xs font-bold ${form.needsPacking ? "text-blue-600" : "text-slate-300"}`}>+$300</span>
            </button>
          </div>

          <button onClick={calc} disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating real route…</> : "📍 Calculate Move Quote"}
          </button>

          {/* Quote result */}
          {quote && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              {/* Hero total */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-5 text-center">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Estimated Total</p>
                <p className="text-white font-black text-4xl">${quote.totalMin.toLocaleString()} – ${quote.totalMax.toLocaleString()}</p>
                <p className="text-blue-200 text-xs mt-1">{quote.isLongDistance ? "Long-distance move" : "Local move"} · {quote.miles} mi</p>
              </div>

              {/* Specs row */}
              <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
                {[
                  { icon: Truck, label: "Truck", value: quote.truck },
                  { icon: Users, label: "Crew", value: `${quote.crew} movers` },
                  { icon: Clock, label: "Est. Time", value: `${quote.laborHrs} hrs` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="py-3 px-4 text-center">
                    <Icon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs font-black text-slate-800">{value}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown toggle */}
              <button onClick={() => setShowBreakdown(b => !b)}
                className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                Cost Breakdown {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showBreakdown && (
                <div className="px-5 pb-4">
                  <Row label={`Labor (${quote.crew} movers × ${quote.laborHrs} hrs @ $85/hr)`} value={`$${quote.laborCost.toLocaleString()}`} />
                  <Row label="Truck rental" value={`$${quote.truckCost.toLocaleString()}`} />
                  <Row label="Fuel" value={`$${quote.fuelCost.toLocaleString()}`} />
                  {quote.packingCost > 0 && <Row label="Packing service" value={`$${quote.packingCost.toLocaleString()}`} />}
                  {quote.stairsCost > 0 && <Row label={`Stairs surcharge (${form.stairs} flights)`} value={`$${quote.stairsCost.toLocaleString()}`} />}
                  {quote.parkingCost > 0 && <Row label="Parking/carry surcharge" value={`$${quote.parkingCost.toLocaleString()}`} />}
                  <Row label="Volume" value={`${Math.round(quote.cuFt)} cu ft`} />
                  <div className="pt-2 mt-1 border-t border-slate-200">
                    <Row label="Total Estimate Range" value={`$${quote.totalMin.toLocaleString()} – $${quote.totalMax.toLocaleString()}`} highlight />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                    ⚠️ Estimates are based on industry averages. Final pricing varies by mover and market. Recommend getting 3 real quotes.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}