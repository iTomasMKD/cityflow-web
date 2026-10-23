# CityFlow Web Application

CityFlow helps people discover public outdoor places, sports spots, and food and drink venues in 18 cities.

## Project Structure

- `index.html` - App HTML markup (Step 1 Hero + Step 2 Dashboard + Modals)
- `schema.sql` - Supabase database setup script
- `data/spots.json` - Bundled sample sports spots for the city search and listings
- `data/featured-places.json` - Free-place highlights and clearly labeled sample restaurants, healthy-food spots, and bars
- `css/style.css` - Swarm-inspired design system & layout styling
- `js/supabaseClient.js` - Supabase client setup
- `js/mapsConfig.js` - OpenFreeMap map style configuration
- `js/maps.js` - MapLibre map loading, place markers, and preview fallback
- `js/spots.js` - Data handling & Supabase queries with mock fallback
- `js/modals.js` - Gear rental, ticket checkout, & QR pass generator
- `js/app.js` - Main UI flow, event listeners, & search logic

## Setup & Running

1. For the static, high-read-traffic setup, deploy the app to a CDN-backed static host such as GitHub Pages. Place data is bundled in JSON and fetched with browser caching; spot photos load lazily.
2. The bundled restaurant, healthy-food, and bar records are sample listings with illustrative photos and approximate map pins, not verified businesses. Verify venue, access, hours, and images before presenting any listing as factual.
3. To use Supabase for saved spots, set the URL and anon key in `js/supabaseClient.js` and explicitly set `SUPABASE_SPOTS_ENABLED` to `true`. Direct database reads add a request per visitor, so add a cached public API, rate limiting, and appropriate access policies before high-traffic use.
4. CityFlow uses MapLibre GL JS and OpenFreeMap's public OpenStreetMap-based tiles. The map works without an API key or account; OpenFreeMap attribution is shown on the map. Its public service has no request limits but does not provide an SLA. For guaranteed availability at scale, arrange a map provider with an SLA or self-host tiles.
5. For local development, run the app with a web server such as VS Code Live Server so the browser can load both JSON files.

If the map library or tile service is unavailable, CityFlow falls back to a lightweight preview. Bundled map coordinates are approximate. When adding a spot, enter both optional coordinates if you want it placed on the map.

## Traffic and performance notes

The default browsing experience is static: the host/CDN serves HTML, CSS, JavaScript, and cached JSON; the browser does not call Supabase unless explicitly enabled. Ten thousand page visits over three minutes is about 56 visits per second on average. This architecture avoids a per-visitor database read and lazy-loads listing photos, but no 10,000-visitor load test has been run and this is not a capacity guarantee. Traffic spikes, third-party image delivery, and OpenFreeMap availability still need monitoring. Ten thousand simultaneous users, public submissions, reservations, or payments require a production backend, abuse controls, monitoring, and a load test.
