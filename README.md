# CityFlow Web Application

Global sports activity and gear rental finder for cities worldwide.

## Project Structure

- `index.html` - App HTML markup (Step 1 Hero + Step 2 Dashboard + Modals)
- `schema.sql` - Supabase database setup script
- `data/spots.json` - Bundled sample sports spots for the city search and listings
- `css/style.css` - Swarm-inspired design system & layout styling
- `js/supabaseClient.js` - Supabase client setup
- `js/mapsConfig.js` - Google Maps browser API key configuration
- `js/maps.js` - Google Maps loading, place markers, and preview fallback
- `js/spots.js` - Data handling & Supabase queries with mock fallback
- `js/modals.js` - Gear rental, ticket checkout, & QR pass generator
- `js/app.js` - Main UI flow, event listeners, & search logic

## Setup & Running

1. Open `js/supabaseClient.js` and set your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Run `schema.sql` inside your Supabase Dashboard SQL Editor.
3. Create a Google Maps Platform browser key, enable the Maps JavaScript API and billing, and restrict the key to your app's HTTP referrers.
4. Add the key to `GOOGLE_MAPS_API_KEY` in `js/mapsConfig.js`.
5. Run the app with a local web server such as VS Code Live Server so the browser can load `data/spots.json`.

Without a Google Maps key, the app keeps its lightweight preview map and shows a setup hint. The bundled sample spots include approximate geographic coordinates for map markers. When adding a spot, enter both optional coordinates if you want it placed on the map.
