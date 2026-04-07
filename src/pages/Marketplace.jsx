import { useState } from "react";
import { ShoppingCart, X, ArrowLeft, Search, Star, ChevronRight, Package, Sparkles, Truck, Wrench, Wind, Trash2 } from "lucide-react";
import { ProductCard, SectionHeader, Badge, PrimaryBtn, GhostBtn, EmptyState } from "@/components/ui/MovingUI";
import { useNavigate } from "react-router-dom";

// ─── Catalog ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "boxes",    label: "Boxes",           emoji: "📦", icon: Package,   color: "bg-amber-50 text-amber-600" },
  { id: "packing",  label: "Packing Supplies", emoji: "🧴", icon: Sparkles,  color: "bg-blue-50 text-blue-600" },
  { id: "tools",    label: "Tools & Tape",     emoji: "🔧", icon: Wrench,    color: "bg-slate-50 text-slate-600" },
  { id: "cleaning", label: "Cleaning",         emoji: "🧹", icon: Wind,      color: "bg-green-50 text-green-600" },
  { id: "junk",     label: "Junk Removal",     emoji: "🗑️", icon: Trash2,    color: "bg-red-50 text-red-600" },
  { id: "moving",   label: "Moving Day",       emoji: "🚛", icon: Truck,     color: "bg-orange-50 text-orange-600" },
];

