/**
 * Shared Vantage API Adapter
 * Alicia (#17): Owns adapter shape & fixtures
 * Kaden:
 * Grayson (#24): Connects to /api/spots/nearby
 */

const USE_FIXTURES = true; 

const DEFAULT_CENTER = {
    lat: 34.7465,
    lng: -92.2896
}

// Mock contract fixtures for Little Rock locations
const MOCK_SPOTS = [
    {
        id: "spot-1",
        name: "Arkansas State Capitol",
        category: "Landmark",
        rank: 1,
        rating: 4.9,
        lat: 34.7465,
        lng: -92.2896,
        latitude: 34.7465,
        longitude: -92.2896,
        thumbnail: "/static/images/Arkansas.1.png",
        description: "Century-old Neoclassical landmark modeled after the US Capitol, crafted from Arkansas limestone.",
        photoCount: 142,
        photo_count: 142
    },
    {
        id: "spot-2",
        name: "Junction Bridge & Riverfront Park",
        category: "Scenic",
        rank: 2,
        rating: 4.8,
        lat: 34.7510,
        lng: -92.2680,
        latitude: 34.7510,
        longitude: -92.2680,
        thumbnail: "/static/images/Arkansas.2.png",
        description: "Historic converted railroad bridge spanning the Arkansas River with skyline sunset views.",
        photoCount: 98,
        photo_count: 98
    },
    {
        id: "spot-3",
        name: "River Market Hall & Pavilions",
        category: "Dining",
        rank: 3,
        rating: 4.6,
        lat: 34.7478,
        lng: -92.2640,
        latitude: 34.7478,
        longitude: -92.2640,
        thumbnail: "/static/images/Arkansas.3.png",
        description: "The downtown community anchor featuring local food stalls, farmers markets, and outdoor lawns.",
        photoCount: 76,
        photo_count: 76
    },
    {
        id: "spot-4",
        name: "Historic Arkansas Museum",
        category: "Landmark",
        rank: 4,
        rating: 4.7,
        lat: 34.7450,
        lng: -92.2710,
        latitude: 34.7450,
        longitude: -92.2710,
        thumbnail: "/static/images/Arkansas.1.png",
        description: "Living history museum preserving Arkansas's frontier heritage and historic downtown homes.",
        photoCount: 54,
        photo_count: 54
    }
];

function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export const VantageAPI = {
    async getNearbySpots(latitude = DEFAULT_CENTER.lat, longitude = DEFAULT_CENTER.lng, radiusMeters = 5000, category = "All") {
        if (USE_FIXTURES) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const catClean = String(category || "All").trim().toLowerCase();

                        let results = MOCK_SPOTS.filter((spot) => {
                            const spotLat = spot.latitude ?? spot.lat;
                            const spotLng = spot.longitude ?? spot.lng;
                            const dist = getDistanceMeters(latitude, longitude, spotLat, spotLng);
                            const withinRadius = dist <= radiusMeters;

                            const spotCat = spot.category.toLowerCase();
                            const matchesCategory =
                                catClean === "all" ||
                                spotCat === catClean ||
                                spotCat.startsWith(catClean.slice(0, 4)) ||
                                catClean.startsWith(spotCat.slice(0, 4));

                            return withinRadius && matchesCategory;
                        });

                        results.sort((a, b) => a.rank - b.rank);

                        resolve({
                            status: 200,
                            data: {
                                spots: results,
                                radius_meters: radiusMeters,
                                center: { latitude, longitude }
                            }
                        });
                    } catch (err) {
                        reject(err);
                    }
                }, 150);
            });
        }

        const params = new URLSearchParams({ latitude, longitude, radius_meters: radiusMeters, category });
        const response = await fetch(`/api/spots/nearby?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch nearby spots");
        return await response.json();
    },

    async getRankedSpots(category = "All", radiusMeters = 5000) {
        return this.getNearbySpots(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, radiusMeters, category);
    },

    async getSpotDetails(spotId) {
        if (USE_FIXTURES) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const spot = MOCK_SPOTS.find((s) => s.id === spotId);
                        if (spot) resolve({ status: 200, data: spot });
                        else reject(new Error("Spot not found"));
                    } catch (err) {
                        reject(err);
                    }
                }, 100);
            });
        }

        const response = await fetch(`/api/spots/${encodeURIComponent(spotId)}`);
        if (!response.ok) throw new Error("Could not load spot details");
        return await response.json();
    },

    async uploadPhoto(formData) {
        if (USE_FIXTURES) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ status: 201, message: "Photo uploaded successfully (Fixture Mode)" });
                }, 300);
            });
        }

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error("Upload failed on gateway");
        return await response.json();
    }
};