import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantCard from "../../components/RestaurantCard";
import { useNavigate } from "react-router-dom";
import "./rating.css";
import munchImage from "..//landing/munch.png";

const RatingScreen = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  // UI and data state
  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingDetails, setMatchingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userDone, setUserDone] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [rating, setRating] = useState(0);

  // Load current user ID from localStorage
  useEffect(() => {
    const fetchedUserId = JSON.parse(localStorage.getItem("userId"))?.userId;
    setUserId(fetchedUserId);
  }, []);

  // Poll backend for group voting progress
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

        // Check if this user is already done
        if (done.includes(userId)) setUserDone(true);

        // If everyone is done, move to final screen
        const allDone = allUsers.every(user => done.includes(user));
        if (allDone) navigate("/matching-completed");
      } catch (err) {
        console.error("Failed to fetch matching details:", err);
      }
    };

    const interval = setInterval(fetchMatchingDetails, 3000);
    fetchMatchingDetails(); // Initial call
    return () => clearInterval(interval); // Cleanup
  }, [userId, navigate, BASE_URL]);

  // Fetch restaurant candidates once matching details are loaded
  useEffect(() => {
    if (matchingDetails) {
      const fetchRestaurants = async () => {
        const {
          budget, diningStyle, cuisines,
          streetAddress, city, state, zipCode,
          radius, matchType
        } = matchingDetails.matchingDetails;

        try {
          const res = await axios.get(`${BASE_URL}/api/foursquare/find-matches`, {
            params: {
              address: streetAddress,
              city, state, zipCode, radius,
              budget, diningStyle,
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

  // Submit rating for current restaurant and move to next
  const handleVote = async () => {
    if (!restaurants[currentIndex]) return;

    const currentRestaurant = restaurants[currentIndex];

    try {
      await axios.patch(`${BASE_URL}/api/dinner-plan/update-vote`, {
        userId,
        restaurantId: currentRestaurant.id,
        voteValue: rating,
        restaurantDetails: currentRestaurant,
      });

      // If last restaurant, mark user as done
      if (currentIndex + 1 >= restaurants.length) {
        await axios.patch(`${BASE_URL}/api/dinner-plan/mark-user-done`, { userId });
        setUserDone(true);
      } else {
        // Reset for next restaurant
        setCurrentIndex(prev => prev + 1);
        setRating(0);
      }
    } catch (error) {
      console.error("Failed to update vote:", error);
    }
  };

  // Render interactive star rating (1-5)
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? "filled" : ""}`}
          onClick={() => setRating(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Show loading screen while fetching data
  if (isLoading || !matchingDetails) {
    return (
      <div className="waiting-screen">
        <img src={munchImage} alt="Loading" className="img" />
        <p className="p">Loading Details</p>
      </div>
    );
  }

  // Show waiting screen if this user has finished voting
  if (userDone) {
    return (
      <div className="waiting-screen">
        <img src={munchImage} alt="Waiting" className="img" />
        <p className="p">Waiting for others to finish matching!</p>
      </div>
    );
  }

  // Main rating UI
  return (
    <div className="rating-screen">
      {restaurants[currentIndex] ? (
        <>
          {/* Display current restaurant */}
          <RestaurantCard restaurant={restaurants[currentIndex]} />

          {/* Rating controls */}
          <div className="rating-controls">
            <p className="rating-label">Your Rating</p>
            <div className="star-container">{renderStars()}</div>

            <button
              className="submit-rating"
              disabled={rating === 0}
              onClick={handleVote}
            >
              Submit Rating
            </button>
          </div>
        </>
      ) : (
        <p>Loading next restaurant...</p>
      )}
    </div>
  );
};

export default RatingScreen;
