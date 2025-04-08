import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="home-page">
      <h1>Welcome to Munch Match!</h1>

      <div className="friend-section">
        <button onClick={navigateToFindFriends} className="btn">Find Friends</button>
        <button onClick={navigateToAcceptFriendRequests} className="btn">Accept Friend Requests</button>
        <h3>{loading ? "Loading..." : `You have ${friendsCount} ${friendsCount === 1 ? "friend" : "friends"}.`}</h3>
      </div>

      <div className="dinner-plan-section">
        {!existingPlan && (
          <button onClick={navigateToDinnerPlan} className="btn">
            Start a Dinner Plan
          </button>
        )}

        {existingPlan && (
          <button onClick={navigateToCurrentPlan} className="btn btn-secondary" style={{ marginTop: "10px" }}>
            Continue Dinner Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
