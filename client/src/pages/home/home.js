import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './home.css';

const Home = () => {
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [existingPlan, setExistingPlan] = useState(null);
  const navigate = useNavigate();

  const currentUserId = JSON.parse(localStorage.getItem("userId")).userId;

  useEffect(() => {
    const fetchFriendCount = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/friends/count", {
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
        const res = await axios.get("http://localhost:5000/api/dinner-plan/user", {
          params: { userId: currentUserId }
        });

        if (res.data && res.data._id) {
          setExistingPlan(res.data);
        }
      } catch (err) {
        console.log("No existing dinner plan found.");
      }
    };

    if (currentUserId) {
      fetchFriendCount();
      fetchDinnerPlan();
    }
  }, [currentUserId]);

  const navigateToFindFriends = () => navigate("/findfriends");
  const navigateToAcceptFriendRequests = () => navigate("/acceptfriend");
  const navigateToDinnerPlan = () => navigate("/dinnerplan");

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
    
    <div className="card-container">
      {/* Card 1 */}
      <div className="card">
      <div className="card-title">Find Friends</div>
        <div className="card-text">
          Find friends to add them to your Munching Plans.
        </div>
        <button onClick={navigateToFindFriends} className="card-button">Find Now</button>
      </div>
      
      {/* Card 2 */}
      <div className="card">
      <div className="card-title">Friend Requests</div>
        <div className="card-text">
          Accept friend requests to be added and add friends to your plans
        </div>
        <button onClick={navigateToAcceptFriendRequests} className="card-button">See Requests</button>
      </div>
      
      {/* Card 3 */}
      <div className="card">
      <div className="card-title">Match & Munch</div>
        <div className="card-text">
          Add in requirements for your munch and get matching!
        </div>
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
