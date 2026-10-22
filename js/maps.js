const mapViewport = document.getElementById("map-viewport");
const mapMarkersLayer = document.getElementById("map-markers-layer");
const googleMapCanvas = document.getElementById("google-map-canvas");
const mapHeader = document.getElementById("map-header");

const cityMapCenters = {
    "Skopje": { lat: 41.9981, lng: 21.4254 },
    "Ohrid": { lat: 41.1129, lng: 20.7947 },
    "Zurich": { lat: 47.3769, lng: 8.5417 },
    "Aspen": { lat: 39.1911, lng: -106.8175 },
    "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
    "Tokyo": { lat: 35.6762, lng: 139.6503 },
    "New York": { lat: 40.7128, lng: -74.0060 },
    "Los Angeles": { lat: 34.0522, lng: -118.2437 },
    "Paris": { lat: 48.8566, lng: 2.3522 },
    "Rome": { lat: 41.9028, lng: 12.4964 },
    "London": { lat: 51.5072, lng: -0.1276 },
    "Berlin": { lat: 52.5200, lng: 13.4050 },
    "Sydney": { lat: -33.8688, lng: 151.2093 },
    "Melbourne": { lat: -37.8136, lng: 144.9631 },
    "Shanghai": { lat: 31.2304, lng: 121.4737 },
    "Barcelona": { lat: 41.3874, lng: 2.1686 },
    "Madrid": { lat: 40.4168, lng: -3.7038 },
    "Lisbon": { lat: 38.7223, lng: -9.1393 }
};

const cityMapBounds = {
    "Skopje": { south: 41.8, north: 42.2, west: 21.3, east: 21.55 },
    "Ohrid": { south: 40.9, north: 41.3, west: 20.6, east: 21.0 },
    "Zurich": { south: 47.2, north: 47.6, west: 8.3, east: 8.8 },
    "Aspen": { south: 39.0, north: 39.4, west: -107.1, east: -106.7 },
    "Rio de Janeiro": { south: -23.2, north: -22.7, west: -43.4, east: -42.9 },
    "Tokyo": { south: 35.4, north: 35.9, west: 139.4, east: 140.0 },
    "New York": { south: 40.4, north: 41.0, west: -74.3, east: -73.6 },
    "Los Angeles": { south: 33.7, north: 34.4, west: -118.7, east: -117.8 },
    "Paris": { south: 48.7, north: 49.0, west: 2.1, east: 2.6 },
    "Rome": { south: 41.7, north: 42.1, west: 12.3, east: 12.7 },
    "London": { south: 51.3, north: 51.7, west: -0.5, east: 0.3 },
    "Berlin": { south: 52.3, north: 52.7, west: 13.1, east: 13.7 },
    "Sydney": { south: -34.1, north: -33.6, west: 150.8, east: 151.4 },
    "Melbourne": { south: -38.1, north: -37.6, west: 144.7, east: 145.2 },
    "Shanghai": { south: 31.0, north: 31.5, west: 121.2, east: 121.8 },
    "Barcelona": { south: 41.2, north: 41.55, west: 2.0, east: 2.3 },
    "Madrid": { south: 40.3, north: 40.55, west: -3.9, east: -3.5 },
    "Lisbon": { south: 38.6, north: 38.85, west: -9.25, east: -9.05 }
};

let googleMap = null;
let googleMapMarkers = [];
let googleMapsLoadPromise = null;
let mapRenderRequest = 0;

function isValidSpotLocation(spot) {
    if (spot.lat === null || spot.lat === "" ||
        spot.lng === null || spot.lng === "" ||
        !Number.isFinite(Number(spot.lat)) ||
        !Number.isFinite(Number(spot.lng)) ||
        Number(spot.lat) < -90 || Number(spot.lat) > 90 ||
        Number(spot.lng) < -180 || Number(spot.lng) > 180) {
        return false;
    }

    const bounds = cityMapBounds[spot.city];
    return !bounds || (
        Number(spot.lat) >= bounds.south &&
        Number(spot.lat) <= bounds.north &&
        Number(spot.lng) >= bounds.west &&
        Number(spot.lng) <= bounds.east
    );
}

