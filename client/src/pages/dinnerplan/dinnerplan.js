import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './dinnerplan.css';


const DinnerPlan = () => {
  const navigate = useNavigate();

  const [creator, setCreator] = useState('');
  const [group, setGroup] = useState(['']);
  const [budget, setBudget] = useState('');
  const [diningStyle, setDiningStyle] = useState('');
  const [cuisines, setCuisines] = useState(['']);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('');

  const [message, setMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [commonCuisines, setCommonCuisines] = useState([
    'Any','Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Mediterranean', 'American', 'Thai', 'French'
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userId"));
        const currentUserId = userData?.userId;

        if (!currentUserId) {
          console.error('User ID not found');
          return;
        }

        setCreator(currentUserId);

        const friendsRes = await axios.get('/api/friends/dinner-friend', {
          params: { userId: currentUserId }
        });

        setFriends(friendsRes.data);
      } catch (err) {
        console.error('Failed to fetch friends:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleGroupChange = (index, value) => {
    const newGroup = [...group];
    newGroup[index] = value;
    setGroup(newGroup);
  };

  const addGroupMember = () => {
    if (group.length < 4) {
      // Check if there are any friends left to add
      const availableFriends = friends.filter(
        friend => !group.includes(friend.id)
      );
      
      if (availableFriends.length > 0) {
        setGroup([...group, '']);
      } else {
        setMessage('No more friends available to add.');
      }
    } else {
      setMessage('You can only add up to 4 group members.');
    }
  };

  const handleCuisineChange = (index, value) => {
    const newCuisines = [...cuisines];
    newCuisines[index] = value;
    setCuisines(newCuisines);
  };

  const addCuisine = () => {
    setCuisines([...cuisines, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const totalGroupSize = 1 + group.length;
    const finalMatchType = totalGroupSize === 2 ? 'direct' : 'rating';
  
    try {
      const res = await axios.post('/api/dinner-plan/', {
        creator,
        group,
        budget,
        diningStyle,
        cuisines,
        streetAddress,
        city,
        state,
        zipCode,
        radius: Number(radius),
        matchType: finalMatchType,
      });
  
      setMessage('Dinner Plan created successfully!');
      console.log(res.data);
  
      if (finalMatchType === 'rating') {
        navigate('/rating');
      } else {
        navigate('/matching');
      }
  
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create dinner plan.';
      alert(errorMsg); // ✅ Display error in an alert
    }
  };
  // Filter friends to only show those not already in the group
  const getAvailableFriends = (currentIndex) => {
    return friends.filter(friend => {
      // For the current select, don't filter out the currently selected friend
      if (group[currentIndex] === friend.id) return true;
      // Filter out friends already selected in other group members
      return !group.includes(friend.id);
    });
  };

  return (
    <div className="dinner-page">
    <form className="dinner-form" onSubmit={handleSubmit}>
      <h2>Match Specifications</h2>
        <div>
          <label>Group Members:</label>
          {group.map((member, index) => (
            <select
              key={index}
              value={member}
              onChange={(e) => handleGroupChange(index, e.target.value)}
              required
            >
              <option value="">Select Friend {index + 1}</option>
              {getAvailableFriends(index).map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.name}
                </option>
              ))}
            </select>
          ))}
          <button type="button" onClick={addGroupMember}>Add Member</button>
        </div>

        {/* Rest of your form remains the same */}
        <div>
          <label>Budget:</label>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} required>
            <option value="">Select</option>
            <option value="cheap">Cheap</option>
            <option value="moderate">Moderate</option>
            <option value="expensive">Expensive</option>
          </select>
        </div>

        <div>
          <label>Dining Style:</label>
          <select value={diningStyle} onChange={(e) => setDiningStyle(e.target.value)} required>
            <option value="">Select</option>
            <option value="fast food">Fast Food</option>
            <option value="sit down">Sit Down</option>
            <option value="either">Either</option>
          </select>
        </div>

        <div>
          <label>Cuisine Preferences:</label>
          {cuisines.map((cuisine, index) => (
            <select
              key={index}
              value={cuisine}
              onChange={(e) => handleCuisineChange(index, e.target.value)}
              required
            >
              <option value="">Select Cuisine</option>
              {commonCuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          ))}
          <button type="button" onClick={addCuisine}>Add Cuisine</button>
        </div>

        <div>
          <label>Street Address:</label>
          <input
            type="text"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            required
            placeholder="Enter Street Address"
          />
        </div>

        <div>
          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Enter City"
          />
        </div>

        <div>
          <label>State:</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            placeholder="Enter State"
          />
        </div>

        <div>
          <label>Zip Code:</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            placeholder="Enter Zip Code"
          />
        </div>

        <div>
          <label>Radius (miles):</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            required
          />
        </div>

  

        <button type="submit">Create Dinner Plan</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default DinnerPlan;