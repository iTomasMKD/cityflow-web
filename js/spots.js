let spotsData = [];

async function fetchSpots() {
    const response = await fetch("data/spots.json");
    if (!response.ok) {
        throw new Error(`Unable to load sports spots: ${response.status} ${response.statusText}`);
    }
    spotsData = await response.json();

    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from('sports_spots').select('*');
            if (error) throw error;
            if (data && data.length > 0) spotsData = data;
        } catch (e) {
            console.warn("Unable to load saved sports spots; using the bundled dataset.", e);
        }
    }
    renderCityDropdown();
}
