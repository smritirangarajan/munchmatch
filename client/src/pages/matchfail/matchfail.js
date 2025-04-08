import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NoMatches = () => {
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("userId"))?.userId;
  const deleteDinnerPlan = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/dinner-plan/delete/${userId}`);
    } catch (err) {
      console.error("Failed to delete dinner plan:", err);
    }
  };

  const goHome = async () => {
    await deleteDinnerPlan();
    navigate('/');
  };

  const tryAgain = async () => {
    await deleteDinnerPlan();
    navigate('/dinner-plan/create');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Oops! No Match Found</h1>
      <p>We couldn't find a restaurant that at least two people liked.</p>
      <button onClick={goHome} style={{ margin: '10px' }}>Go to Home</button>
      <button onClick={tryAgain} style={{ margin: '10px' }}>Start New Dinner Plan</button>
    </div>
  );
};

export default NoMatches;
