import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import './findfriends.css';

const FindFriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleFindFriend = async () => {
    if (!searchTerm.trim()) {
      setMessage("Please enter a username to search");
      return;
    }

    setFoundUsers([]);
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.get(`/api/friends/find-friends?username=${searchTerm}`);
      setFoundUsers(response.data.users);
      if (response.data.users.length === 0) {
        setMessage("No users found");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error searching for users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    const storedUser = JSON.parse(localStorage.getItem("userId"));
    const senderId = storedUser.userId;
    console.log("Stored user object:", storedUser); // 🟡 Add this
    console.log("Sender ID:", senderId);  

    if (!senderId) {
      setMessage("Please log in to send friend requests");
      return;
    }

    try {
      await axios.post("/api/friends/send-request", {
        senderId,
        receiverId
      });

      const receiver = foundUsers.find(user => user._id === receiverId);
      setMessage(`Friend request sent to ${receiver?.userId || "user"}!`);

      setFoundUsers(foundUsers.map(user =>
        user._id === receiverId ? { ...user, requestSent: true } : user
      ));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div style={{width: '100vw', height: '100vh', position: 'relative', background: '#FFF6EC', overflow: 'hidden'}}>
    <div className="friends-page">
    <div className="header">Find Friends</div>
      <div className="search-container">
        <input  className="search-input"
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleFindFriend()}
        />
        <div>
       
        </div>   
      </div>
      <button className= "search-button" onClick={handleFindFriend} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>

      {message && <div className="message-friend">{message}</div>}

      <div className="results">
        {foundUsers.map(user => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <span className="username">{user.userId}</span>
              <span className="name">{user.name}</span>
            </div>
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
