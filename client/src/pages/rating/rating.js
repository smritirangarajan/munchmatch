import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantCard from "../../components/RestaurantCard";
import { useNavigate } from "react-router-dom";

const RatingScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingDetails, setMatchingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userDone, setUserDone] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [rating, setRating] = useState(0); // Track the rating value
  const navigate = useNavigate();

  // Get userId
  useEffect(() => {
    const fetchUserId = async () => {
      const fetchedUserId = JSON.parse(localStorage.getItem("userId"))?.userId;
      setUserId(fetchedUserId);
    };
    fetchUserId();
  }, []);

  // Fetch matching details and keep polling for updates
  useEffect(() => {
    const fetchMatchingDetails = async () => {
      if (!userId) return;

      try {
        const res = await axios.get("http://localhost:5000/api/dinner-plan/get-matching-details", {
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

        // Check if all users are done (all users have rated)
        const allDone = allUsers.every(user => done.includes(user));
        if (allDone) {
          navigate("/matching-completed");
        }
      } catch (err) {
        console.error("Failed to fetch matching details:", err);
      }
    };

    const interval = setInterval(fetchMatchingDetails, 3000); // Poll every 3s
    fetchMatchingDetails();

    return () => clearInterval(interval);
  }, [userId, navigate]);

  // Fetch restaurants once matching details are available
  useEffect(() => {
    if (matchingDetails) {
      const fetchRestaurants = async () => {
        const {
          budget, diningStyle, cuisines, streetAddress,
          city, state, zipCode, radius, matchType
        } = matchingDetails.matchingDetails;

        try {
          console.log("📦 matchingDetails being sent:", JSON.stringify(matchingDetails, null, 2));

          const res = await axios.get("http://localhost:5000/api/foursquare/find-matches", {
            params: {
              address: streetAddress,
              city: city,
              state: state,
              zipCode: zipCode,
              radius: radius,
              budget: budget,
              diningStyle: diningStyle,
              cuisines: (cuisines || []).join(","),
              matchType: matchType,
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
      // Send the rating instead of a yes/no vote
      await axios.patch("http://localhost:5000/api/dinner-plan/update-vote", {
        userId,
        restaurantId: currentRestaurant.id,
        voteValue: rating, // Use the slider value as the rating
        restaurantDetails: currentRestaurant,
      });
      setCurrentIndex(prev => prev + 1);
      setRating(0); // Reset the slider value
    } catch (error) {
      console.error("Failed to update vote:", error);
    }
  };

  // Mark user as done if they finish all restaurants
  useEffect(() => {
    const markUserDone = async () => {
      try {
        await axios.patch("http://localhost:5000/api/dinner-plan/mark-user-done", { userId });
        setUserDone(true);
      } catch (err) {
        console.error("Failed to mark user as done:", err);
      }
    };

    if (!userDone && currentIndex >= restaurants.length && userId) {
      markUserDone();
    }
  }, [currentIndex, restaurants.length, userId, userDone]);

  if (isLoading || !matchingDetails) {
    return <p>Loading details...</p>;
  }

  if (currentIndex >= restaurants.length && userDone) {
    return (
      <div className="flex flex-col items-center mt-10">
        <p className="text-xl font-semibold text-gray-700">Waiting for the other person to finish rating...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {restaurants[currentIndex] ? (
        <>
          <RestaurantCard restaurant={restaurants[currentIndex]} />
          <div className="mt-4 flex flex-col gap-4">
            <label htmlFor="rating" className="text-xl font-semibold">Rate this restaurant</label>
            <input
              type="range"
              id="rating"
              min="0"
              max="5"
              step="1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-1/2"
            />
            <div className="flex justify-center">
              <span className="text-xl">{rating}</span>
            </div>
            <button
              onClick={handleVote}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
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
