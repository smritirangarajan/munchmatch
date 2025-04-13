import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import './matchsuccess.css';

const MatchSuccessPage = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const userId = JSON.parse(localStorage.getItem("userId"))?.userId;

  useEffect(() => {
    const fetchMatchResult = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/dinner-plan/match-result/${userId}`);
        setRestaurant(response.data);
      } catch (err) {
        console.error("Could not find a successful match:", err);
        navigate("/match-fail");
      }
    };

    fetchMatchResult();
  }, [userId, navigate]);

  useEffect(() => {
    const confettiTimeout = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(confettiTimeout);
  }, []);

  const goToHome = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/dinner-plan/delete/${userId}`);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete dinner plan:", err);
    }
  };

  if (!restaurant) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`;

  return (
    <div className="success-page">
      {showConfetti && <Confetti />}
      <h1>🎉 Congratulations! You've Matched! 🎉</h1>
      <div className="restaurant-card">
        <h2>{restaurant.name}</h2>
        <img src={restaurant.image} alt={restaurant.name} />
        <p><strong>Budget:</strong> {restaurant.budget}</p>
        <p><strong>Dining Style:</strong> {restaurant.diningStyle}</p>
        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p><strong>Distance:</strong> {restaurant.distance} miles</p>
      </div>

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
