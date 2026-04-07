// Generate dynamic tasks based on user move profile

export function generateTasksForUser(userId, profile = {}) {
  const { homeType, miles, inventory, accessConditions, staysGoes } = profile;

  const hasLargeHome = ["House", "Townhome"].includes(homeType);
  const isLongDistance = (miles || 0) > 50;
  const hasGarage = inventory?.garage && Object.values(inventory.garage).some(v => v > 0);
  const hasStairs = accessConditions?.stairs && accessConditions.stairs !== "0";
  const totalItems = Object.values(inventory || {}).reduce((sum, room) =>
    sum + Object.values(room || {}).reduce((a, b) => a + b, 0), 0);
  const hasLotsOfItems = totalItems > 30;

  const tasks = [];

  // ── Week 1 — Foundation ────────────────────────────────────────────────────
  tasks.push({
    userId, weekNumber: 1,
    emoji: "📦", title: "Start donation / sell pile",
    description: "Separate items into sell, donate, and trash categories.",
    instructions: "Place colored stickers or tape on items: blue=sell, green=donate, red=trash. Take photos of sell items immediately.",
    aiTips: "Facebook Marketplace and OfferUp move furniture fast. Goodwill will schedule a free pickup for larger donations.",
    estimatedTime: "1–2 hours",
    status: "not_started"
  });

  tasks.push({
    userId, weekNumber: 1,
    emoji: "🚚", title: "Request mover quotes",
    description: "Get at least 3 quotes from licensed, insured movers.",
    instructions: "Call or book online for in-home or virtual estimates. Ask about binding vs. non-binding quotes, insurance coverage, and availability on your move date.",
    aiTips: "Always verify USDOT number for interstate moves. Ask if they charge by hour or flat rate — for local moves under 50 miles, hourly is usually better.",
    aiSearchQuery: "top rated local movers near me",
    estimatedTime: "1 hour",
    status: "not_started"
  });

  if (hasLargeHome) {
    tasks.push({
      userId, weekNumber: 1,
      emoji: "🏷️", title: "Estate sale decision",
      description: "Decide whether an estate sale makes sense for your volume of items.",
      instructions: "Estate sale companies typically take 30–40% commission but handle everything including setup, pricing, and cleanup.",
      aiTips: "Estate sales work best when you have a full house of furniture. For partial moves, consignment or garage sale may net more.",
      aiSearchQuery: "top rated estate sale professionals near me",
      estimatedTime: "30 min research",
      status: "not_started"
    });
  }

  // ── Week 2 — Clearing & Logistics ─────────────────────────────────────────
  tasks.push({
    userId, weekNumber: 2,
    emoji: "📋", title: "Confirm what stays vs. goes",
    description: "Walk through each room and finalize decisions on furniture, appliances, and personal items.",
    instructions: "Go room by room. For each item ask: does it fit the new place? Is it worth moving? Could someone else use it better?",
    aiTips: "Items that cost less than $50 to replace are often not worth moving. Focus your energy on sentimental and high-value items.",
    estimatedTime: "2–3 hours",
    status: "not_started",
    visibilityGuard: { onboardingComplete: true }
  });

  tasks.push({
    userId, weekNumber: 2,
    emoji: "✅", title: "Finalize and book your mover",
    description: "Confirm your mover selection, lock in the date, and pay deposit.",
    instructions: "Get the contract in writing. Confirm: move date, pickup window, destination address, insurance level, and what's included in the price.",
    aiTips: "Book early — weekends in summer fill up 4–6 weeks out. Mid-week moves are often 15–20% cheaper.",
    estimatedTime: "30 min",
    status: "not_started"
  });

  tasks.push({
    userId, weekNumber: 2,
    emoji: "📦", title: "Order packing supplies",
    description: "Get boxes, tape, bubble wrap, and specialty containers.",
    instructions: "Estimate: 10 small, 10 medium, 5 large boxes per bedroom. Add wardrobe boxes for hanging clothes, dish packs for kitchen.",
    aiTips: "Buy from U-Haul, Home Depot, or order on Amazon. Liquor stores and grocery stores sometimes give away free boxes.",
    estimatedTime: "30 min",
    status: "not_started"
  });

  tasks.push({
    userId, weekNumber: 2,
    emoji: "📝", title: "Utility planning",
    description: "Create your list of utilities to transfer or cancel.",
    instructions: "List every recurring service: electric, gas, water, internet, cable, security, lawn, pool. Note the phone number and account number for each.",
    aiTips: "Schedule disconnects for the day AFTER closing — not before. Some utilities require 2–4 weeks notice.",
    estimatedTime: "45 min",
    status: "not_started"
  });

  if (hasLotsOfItems) {
    tasks.push({
      userId, weekNumber: 2,
      emoji: "📂", title: "Begin packing non-essentials",
      description: "Pack items you won't need for the next 3 weeks.",
      instructions: "Start with: seasonal items, books, décor, extra linens, garage items, and storage room contents. Label every box: room + brief contents + fragile if needed.",
      aiTips: "Pack heavy items in small boxes. Use clothing and towels to wrap fragile items — saves on bubble wrap.",
      estimatedTime: "3–5 hours",
      status: "not_started"
    });
  }

  // ── Week 3 — Home Prep ─────────────────────────────────────────────────────
  tasks.push({
    userId, weekNumber: 3,
    emoji: "🔧", title: "Patch & repair checklist",
    description: "Fix nail holes, scuffs, and minor damage before listing or buyer walkthrough.",
    instructions: "Use spackle for nail holes, sand when dry, prime, then touch-up paint. Match paint color — take a chip to the hardware store.",
    aiTips: "Buyers notice nail holes and scuffs immediately. A $20 touch-up can prevent a $500 credit request.",
    estimatedTime: "2–4 hours",
    status: "not_started"
  });

  tasks.push({
    userId, weekNumber: 3,
    emoji: "🧹", title: "Deep cleaning",
    description: "Thorough cleaning of kitchen, baths, windows, and appliances.",
    instructions: "Focus on: oven interior, fridge interior, bathrooms (grout, caulk, fixtures), windows inside, light fixtures, and baseboards.",
    aiTips: "Hire professionals for the final clean — it's worth the $200–$400. Buyers judge cleanliness heavily during walkthroughs.",
    aiSearchQuery: "professional house cleaning near me",
    estimatedTime: "4–6 hours or hire out",
    status: "not_started"
  });

  if (hasLargeHome) {
    tasks.push({
      userId, weekNumber: 3,
      emoji: "🗑️", title: "Junk removal",
      description: "Haul away items too large for donation or trash.",
      instructions: "Schedule junk removal for large appliances, old furniture, yard debris. Many services offer same-day or next-day availability.",
      aiTips: "1-800-GOT-JUNK and similar services are easy but pricey. Local Facebook groups often have people who'll haul for free if items have value.",
      aiSearchQuery: "local junk removal same day near me",
      estimatedTime: "Schedule 1–2 hours",
      status: "not_started"
    });
  }

  if (hasGarage) {
    tasks.push({
      userId, weekNumber: 3,
      emoji: "🚗", title: "Clear out the garage",
      description: "Sort, sell, donate, or discard everything in the garage.",
      instructions: "Group by category: tools, sports equipment, seasonal items, chemicals (dispose properly). Check local hazmat disposal for paint and chemicals.",
      aiTips: "Garage sales work great for this. Price tools at 25–30% of retail — they move fast.",
      estimatedTime: "Half day",
      status: "not_started"
    });
  }

  // ── Week 4 — Final Move & Close ────────────────────────────────────────────
  tasks.push({
    userId, weekNumber: 4,
    emoji: "📦", title: "Final packing sprint",
    description: "Pack everything remaining — kitchen, bathrooms, daily essentials last.",
    instructions: "Pack an 'open first' box per room with: toilet paper, chargers, coffee, snacks, a change of clothes, and basic tools. This is the last box off and first box in.",
    aiTips: "Keep a clear path for movers. Disassemble beds, desks, and large furniture the night before move day.",
    estimatedTime: "Full day",
    status: "not_started"
  });

  if (isLongDistance) {
    tasks.push({
      userId, weekNumber: 4,
      emoji: "🗺️", title: "Long-distance logistics check",
      description: "Confirm all details for your long-distance move.",
      instructions: "Verify: delivery window at destination, storage contingency if new home isn't ready, vehicle transport if needed, and your own travel arrangements.",
      aiTips: "For moves over 100 miles, always get full-value replacement protection — not released-value (60 cents/lb) protection.",
      estimatedTime: "1–2 hours",
      status: "not_started"
    });
  }

  if (hasStairs) {
    tasks.push({
      userId, weekNumber: 4,
      emoji: "🪜", title: "Stairs & access prep",
      description: "Prepare access points to minimize move day delays.",
      instructions: "Measure doorways and stairwells for large furniture. Arrange elevator reservations in advance for condos. Clear stairways of décor and trip hazards.",
      aiTips: "Some buildings require movers to use freight elevators — reserve it in writing. Stair fees from movers can be $50–$100/flight.",
      estimatedTime: "30 min prep",
      status: "not_started"
    });
  }

  // Utility cancellations — always in Week 4
  const utilities = [
    { title: "Cancel / transfer electric service", instructions: "Call your electric provider. Schedule the disconnect for the day AFTER closing. Ask about final billing." },
    { title: "Cancel / transfer gas service", instructions: "Schedule final meter reading. Set end date as day after closing." },
    { title: "Cancel / transfer internet & cable", instructions: "Schedule equipment return. Get confirmation number. ISP often requires 30 days notice." },
    { title: "Forward your mail", instructions: "Go to usps.com/move. Setup takes 3 minutes. Mail forwarding starts within 7–10 business days." },
    { title: "Notify important parties of address change", instructions: "Banks, employer, IRS, subscriptions, insurance, DMV. Use USPS mailing list as a checklist." },
  ];

  utilities.forEach(u => {
    tasks.push({
      userId, weekNumber: 4,
      emoji: "📋", title: u.title,
      description: "Administrative task to wrap up your current address.",
      instructions: u.instructions,
      aiTips: "Set calendar reminders — missing a cancellation deadline can result in extra charges.",
      estimatedTime: "15–30 min",
      status: "not_started"
    });
  });

  tasks.push({
    userId, weekNumber: 4,
    emoji: "🗝️", title: "Closing day checklist",
    description: "Final walkthrough and key handoff.",
    instructions: "Walk every room one last time. Check: all closets, attic, crawl space, garage, outdoor areas. Leave garage remotes, manuals, and spare keys for the buyer.",
    aiTips: "Take time-stamped photos of every room before you leave — protects you from post-closing deposit disputes.",
    estimatedTime: "1 hour",
    status: "not_started"
  });

  return tasks;
}