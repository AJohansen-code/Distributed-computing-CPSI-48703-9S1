/**
 * Shared Vantage API Adapter
 * Alicia (#17): Owns adapter shape & fixtures
 */

const USE_FIXTURES = true; 

// Mock contract fixtures for Little Rock locations
const MOCK_SPOTS = [
    {
        id: "spot-1",
        name: "Arkansas Capitol Building",
        category: "Landmark",
        rank: 1,
        rating: 4.5,
        lat: 34.7465,
        lng: -92.2896,
        thumbnail: "https://images.unsplash.com/photo-1590483236906-8d147bbba7e1?auto=format&fit=crop&w=600&q=80",
        description: "A century-old Neoclassical landmark modeled after the US Capitol, crafted from Arkansas limestone and Batesville granite.",
        photoCount: 142
    },
    {
        id: "spot-2",
        name: "Junction Bridge",
        category: "Scenic",
        rank: 2,
        rating: 4.8,
        lat: 34.7505,
        lng: -92.2680,
        thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        description: "Historic converted railroad bridge spanning the Arkansas River with panoramic sunset views of the city skyline.",
        photoCount: 98
    },
    {
        id: "spot-3",
        name: "Pinnacle Mountain West Summit",
        category: "Scenic",
        rank: 3,
        rating: 4.8,
        lat: 34.8437,
        lng: -92.4842,
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
        description: "Iconic cone-shaped peak providing rugged hiking trails and 360-degree vistas across the Arkansas River Valley.",
        photoCount: 310
    },
    {
        id: "spot-4",
        name: "River Market Hall",
        category: "Dining",
        rank: 4,
        rating: 4.6,
        lat: 34.7478,
        lng: -92.2638,
        thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        description: "The downtown community anchor featuring bustling local food stalls, weekend farmers markets, and outdoor amphitheater lawns.",
        photoCount: 76
    }
];

export const VantageAPI = {
    /*Fetch ranked spots based on category and radius filters*/
    async getRankedSpots(category = "All", radiusMiles = 15) {
        if (USE_FIXTURES) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let results = [...MOCK_SPOTS];
                    if (category !== "All") {
                        results = results.filter(spot => spot.category.toLowerCase() === category.toLowerCase());
                    }
                    resolve({ status: 200, data: results });
                }, 400); // Simulated network delay to test loading skeletons
            });
        }

        const response = await fetch(`/api/spots?category=${encodeURIComponent(category)}&radius=${radiusMiles}`);
        if (!response.ok) throw new Error("Failed to fetch spots from gateway");
        return { status: response.status, data: await response.json() };
    },

    async getSpotDetails(spotId) {
        if (USE_FIXTURES) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const spot = MOCK_SPOTS.find(s => s.id === spotId);
                    if (spot) resolve({ status: 200, data: spot });
                    else reject(new Error("Spot not found"));
                }, 200);
            });
        }

        const response = await fetch(`/api/spots/${encodeURIComponent(spotId)}`);
        if (!response.ok) throw new Error("Could not load spot details");
        return { status: response.status, data: await response.json() };
    },

    /* Photo upload endpoint */
    async uploadPhoto(formData) {
        if (USE_FIXTURES) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ status: 201, message: "Photo uploaded successfully (Fixture Mode)" });
                }, 600);
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