const PRODUCTS = [
  // Boxes
  { id: 1, cat: "boxes",    name: "Small Moving Box (10-pack)", price: "$18.99", originalPrice: "$24.99", emoji: "📦", badge: "BEST SELLER", rating: 4.8 },
  { id: 2, cat: "boxes",    name: "Medium Box (8-pack)",        price: "$22.99", emoji: "📦", rating: 4.7 },
  { id: 3, cat: "boxes",    name: "Large Box (6-pack)",         price: "$26.99", emoji: "📦", rating: 4.6 },
  { id: 4, cat: "boxes",    name: "Wardrobe Box w/ Bar (2-pk)", price: "$39.99", emoji: "🧺", badge: "TOP RATED", rating: 4.9 },
  { id: 5, cat: "boxes",    name: "Dish Pack Box (4-pack)",     price: "$28.99", originalPrice: "$34.99", emoji: "🍽️", rating: 4.8 },
  // Packing
  { id: 6, cat: "packing",  name: "Bubble Wrap Roll (175 ft)",  price: "$14.99", emoji: "🫧", badge: "SALE", rating: 4.7 },
  { id: 7, cat: "packing",  name: "Packing Paper (175 sheets)", price: "$11.99", emoji: "📰", rating: 4.5 },
  { id: 8, cat: "packing",  name: "Foam Pouches (50-pack)",     price: "$16.99", emoji: "🧴", rating: 4.6 },
  { id: 9, cat: "packing",  name: "Stretch Wrap 18\" x 1000\"", price: "$19.99", emoji: "🌀", rating: 4.8 },
  // Tools
  { id: 10, cat: "tools",   name: "Heavy Duty Tape (6-pack)",   price: "$12.99", emoji: "🟫", badge: "BEST VALUE", rating: 4.8 },
  { id: 11, cat: "tools",   name: "Box Cutter + Safety Blade",  price: "$6.99",  emoji: "🔧", rating: 4.4 },
  { id: 12, cat: "tools",   name: "Tape Dispenser Pro",         price: "$8.99",  emoji: "🏷️", rating: 4.5 },
  { id: 13, cat: "tools",   name: "Furniture Dolly",            price: "$34.99", originalPrice: "$44.99", emoji: "🛒", badge: "RENT", rating: 4.7 },
  // Cleaning
  { id: 14, cat: "cleaning", name: "Move-Out Cleaning Kit",     price: "$29.99", emoji: "🧼", badge: "POPULAR", rating: 4.9 },
  { id: 15, cat: "cleaning", name: "Microfiber Cloths (24-pk)", price: "$13.99", emoji: "🧹", rating: 4.6 },
  { id: 16, cat: "cleaning", name: "All-Purpose Spray (3-pk)",  price: "$11.99", emoji: "🫧", rating: 4.5 },
  // Junk
  { id: 17, cat: "junk",    name: "Junk Removal — 1/4 Truck",  price: "$149",   emoji: "🗑️", badge: "BOOK NOW", rating: 4.8 },
  { id: 18, cat: "junk",    name: "Junk Removal — 1/2 Truck",  price: "$249",   emoji: "🚛", badge: "BOOK NOW", rating: 4.7 },
  { id: 19, cat: "junk",    name: "Dumpster Rental (7 days)",  price: "$299",   originalPrice: "$349", emoji: "♻️", rating: 4.6 },
  // Moving Day
  { id: 20, cat: "moving",  name: "Furniture Sliders (16-pk)", price: "$14.99", emoji: "🪑", rating: 4.7 },
  { id: 21, cat: "moving",  name: "Moving Blankets (4-pk)",    price: "$28.99", emoji: "🛏️", badge: "BEST SELLER", rating: 4.9 },
  { id: 22, cat: "moving",  name: "Mattress Bag — Queen",      price: "$9.99",  emoji: "🛌", rating: 4.6 },
  { id: 23, cat: "moving",  name: "TV Box — 55\"–75\"",        price: "$18.99", emoji: "📺", rating: 4.5 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Marketplace() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => {
    const n = parseFloat(i.price.replace(/[^0-9.]/g, ""));
    return sum + n * i.qty;
  }, 0);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = !selectedCat || p.cat === selectedCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = PRODUCTS.filter(p => p.badge === "BEST SELLER").slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto border-x border-slate-200 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div>
              <p className="font-black text-slate-800 text-sm leading-tight">EZ Move <span className="text-orange-500">Market</span></p>
              <p className="text-[10px] text-slate-400">Everything for your move</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative w-9 h-9 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search supplies, boxes, services…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-orange-400 transition-all"
          />
        </div>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6">
        {/* Categories */}
        <div>
          <SectionHeader title="Shop by Category" className="mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all active:scale-[0.96] ${
                  selectedCat === cat.id
                    ? "border-orange-400 bg-orange-50"
                    : "border-slate-100 bg-white hover:border-orange-200"
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured / All Products */}
        {!selectedCat && !search && (
          <div>
            <SectionHeader title="🔥 Best Sellers" className="mb-3"
              action={<GhostBtn onClick={() => {}} className="text-orange-500 text-xs px-2 py-1">See all</GhostBtn>}
            />
            <div className="grid grid-cols-2 gap-3">
              {featured.map(p => (
                <ProductCard key={p.id} {...p} onAddToCart={() => addToCart(p)} />
              ))}
            </div>
          </div>
        )}

        {/* Filtered products */}
        <div>
          {(selectedCat || search) && (
            <div className="flex items-center gap-2 mb-3">
              <SectionHeader
                title={selectedCat ? CATEGORIES.find(c => c.id === selectedCat)?.label : `"${search}"`}
                subtitle={`${filtered.length} items`}
              />
              {selectedCat && (
                <button onClick={() => setSelectedCat(null)} className="ml-auto flex-shrink-0">
                  <Badge color="slate">Clear ×</Badge>
                </button>
              )}
            </div>
          )}
          {!selectedCat && !search && (
            <SectionHeader title="All Products" subtitle={`${PRODUCTS.length} items`} className="mb-3" />
          )}
          {filtered.length === 0 ? (
            <EmptyState emoji="🔍" title="No results" subtitle="Try a different search or category" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <ProductCard key={p.id} {...p} onAddToCart={() => addToCart(p)} />
              ))}
            </div>
          )}
        </div>

        {/* Services banner */}
        {!selectedCat && !search && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 text-white">
            <p className="font-black text-lg leading-tight mb-1">Need a mover? 🚛</p>
            <p className="text-slate-300 text-xs mb-4">Get instant quotes from top-rated local movers.</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Get Free Quotes →
            </button>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">Your Cart</h3>
                <p className="text-xs text-slate-400">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <EmptyState emoji="🛒" title="Cart is empty" subtitle="Add some items to get started" />
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                      <p className="text-xs text-orange-500 font-bold">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold flex items-center justify-center">−</button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Subtotal</span>
                  <span className="text-lg font-black text-slate-800">${cartTotal.toFixed(2)}</span>
                </div>
                <PrimaryBtn className="w-full" onClick={() => alert("Checkout coming soon! Connect Stripe to enable payments.")}>
                  Checkout — ${cartTotal.toFixed(2)}
                </PrimaryBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}