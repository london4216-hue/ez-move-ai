/**
 * moveContext.js
 * Canonical context builder for all AI move features.
 * Grounds AI prompts with real user data — prevents hallucinated pricing/distances.
 */

/**
 * Best address for LOCAL services (movers, junk, estate sale, donation):
 *   → use moving_from_address (where the mover needs to show up)
 * Best address for NEW-HOME services (neighborhood, food):
 *   → use home_address (destination)
 */
export function getServiceAddress(user, type = "from") {
  if (type === "from") return user?.moving_from_address || user?.home_address || null;
  return user?.home_address || user?.moving_from_address || null;
}

/**
 * Geocode an address via Nominatim. Returns { lat, lng } or null.
 */
export async function geocodeAddress(address) {
  if (!address || address.length < 5) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=us`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

/** Haversine distance in miles between two { lat, lng } objects */
export function haversineMiles(a, b) {
  const R = 3958.8;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLon = (b.lng - a.lng) * (Math.PI / 180);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

/**
 * Build a structured move context for any AI call.
 * Enriches with geocoded distance when both addresses present.
 */
export async function buildMoveContext(user, moverQForm = null, manualMiles = null) {
  const pickup = user?.moving_from_address || null;
  const dropoff = user?.home_address || null;

  let computedMiles = manualMiles;
  if (!computedMiles && pickup && dropoff) {
    try {
      const [from, to] = await Promise.all([geocodeAddress(pickup), geocodeAddress(dropoff)]);
      if (from && to) computedMiles = haversineMiles(from, to);
    } catch { /* silent */ }
  }

  return {
    pickup_address: pickup || "not provided",
    dropoff_address: dropoff || "not provided",
    close_date: user?.estimated_close_date || "not provided",
    distance_miles: computedMiles,
    distance_label: computedMiles
      ? `${computedMiles} miles (measured from addresses)`
      : (moverQForm?.move_distance || "distance not provided — do not guess"),
    floors: moverQForm?.floors || null,
    stairs: moverQForm?.stairs || null,
    elevator: moverQForm?.elevator || null,
    walk_distance: moverQForm?.walk_distance || null,
    parking: moverQForm?.parking || null,
    special_items: moverQForm?.special_items || null,
    hanging_clothes: moverQForm?.hanging_clothes || null,
  };
}

/**
 * Formats a move context as a grounded fact block for AI prompts.
 * Instructs AI to ONLY use these numbers — never guess.
 */
export function formatContextForPrompt(ctx) {
  const lines = [
    "=== MOVE DETAILS (USE ONLY THESE VALUES — DO NOT GUESS OR INVENT) ===",
    `Pickup address (current home): ${ctx.pickup_address}`,
    `Dropoff address (new home): ${ctx.dropoff_address}`,
    `Move distance: ${ctx.distance_label}`,
    `Closing date: ${ctx.close_date}`,
    ctx.floors        ? `Home floors: ${ctx.floors}` : null,
    ctx.stairs        ? `Stairs: ${ctx.stairs}` : null,
    ctx.elevator      ? `Elevator: ${ctx.elevator}` : null,
    ctx.walk_distance ? `Walk to truck: ${ctx.walk_distance}` : null,
    ctx.parking       ? `Parking: ${ctx.parking}` : null,
    ctx.hanging_clothes ? `Hanging clothes: ${ctx.hanging_clothes}` : null,
    ctx.special_items ? `Special items: ${ctx.special_items}` : null,
    "=== END MOVE DETAILS ===",
  ].filter(Boolean);
  return lines.join("\n");
}