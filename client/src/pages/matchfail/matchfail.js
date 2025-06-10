import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './matchfail.css'; // Styling for failed match screen

const NoMatches = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Get the current user's ID from localStorage
  const userId = JSON.parse(localStorage.getItem("userId"))?.userId;

  // Delete the user's dinner plan from the backend
  const deleteDinnerPlan = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/dinner-plan/delete/${userId}`);
    } catch (err) {
      console.error("Failed to delete dinner plan:", err);
    }
  };

  // Handle "Home" button click: delete plan, return to landing page
  const goHome = async () => {
    await deleteDinnerPlan();
    navigate('/');
  };

  // Handle "Start new match" button click: delete plan, go to dinner plan form
  const tryAgain = async () => {
    await deleteDinnerPlan();
    navigate('/dinnerplan');
  };

  return (
    <div className="no-match-screen">
      <div className="no-match-box">
        <h1 className="no-match-heading">Match Failed :(</h1>
        <button className="no-match-button" onClick={goHome}>Home</button>
        <button className="no-match-button" onClick={tryAgain}>Start new match</button>
      </div>
    </div>
  );
};

export default NoMatches;
