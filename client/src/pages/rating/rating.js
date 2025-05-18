import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantCard from "../../components/RestaurantCard";
import { useNavigate } from "react-router-dom";
import "./rating.css";
import munchImage from "..//landing/munch.png";

const RatingScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingDetails, setMatchingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userDone, setUserDone] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchedUserId = JSON.parse(localStorage.getItem("userId"))?.userId;
    setUserId(fetchedUserId);
  }, []);

  useEffect(() => {
    const fetchMatchingDetails = async () => {
      if (!userId) return;
      try {
        const res = await axios.get("https://munchmatch.onrender.com/api/dinner-plan/get-matching-details", {
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
    fetchMatchingDetails();
    return () => clearInterval(interval);
  }, [userId, navigate]);

  useEffect(() => {
    if (matchingDetails) {
      const fetchRestaurants = async () => {
        const {
          budget, diningStyle, cuisines, streetAddress,
          city, state, zipCode, radius, matchType
        } = matchingDetails.matchingDetails;

        try {
          const res = await axios.get("https://munchmatch.onrender.com/api/foursquare/find-matches", {
            params: {
              address: streetAddress,
              city, state, zipCode,
              radius, budget, diningStyle,
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
  }, [matchingDetails]);

  const handleVote = async () => {
    if (!restaurants[currentIndex]) return;

    const currentRestaurant = restaurants[currentIndex];
    try {
      await axios.patch("https://munchmatch.onrender.com/api/dinner-plan/update-vote", {
        userId,
        restaurantId: currentRestaurant.id,
        voteValue: rating,
        restaurantDetails: currentRestaurant,
      });

      if (currentIndex + 1 >= restaurants.length) {
        await axios.patch("https://munchmatch.onrender.com/api/dinner-plan/mark-user-done", { userId });
        setUserDone(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setRating(0);
      }
    } catch (error) {
      console.error("Failed to update vote:", error);
    }
  };

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

  if (isLoading || !matchingDetails) {
    return (
      <div className="waiting-screen">
        <img src={munchImage} alt="Loading" className="img" />
        <p className="p">Loading Details</p>
      </div>
    );
  }

  if (userDone) {
    return (
      <div className="waiting-screen">
        <img src={munchImage} alt="Waiting" className="img" />
        <p className="p">Waiting for others to finish matching!</p>
      </div>
    );
  }

  return (
    <div className="rating-screen">
      {restaurants[currentIndex] ? (
        <>
          <RestaurantCard restaurant={restaurants[currentIndex]} />
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
