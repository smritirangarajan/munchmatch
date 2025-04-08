import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';

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

  if (!restaurant) return null; // Wait until data is fetched

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {showConfetti && <Confetti />}
      <h1>🎉 Congratulations! You've Matched! 🎉</h1>
      <div className="restaurant-card" style={{ margin: '30px auto', maxWidth: '500px', border: '1px solid #ccc', borderRadius: '10px', padding: '20px' }}>
        <h2>{restaurant.name}</h2>
        <img src={restaurant.image} alt={restaurant.name} style={{ width: '100%', borderRadius: '10px' }} />
        <p><strong>Budget:</strong> {restaurant.budget}</p>
        <p><strong>Dining Style:</strong> {restaurant.diningStyle}</p>
        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p><strong>Distance:</strong> {restaurant.distance} miles</p>
      </div>
      <button onClick={goToHome} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Go to Home
      </button>
    </div>
  );
};

export default MatchSuccessPage;
