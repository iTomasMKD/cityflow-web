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
    "Tokyo": { lat: 35.6762, lng: 139.6503 }
};

const cityMapBounds = {
    "Skopje": { south: 41.8, north: 42.2, west: 21.3, east: 21.55 },
    "Ohrid": { south: 40.9, north: 41.3, west: 20.6, east: 21.0 },
    "Zurich": { south: 47.2, north: 47.6, west: 8.3, east: 8.8 },
    "Aspen": { south: 39.0, north: 39.4, west: -107.1, east: -106.7 },
    "Rio de Janeiro": { south: -23.2, north: -22.7, west: -43.4, east: -42.9 },
    "Tokyo": { south: 35.4, north: 35.9, west: 139.4, east: 140.0 }
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
        return `<div class="map-pin" style="top: ${top}%; left: ${left}%;" title="${spot.title}">${spot.is_free ? "FREE" : "$"}</div>`;
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
