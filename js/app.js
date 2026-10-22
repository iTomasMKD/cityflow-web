let selectedCity = "";
let selectedCategory = "all";

const step1Hero = document.getElementById("step-1-hero");
const step2Dashboard = document.getElementById("step-2-dashboard");
const citySearchInput = document.getElementById("city-search-input");
const cityDropdown = document.getElementById("city-dropdown");
const dashboardCityInput = document.getElementById("dashboard-city-input");
const spotsGrid = document.getElementById("spots-grid");
const headerCityPill = document.getElementById("header-city-pill");

document.addEventListener("DOMContentLoaded", () => {
    fetchSpots().catch(error => {
        document.getElementById("spots-load-error").hidden = false;
        console.error("Unable to initialize sports spots.", error);
    });
    setupEventListeners();
});

function renderCityDropdown() {
    citySearchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) { cityDropdown.style.display = "none"; return; }
        
        const cities = [...new Set(spotsData.map(s => s.city))];
        const matches = cities.filter(c => c.toLowerCase().includes(query));

        if (matches.length) {
            cityDropdown.innerHTML = matches.map(c =>
                `<button type="button" class="dropdown-item" data-city="${escapeHTML(c)}">${escapeHTML(c)}</button>`
            ).join('');
            cityDropdown.querySelectorAll(".dropdown-item").forEach(item => {
                item.addEventListener("click", () => selectCity(item.dataset.city));
            });
            cityDropdown.style.display = "block";
        } else {
            cityDropdown.style.display = "none";
        }
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getCategoryLabel(category) {
    return {
        courts: "Sports court",
        calisthenics: "Outdoor fitness",
        cycling: "Trail & cycling",
        ski: "Ski & snow",
        beach: "Beach sports",
        free_places: "Free place",
        restaurant: "Restaurant",
        healthy_food: "Healthy food",
        bars: "Bar"
    }[category] || "Place";
}

function setupEventListeners() {
    document.getElementById("explore-btn").addEventListener("click", () => {
        const val = citySearchInput.value.trim();
        if (val) selectCity(val);
    });

    document.querySelectorAll(".city-chip").forEach(chip => {
        chip.addEventListener("click", () => selectCity(chip.dataset.city));
    });

    document.querySelectorAll(".cat-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            selectedCategory = pill.dataset.cat;
            renderSpots();
        });
    });

    document.getElementById("free-only-toggle").addEventListener("change", renderSpots);
    document.getElementById("rentals-only-toggle").addEventListener("change", renderSpots);
    spotsGrid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-spot-action]");
        if (!button) return;
        if (button.dataset.spotAction === "rental") openRentalModal(button.dataset.spotId);
        if (button.dataset.spotAction === "ticket") openTicketModal(button.dataset.spotId);
    });

    document.getElementById("logo-btn").addEventListener("click", resetToHero);
    document.getElementById("back-to-home-btn").addEventListener("click", resetToHero);
    document.getElementById("change-city-btn").addEventListener("click", () => {
        const val = dashboardCityInput.value.trim();
        if (val) selectCity(val);
    });

    document.getElementById("close-rental-btn").onclick = () => closeModal("rental-modal");
    document.getElementById("close-ticket-btn").onclick = () => closeModal("ticket-modal");
    document.getElementById("close-add-btn").onclick = () => closeModal("add-modal");
    document.getElementById("open-add-modal-btn").onclick = () => openModal("add-modal");

    document.getElementById("rental-form").onsubmit = (e) => {
        e.preventDefault();
        alert("Rental reserved successfully!");
        closeModal("rental-modal");
    };

    document.getElementById("add-spot-form").onsubmit = async (e) => {
        e.preventDefault();
        const latitudeValue = document.getElementById("add-lat").value.trim();
        const longitudeValue = document.getElementById("add-lng").value.trim();
        const hasCoordinates = latitudeValue !== "" || longitudeValue !== "";
        const latitude = Number(latitudeValue);
        const longitude = Number(longitudeValue);
        if (hasCoordinates && (
            latitudeValue === "" || longitudeValue === "" ||
            !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
            !Number.isFinite(longitude) || longitude < -180 || longitude > 180
        )) {
            alert("Enter both a valid latitude and longitude to add this spot to the map.");
            return;
        }

        const newSpot = {
            id: String(Date.now()),
            title: document.getElementById("add-title").value,
            city: document.getElementById("add-city").value,
            category: document.getElementById("add-category").value,
            address: document.getElementById("add-address").value,
            is_free: true,
            rating: 5.0,
            image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
            description: 'User submitted sport venue.',
            lat: hasCoordinates ? latitude : null,
            lng: hasCoordinates ? longitude : null
        };

        if (supabaseClient) {
            await supabaseClient.from('sports_spots').insert([newSpot]);
        }
        spotsData.push(newSpot);
        closeModal("add-modal");
        selectCity(newSpot.city);
    };
}

