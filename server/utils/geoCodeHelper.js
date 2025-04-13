const axios = require("axios");

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://api.geocod.io/v1.6/geocode', {
      params: {
        q: address,
        api_key: process.env.GEOCODIO_API_KEY,
      }
    });
    
    const { lat, lng } = response.data.results[0].location;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Could not geocode address");
  }
};

module.exports = geocodeAddress;