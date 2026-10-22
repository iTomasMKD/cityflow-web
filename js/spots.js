let spotsData = [];

const categoryImageUrls = {
    courts: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    calisthenics: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    cycling: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    ski: "https://images.unsplash.com/photo-1551524164-6cf2ac5318f3?auto=format&fit=crop&w=800&q=80",
    beach: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
    free_places: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    healthy_food: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    bars: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80"
};

async function fetchSpots() {
    const [spotsResponse, featuredResponse] = await Promise.all([
        fetch("data/spots.json", { cache: "force-cache" }),
        fetch("data/featured-places.json", { cache: "force-cache" })
    ]);
    if (!spotsResponse.ok) {
        throw new Error(`Unable to load sports spots: ${spotsResponse.status} ${spotsResponse.statusText}`);
    }
    if (!featuredResponse.ok) {
        throw new Error(`Unable to load featured places: ${featuredResponse.status} ${featuredResponse.statusText}`);
    }

    const bundledSpots = await spotsResponse.json();
    const featuredPlaces = await featuredResponse.json();
    spotsData = [
        ...bundledSpots.map(spot => ({ ...spot, is_sample: true })),
        ...featuredPlaces.map(spot => ({
            ...spot,
            image_url: categoryImageUrls[spot.category],
            is_free: spot.category !== "restaurant" &&
                spot.category !== "healthy_food" &&
                spot.category !== "bars",
            has_rental: false,
            has_tickets: false,
            is_sample: true
        }))
    ];

    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from('sports_spots').select('*');
            if (error) throw error;
            if (data && data.length > 0) {
                const savedSpots = data.map(spot => ({ ...spot, is_sample: false }));
                const savedKeys = new Set(savedSpots.map(spot => `${spot.city.toLowerCase()}|${spot.title.toLowerCase()}`));
                spotsData = [
                    ...savedSpots,
                    ...spotsData.filter(spot => !savedKeys.has(`${spot.city.toLowerCase()}|${spot.title.toLowerCase()}`))
                ];
            }
        } catch (e) {
            console.warn("Unable to load saved sports spots; using the bundled dataset.", e);
        }
    }
    renderCityDropdown();
}
