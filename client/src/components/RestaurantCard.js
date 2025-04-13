import React from 'react';
import './RestaurantCard.css'; // Make sure this file exists

const RestaurantCard = ({ restaurant }) => {
  const imageUrl = restaurant.image || restaurant.photo?.images?.original?.url;

  return (
    <div className="restaurant-card">
      <div className="restaurant-name">{restaurant.name}</div>

      {imageUrl && (
        <img className="restaurant-image" src={imageUrl} alt={restaurant.name} />
      )}

      {restaurant.menu?.available && restaurant.menu?.url && (
        <a
          href={restaurant.menu.url}
          target="_blank"
          rel="noopener noreferrer"
          className="menu-button"
        >
          View Full Menu
        </a>
      )}

      <div className="restaurant-info">
        <p><strong>Distance:</strong> {restaurant.distance || 'N/A'} miles</p>
        <p><strong>Rating:</strong> {restaurant.rating || 'N/A'}</p>
        <p><strong>Description:</strong> {restaurant.menu?.description || 'No description available.'}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;
