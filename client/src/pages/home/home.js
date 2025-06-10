import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './home.css';

const Home = () => {
  // State for tracking friend count and dinner plan status
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [existingPlan, setExistingPlan] = useState(null);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Get current user ID from local storage
  const currentUserId = JSON.parse(localStorage.getItem("userId")).userId;

  // Fetch friend count and existing dinner plan when component mounts
  useEffect(() => {
    const fetchFriendCount = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/friends/count`, {
          params: { userId: currentUserId }
        });
        setFriendsCount(response.data.count);
      } catch (error) {
        console.error("Error fetching friend count", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDinnerPlan = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/dinner-plan/user`, {
          params: { userId: currentUserId }
        });

        if (res.data && res.data._id) {
          setExistingPlan(res.data); // Store existing plan if any
        }
      } catch (err) {
        console.log("No existing dinner plan found.");
      }
    };

    if (currentUserId) {
      fetchFriendCount();
      fetchDinnerPlan();
    }
  }, [currentUserId, BASE_URL]);

  // Navigation helpers
  const navigateToFindFriends = () => navigate("/findfriends");
  const navigateToAcceptFriendRequests = () => navigate("/acceptfriend");
  const navigateToDinnerPlan = () => navigate("/dinnerplan");

  // Continue with existing plan based on match type
  const navigateToCurrentPlan = () => {
    if (!existingPlan) return;

    const matchType = existingPlan.matchType;
    if (matchType === "rating") {
      navigate("/rating");
    } else {
      navigate("/matching");
    }
  };

  return (
    <div className="home-container">
      <div className="header">Let's Get Munching</div>
      
      {/* Three main action cards */}
      <div className="card-container">
        {/* Card 1: Find Friends */}
        <div className="card">
          <div className="card-title">Find Friends</div>
          <div className="card-text">
            Find friends to add them to your Munching Plans.
          </div>
          <button onClick={navigateToFindFriends} className="card-button">Find Now</button>
        </div>
        
        {/* Card 2: Accept Friend Requests */}
        <div className="card">
          <div className="card-title">Friend Requests</div>
          <div className="card-text">
            Accept friend requests to be added and add friends to your plans.
          </div>
          <button onClick={navigateToAcceptFriendRequests} className="card-button">See Requests</button>
        </div>
        
        {/* Card 3: Dinner Plan */}
        <div className="card">
          <div className="card-title">Match & Munch</div>
          <div className="card-text">
            Add in requirements for your munch and get matching!
          </div>
          {/* Button changes based on whether a plan already exists */}
          {!existingPlan && (
            <button onClick={navigateToDinnerPlan} className="card-button">Find Match</button>
          )}
          {existingPlan && (
            <button onClick={navigateToCurrentPlan} className="card-button">Continue Matching</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
