const axios = require("axios");
const geocodeAddress = require("./geoCodeHelper");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;;

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

const BUDGET_KEYWORDS = {
  cheap: ["cheap", "budget", "value"],
  moderate: ["midrange", "moderate"],
  expensive: ["fine dining", "luxury", "expensive"],
};

// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
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

// Function to fetch place details including menu
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

const findMatches = async (req, res) => {
  const { address, city, state, zipCode, radius, budget, diningStyle, cuisines, matchType } = req.query;
  console.log("➡️ Starting restaurant search...");

  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  console.log("addy", fullAddress);
  let latitude, longitude;
  try {
    const coords = await geocodeAddress(fullAddress);
    latitude = coords.latitude;
    longitude = coords.longitude;
    console.log(`✅ Got coordinates: (${latitude}, ${longitude})`);
  } catch (err) {
    console.error("❌ Error during geocoding:", err.message);
    throw new Error("Failed to geocode address.");
  }

  const cuisineList = Array.isArray(cuisines) ? cuisines : [cuisines].filter(Boolean);
const cuisineFilters = cuisineList
  .map(cuisine => CUISINE_CATEGORIES[cuisine.toLowerCase()])
  .filter(Boolean);

const cuisineKeywords = cuisineFilters.join(" ");
const budgetKeywords = BUDGET_KEYWORDS[budget?.toLowerCase()]?.join(" ") || "";

const keywordSearch = [budgetKeywords, cuisineKeywords].filter(Boolean).join(" ");

const params = {
  location: `${latitude},${longitude}`,
  radius: radius * 1.60934 * 1000,
  type: "restaurant",
  keyword: keywordSearch,
  key: GOOGLE_API_KEY,
};


  console.log("📡 Sending request to Google Places...");
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });
    const results = response.data.results;
    console.log(`✅ Received ${results.length} restaurants`);

    // Process restaurants in parallel with menu details
    const formatted = await Promise.all(results.map(async (restaurant, i) => {
      const rLat = restaurant.geometry?.location?.lat;
      const rLng = restaurant.geometry?.location?.lng;
      const distance = rLat && rLng
        ? calculateDistance(latitude, longitude, rLat, rLng).toFixed(1)
        : "N/A";

      const cuisineType = restaurant.types?.find(type =>
        Object.keys(CUISINE_CATEGORIES).includes(type.toLowerCase())
      );
      const cuisineLabel = CUISINE_CATEGORIES[cuisineType?.toLowerCase()] || "Restaurant";

      // Get menu details for this restaurant
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

    res.json(formatted);
  } catch (error) {
    console.error("❌ Google Places API error:", error.response?.data || error.message);
    throw new Error("Failed to fetch restaurants.");
  }
};

module.exports = { findMatches };