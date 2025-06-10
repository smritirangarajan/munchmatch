import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import './matchsuccess.css';

const MatchSuccessPage = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // State for matched restaurant and confetti effect
  const [restaurant, setRestaurant] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Get user ID from localStorage
  const userId = JSON.parse(localStorage.getItem("userId"))?.userId;

  // Fetch the final matched restaurant after all votes are in
  useEffect(() => {
    const fetchMatchResult = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/dinner-plan/match-result/${userId}`);
        setRestaurant(response.data); // Save matched restaurant details
      } catch (err) {
        console.error("Could not find a successful match:", err);
        navigate("/match-fail"); // Redirect to fail page if no match found
      }
    };

    fetchMatchResult();
  }, [userId, navigate, BASE_URL]);

  // Automatically hide confetti after 5 seconds
  useEffect(() => {
    const confettiTimeout = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(confettiTimeout);
  }, []);

  // Clean up dinner plan and return to home
  const goToHome = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/dinner-plan/delete/${userId}`);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete dinner plan:", err);
    }
  };

  // Wait until restaurant data is loaded
  if (!restaurant) return null;

  // Google Maps URL for directions
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    restaurant.name + " " + restaurant.address
  )}`;

  return (
    <div className="success-page">
      {/* Confetti animation on success */}
      {showConfetti && <Confetti />}
      <h1>🎉 Congratulations! You've Matched! 🎉</h1>

      {/* Display matched restaurant details */}
      <div className="restaurant-card">
        <h2>{restaurant.name}</h2>
        <img src={restaurant.image} alt={restaurant.name} />
        <p><strong>Budget:</strong> {restaurant.budget}</p>
        <p><strong>Dining Style:</strong> {restaurant.diningStyle}</p>
        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p><strong>Distance:</strong> {restaurant.distance} miles</p>
      </div>

      {/* Buttons for next actions */}
      <div className="button-group">
        {restaurant.menu?.available && restaurant.menu.url && (
          <a href={restaurant.menu.url} target="_blank" rel="noopener noreferrer">
            View Menu
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Get Directions
        </a>
        <button onClick={goToHome}>Go to Home</button>
      </div>
    </div>
  );
};

export default MatchSuccessPage;
