import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './matchfail.css'; // Import the styling

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
