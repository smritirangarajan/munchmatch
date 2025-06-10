const axios = require("axios");
const geocodeAddress = require("./geoCodeHelper");

// Load Google Maps API key from environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Map user-facing cuisine options to API-recognized keywords
const CUISINE_CATEGORIES = {
  italian: "Italian",
  chinese: "Chinese",
  mexican: "Mexican",
  indian: "Indian",
  japanese: "Japanese",
  thai: "Thai",
  american: "American",
  mediterranean: "Mediterranean",
};

// Keywords to help tailor Google search based on budget
const BUDGET_KEYWORDS = {
  cheap: ["cheap", "budget", "value"],
  moderate: ["midrange", "moderate"],
  expensive: ["fine dining", "luxury", "expensive"],
};

/**
 * Helper function to compute the distance between two geo-coordinates
 * using the Haversine formula.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg) => deg * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance / 1609.34; // Convert to miles
}

/**
 * Fetch additional restaurant info using Place Details API
 * - Retrieves menu/website URL and editorial summary
 */
async function getPlaceDetails(placeId) {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "website,editorial_summary",
        key: GOOGLE_API_KEY
      }
    });

    const result = response.data.result;
    return {
      website: result.website || null,
      description: result.editorial_summary?.overview || null
    };
  } catch (error) {
    console.error("Error fetching place details:", error);
    return {
      website: null,
      description: null
    };
  }
}

/**
 * Main controller: finds restaurants near a given address based on filters.
 * - Combines geocoding, keyword generation, and Places API search.
 * - Enriches results with distance and optional menu data.
 */
const findMatches = async (req, res) => {
  const { address, city, state, zipCode, radius, budget, diningStyle, cuisines, matchType } = req.query;

  // Step 1: Convert full address to coordinates
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  let latitude, longitude;

  try {
    const coords = await geocodeAddress(fullAddress);
    latitude = coords.latitude;
    longitude = coords.longitude;
  } catch (err) {
    console.error("❌ Error during geocoding:", err.message);
    throw new Error("Failed to geocode address.");
  }

  // Step 2: Build keyword string for cuisine and budget
  const cuisineList = Array.isArray(cuisines) ? cuisines : [cuisines].filter(Boolean);
  const cuisineFilters = cuisineList
    .map(cuisine => CUISINE_CATEGORIES[cuisine.toLowerCase()])
    .filter(Boolean);
  const cuisineKeywords = cuisineFilters.join(" ");
  const budgetKeywords = BUDGET_KEYWORDS[budget?.toLowerCase()]?.join(" ") || "";
  const keywordSearch = [budgetKeywords, cuisineKeywords].filter(Boolean).join(" ");

  // Step 3: Setup parameters for Places API
  const params = {
    location: `${latitude},${longitude}`,
    radius: radius * 1.60934 * 1000, // Convert miles to meters
    type: "restaurant",
    keyword: keywordSearch,
    key: GOOGLE_API_KEY,
  };

  try {
    // Step 4: Perform Google Places nearby search
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });
    const results = response.data.results;

    // Step 5: Process each result into a uniform format
    const formatted = await Promise.all(results.map(async (restaurant) => {
      const rLat = restaurant.geometry?.location?.lat;
      const rLng = restaurant.geometry?.location?.lng;
      const distance = rLat && rLng
        ? calculateDistance(latitude, longitude, rLat, rLng).toFixed(1)
        : "N/A";

      // Guess cuisine based on available tags (fallback to "Restaurant")
      const cuisineType = restaurant.types?.find(type =>
        Object.keys(CUISINE_CATEGORIES).includes(type.toLowerCase())
      );
      const cuisineLabel = CUISINE_CATEGORIES[cuisineType?.toLowerCase()] || "Restaurant";

      // Step 6: Get optional menu details
      const menuDetails = await getPlaceDetails(restaurant.place_id);

      return {
        id: restaurant.place_id,
        name: restaurant.name,
        distance,
        cuisine: cuisineLabel,
        diningStyle: diningStyle || "Sit Down",
        budget: budget || "Unknown",
        image: restaurant.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : null,
        menu: {
          available: !!menuDetails.website,
          url: menuDetails.website,
          description: menuDetails.description
        },
        rating: restaurant.rating,
        priceLevel: restaurant.price_level,
        address: restaurant.vicinity
      };
    }));

    // Step 7: Return results to frontend
    res.json(formatted);
  } catch (error) {
    console.error("❌ Google Places API error:", error.response?.data || error.message);
    throw new Error("Failed to fetch restaurants.");
  }
};

module.exports = { findMatches };