function loadGoogleMaps() {
    if (window.google && window.google.maps) return Promise.resolve(true);
    if (!window.GOOGLE_MAPS_API_KEY) return Promise.resolve(false);
    if (googleMapsLoadPromise) return googleMapsLoadPromise;

    googleMapsLoadPromise = new Promise((resolve, reject) => {
        window.googleMapsInitCallback = () => resolve(true);
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(window.GOOGLE_MAPS_API_KEY)}&callback=googleMapsInitCallback&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("Google Maps JavaScript API could not be loaded."));
        document.head.appendChild(script);
    });

    return googleMapsLoadPromise;
}

function renderMapPreview(spots) {
    mapViewport.classList.remove("google-map-active");
    const locatedSpots = spots.filter(isValidSpotLocation);
    if (!locatedSpots.length) {
        mapMarkersLayer.innerHTML = "";
        return;
    }

    const latitudes = locatedSpots.map(spot => Number(spot.lat));
    const longitudes = locatedSpots.map(spot => Number(spot.lng));
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    mapMarkersLayer.innerHTML = locatedSpots.map(spot => {
        const top = 15 + ((maxLat - Number(spot.lat)) / latRange) * 70;
        const left = 15 + ((Number(spot.lng) - minLng) / lngRange) * 70;
        return `<div class="map-pin" style="top: ${top}%; left: ${left}%;" title="${escapeHTML(spot.title)}">${spot.is_free ? "FREE" : "$"}</div>`;
    }).join("");
}

async function updateSpotMap(spots, city) {
    const requestId = ++mapRenderRequest;
    const locatedSpots = spots.filter(isValidSpotLocation);

    try {
        const isLoaded = await loadGoogleMaps();
        if (requestId !== mapRenderRequest) return;
        if (!isLoaded) {
            mapHeader.textContent = "Map preview · add a Google Maps key in js/mapsConfig.js";
            renderMapPreview(spots);
            return;
        }

        if (!googleMap) {
            googleMap = new google.maps.Map(googleMapCanvas, {
                center: cityMapCenters[city] || locatedSpots[0] || { lat: 0, lng: 0 },
                zoom: 13,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true
            });
            mapViewport.classList.add("google-map-active");
        }

        googleMapMarkers.forEach(marker => marker.setMap(null));
        googleMapMarkers = [];

        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();
        locatedSpots.forEach(spot => {
            const position = { lat: Number(spot.lat), lng: Number(spot.lng) };
            const marker = new google.maps.Marker({
                map: googleMap,
                position,
                title: spot.title,
                label: spot.is_free ? "F" : undefined
            });
            marker.addListener("click", () => {
                const content = document.createElement("div");
                const title = document.createElement("strong");
                const address = document.createElement("p");
                title.textContent = spot.title;
                address.textContent = spot.address;
                content.append(title, address);
                infoWindow.setContent(content);
                infoWindow.open({ map: googleMap, anchor: marker });
            });
            googleMapMarkers.push(marker);
            bounds.extend(position);
        });

        mapViewport.classList.add("google-map-active");
        if (locatedSpots.length > 1) {
            googleMap.fitBounds(bounds, 36);
        } else if (locatedSpots.length === 1) {
            googleMap.setCenter({ lat: Number(locatedSpots[0].lat), lng: Number(locatedSpots[0].lng) });
            googleMap.setZoom(14);
        } else if (cityMapCenters[city]) {
            googleMap.setCenter(cityMapCenters[city]);
            googleMap.setZoom(13);
        }
        mapHeader.textContent = `${city} · ${locatedSpots.length} mapped sports spots`;
    } catch (error) {
        if (requestId !== mapRenderRequest) return;
        console.error("Unable to initialize Google Maps; showing the preview map.", error);
        mapHeader.textContent = "Map preview · Google Maps could not be loaded";
        renderMapPreview(spots);
    }
}
