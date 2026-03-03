import { useState } from "react";
import { Sparkles, Star, MapPin, DollarSign, Save, Check, UtensilsCrossed } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FoodFinder({ user }) {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [savedIds, setSavedIds] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [category, setCategory] = useState("restaurants");

  const categories = [
    { id: "restaurants", label: "🍽️ All Food" },
    { id: "pizza", label: "🍕 Pizza" },
    { id: "coffee", label: "☕ Coffee" },
    { id: "breakfast", label: "🥞 Breakfast" },
    { id: "mexican", label: "🌮 Mexican" },
    { id: "chinese", label: "🥡 Chinese" },
    { id: "italian", label: "🍝 Italian" },
    { id: "burgers", label: "🍔 Burgers" },
  ];

  const findFood = async () => {
    if (!user?.home_address) return;
    setLoading(true);
    setPlaces([]);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Yelp. Find 8 real ${category} near "${user.home_address}". For each place return: name, cuisine type, rating (out of 5), price range ($, $$, $$$, $$$$), address, a short 1-sentence description, and a neighborhood/area name. Only return real places that actually exist near this address. Make sure the places are actually close to the given address.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            places: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  cuisine: { type: "string" },
                  rating: { type: "number" },
                  price: { type: "string" },
                  address: { type: "string" },
                  description: { type: "string" },
                  area: { type: "string" }
                }
              }
            }
          }
        }
      });
      setPlaces(res?.places || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const savePlace = async (place) => {
    const key = place.name;
    setSavingId(key);
    try {
      const content = `${place.name}\n${place.cuisine} · ${place.price} · ⭐ ${place.rating}\n📍 ${place.address}\n${place.description}`;
      await base44.entities.SavedInsight.create({
        user_id: user?.id,
        tool_id: "food",
        tool_name: "Food Finder",
        tool_emoji: "🍽️",
        content,
        category: "food",
      });
      setSavedIds(prev => ({ ...prev, [key]: true }));
    } catch (e) {
      console.error(e);
    }
    setSavingId(null);
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < full ? "fill-orange-400 text-orange-400" : i === full && half ? "fill-orange-200 text-orange-400" : "text-slate-300"}`}
          />
        ))}
        <span className="text-[10px] text-slate-600 ml-1">{rating}</span>
      </div>
    );
  };

  if (!user?.home_address) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
        <UtensilsCrossed className="w-8 h-8 text-orange-400 mx-auto mb-2" />
        <p className="text-xs text-slate-600">Add your new address in your profile to find food nearby.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
              category === c.id
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <p className="text-[10px] text-slate-600 truncate">{user.home_address}</p>
      </div>

      {/* Search button */}
      <button
        onClick={findFood}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding places...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Find Food Near Me</>
        )}
      </button>

      {/* Results */}
      {places.length > 0 && (
        <div className="space-y-2">
          {places.map((place, i) => {
            const key = place.name;
            const isSaved = savedIds[key];
            const isSaving = savingId === key;
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{place.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">{place.cuisine}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{place.price}</span>
                      {place.area && <span className="text-[9px] text-slate-400">{place.area}</span>}
                    </div>
                    {renderStars(place.rating)}
                  </div>
                  <button
                    onClick={() => savePlace(place)}
                    disabled={isSaving || isSaved}
                    className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                      isSaved ? "text-green-600 bg-green-50" : "text-blue-600 bg-blue-50"
                    }`}
                  >
                    {isSaved ? <><Check className="w-3 h-3" /> Saved</> : isSaving ? "..." : <><Save className="w-3 h-3" /> Save</>}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{place.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <p className="text-[9px] text-slate-400 truncate">{place.address}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}