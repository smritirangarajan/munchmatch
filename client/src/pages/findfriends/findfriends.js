import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './findfriends.css';

const FindFriendsPage = () => {
  // React state hooks for UI control
  const [searchTerm, setSearchTerm] = useState("");         // Search input
  const [foundUsers, setFoundUsers] = useState([]);         // List of matching users
  const [message, setMessage] = useState("");               // Feedback message
  const [isLoading, setIsLoading] = useState(false);        // Loading state
  const navigate = useNavigate();

  // Triggered when user clicks 'Search' or presses Enter
  const handleFindFriend = async () => {
    if (!searchTerm.trim()) {
      setMessage("Please enter a username to search");
      return;
    }

    // Clear results and show loading state
    setFoundUsers([]);
    setIsLoading(true);
    setMessage("");

    try {
      // Fetch users that match the search term from backend
      const response = await axios.get(`https://munchmatch.onrender.com/api/friends/find-friends?username=${searchTerm}`);
      setFoundUsers(response.data.users);

      // Show message if no matches are found
      if (response.data.users.length === 0) {
        setMessage("No users found");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error searching for users");
    } finally {
      setIsLoading(false);
    }
  };

  // Sends a friend request to the selected user
  const handleSendRequest = async (receiverId) => {
    const storedUser = JSON.parse(localStorage.getItem("userId"));
    const senderId = storedUser.userId;

    if (!senderId) {
      setMessage("Please log in to send friend requests");
      return;
    }

    try {
      // POST request to send a friend request
      await axios.post("https://munchmatch.onrender.com/api/friends/send-request", {
        senderId,
        receiverId
      });

      // Update local UI and show success message
      const receiver = foundUsers.find(user => user._id === receiverId);
      setMessage(`Friend request sent to ${receiver?.userId || "user"}!`);

      // Mark user as "request sent" in the UI
      setFoundUsers(foundUsers.map(user =>
        user._id === receiverId ? { ...user, requestSent: true } : user
      ));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#FFF6EC', overflow: 'hidden' }}>
      <div className="friends-page">
        <div className="header">Find Friends</div>

        {/* Search input box */}
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFindFriend()}
          />
        </div>

        {/* Search button */}
        <button className="search-button" onClick={handleFindFriend} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>

        {/* Message output */}
        {message && <div className="message-friend">{message}</div>}

        {/* Display list of found users */}
        <div className="results">
          {foundUsers.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-info">
                <span className="username">{user.userId}</span>
                <span className="name">{user.name}</span>
              </div>

              {/* Show request button or "sent" label based on state */}
              {!user.requestSent ? (
                <button
                  onClick={() => handleSendRequest(user._id)}
                  className="friend-button"
                >
                  Send Request
                </button>
              ) : (
                <span className="request-sent">Request Sent</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindFriendsPage;
