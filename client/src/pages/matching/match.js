import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantCard from "../../components/RestaurantCard";
import { useNavigate } from "react-router-dom";
import munchImage from "..//landing/munch.png";
import "./match.css";

const MatchScreen = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  // State management
  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingDetails, setMatchingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userDone, setUserDone] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);

  // Load current user's ID
  useEffect(() => {
    const fetchedUserId = JSON.parse(localStorage.getItem("userId"))?.userId;
    setUserId(fetchedUserId);
  }, []);

  // Poll backend for matching details every 3 seconds
  useEffect(() => {
    const fetchMatchingDetails = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/dinner-plan/get-matching-details`, {
          params: { userId }
        });

        const details = res.data;
        setMatchingDetails(details);

        const { creator, group, done } = details;
        const allUsers = [creator, ...group];
        setGroupUsers(allUsers);

        if (done.includes(userId)) {
          setUserDone(true);
        }

        const allDone = allUsers.every(user => done.includes(user));
        if (allDone) {
          navigate("/matching-completed");
        }
      } catch (err) {
        console.error("Failed to fetch matching details:", err);
      }
    };

    const interval = setInterval(fetchMatchingDetails, 3000);
    fetchMatchingDetails(); // Initial fetch
    return () => clearInterval(interval);
  }, [userId, navigate, BASE_URL]);

  // Once matching details are available, fetch restaurant candidates
  useEffect(() => {
    if (matchingDetails) {
      const fetchRestaurants = async () => {
        const {
          budget, diningStyle, cuisines, streetAddress,
          city, state, zipCode, radius, matchType
        } = matchingDetails.matchingDetails;

        try {
          const res = await axios.get(`${BASE_URL}/api/foursquare/find-matches`, {
            params: {
              address: streetAddress,
              city,
              state,
              zipCode,
              radius,
              budget,
              diningStyle,
              cuisines: (cuisines || []).join(","),
              matchType
            }
          });

          setRestaurants(res.data);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching restaurants:", error);
        }
      };
      fetchRestaurants();
    }
  }, [matchingDetails, BASE_URL]);

  // Handle user vote (yes/no)
  const handleVote = async (vote) => {
    if (!restaurants[currentIndex]) return;

    const currentRestaurant = restaurants[currentIndex];
    const voteValue = vote === "yes" ? 1 : 0;

    try {
      // Submit vote
      await axios.patch(`${BASE_URL}/api/dinner-plan/update-vote`, {
        userId,
        restaurantId: currentRestaurant.id,
        voteValue,
        restaurantDetails: currentRestaurant,
      });

      // If last restaurant, mark user as done
      if (currentIndex + 1 >= restaurants.length) {
        try {
          await axios.patch(`${BASE_URL}/api/dinner-plan/mark-user-done`, { userId });
          setUserDone(true);
        } catch (err) {
          console.error("Failed to mark user as done:", err);
        }
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to update vote:", error);
    }
  };

  // Loading state while waiting for data
  if (isLoading || !matchingDetails) {
    return (
      <div className="waiting-screen">
        <img src={munchImage} alt="Description" className="img" />
        <p className="p">Loading Details</p>
      </div>
    );
  }

  // If user has voted on all restaurants, wait for others
  if (userDone) {
    return (
      <div className="waiting-screen">
        <img src={munchImage} alt="Description" className="img" />
        <p className="p">Waiting for Others to Finish Matching</p>
      </div>
    );
  }

  const imageUrl = restaurants[currentIndex]?.image;

  // Main restaurant voting UI
  return (
    <div className="match-screen">
      {restaurants[currentIndex] ? (
        <div className="restaurant-card">
          <div className="restaurant-name">{restaurants[currentIndex].name}</div>

          <img className="restaurant-image" src={imageUrl} alt="Restaurant" />

          {/* Show menu button if available */}
          {restaurants[currentIndex].menu?.available && restaurants[currentIndex].menu?.url && (
            <a
              href={restaurants[currentIndex].menu.url}
              target="_blank"
              rel="noopener noreferrer"
              className="menu-button"
            >
              View Full Menu
            </a>
          )}

          {/* Display basic restaurant info */}
          <div className="restaurant-info">
            <p><strong>Distance:</strong> {restaurants[currentIndex].distance || 'N/A'} miles</p>
            <p><strong>Rating:</strong> {restaurants[currentIndex].rating || 'N/A'}</p>
            <p><strong>Description:</strong> {restaurants[currentIndex].menu?.description || 'No description available.'}</p>
          </div>

          {/* Voting buttons */}
          <div className="vote-buttons">
            <button onClick={() => handleVote("no")} className="vote-button vote-no">No</button>
            <button onClick={() => handleVote("yes")} className="vote-button vote-yes">Yes</button>
          </div>
        </div>
      ) : (
        <div className="match-screen">
          <img className="restaurant-image" src={imageUrl} alt="Restaurant" />
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default MatchScreen;