function selectCity(cityName) {
    selectedCity = cityName;
    citySearchInput.value = cityName;
    dashboardCityInput.value = cityName;
    cityDropdown.style.display = "none";

    step1Hero.style.display = "none";
    step2Dashboard.style.display = "block";
    headerCityPill.style.display = "inline-block";
    headerCityPill.textContent = `📍 ${cityName}`;

    renderSpots();
}

function resetToHero() {
    step1Hero.style.display = "flex";
    step2Dashboard.style.display = "none";
    headerCityPill.style.display = "none";
}

function renderSpots() {
    const freeOnly = document.getElementById("free-only-toggle").checked;
    const rentalsOnly = document.getElementById("rentals-only-toggle").checked;

    const filtered = spotsData.filter(s => {
        const matchCity = s.city.toLowerCase() === selectedCity.toLowerCase();
        const matchCat = selectedCategory === "all" || s.category === selectedCategory;
        const matchFree = !freeOnly || s.is_free;
        const matchRent = !rentalsOnly || s.has_rental;
        return matchCity && matchCat && matchFree && matchRent;
    });

    const placeLabel = filtered.length === 1 ? "Place" : "Places";
    document.getElementById("spots-count-heading").textContent = `${filtered.length} ${placeLabel} in ${selectedCity}`;
    updateSpotMap(filtered, selectedCity);

    if (filtered.length === 0) {
        spotsGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted);">No places found in ${escapeHTML(selectedCity)}. Try another category or add a place.</p>`;
        return;
    }

    spotsGrid.innerHTML = filtered.map(s => `
        <div class="spot-card">
            <div class="card-img-wrapper">
                <img src="${escapeHTML(s.image_url || "")}" alt="${escapeHTML(s.title)}" loading="lazy" decoding="async" fetchpriority="low">
                ${s.is_free ? '<span class="free-badge">FREE</span>' : ''}
                ${s.is_sample ? '<span class="sample-badge">SAMPLE</span>' : Number.isFinite(Number(s.rating)) ? `<span class="rating-badge">★ ${escapeHTML(s.rating)}</span>` : ''}
            </div>
            <div class="card-body">
                <span class="place-category">${escapeHTML(getCategoryLabel(s.category))}</span>
                <h3 class="card-title">${escapeHTML(s.title)}</h3>
                <p class="card-address">📍 ${escapeHTML(s.address)}</p>
                <p class="card-desc">${escapeHTML(s.description)}</p>
                <div class="card-actions">
                    ${s.has_rental ? `<button class="btn btn-secondary btn-sm" data-spot-action="rental" data-spot-id="${escapeHTML(s.id)}">🎿 Rent Gear</button>` : ''}
                    ${s.has_tickets ? `<button class="btn btn-coral btn-sm" data-spot-action="ticket" data-spot-id="${escapeHTML(s.id)}">🎟️ Book Pass</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');

}
