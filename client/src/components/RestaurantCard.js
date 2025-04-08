// src/components/RestaurantCard.js
import React from "react";

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 text-center">
      <img
        src={restaurant.image || "https://via.placeholder.com/150"}
        alt={restaurant.name}
        className="w-full h-40 object-cover rounded-md"
      />
      <h2 className="text-xl font-semibold mt-2">{restaurant.name}</h2>
      <p className="text-gray-600">{restaurant.distance} miles away</p>
      <p className="text-gray-700">{restaurant.cuisine}</p>
      <p className="text-gray-700">{restaurant.diningStyle}</p>
      <p className="font-bold">{restaurant.budget}</p>
    </div>
  );
};

export default RestaurantCard;
