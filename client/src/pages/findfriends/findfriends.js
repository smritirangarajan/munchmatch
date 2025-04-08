import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

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
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const senderId = storedUser.userId;

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
    <div className="friends-page">
      <h2>Find Friends</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleFindFriend()}
        />
        <button onClick={handleFindFriend} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {message && <div className="message">{message}</div>}

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
                className="btn-send-request"
              >
                Send Request
              </button>
            ) : (
              <span className="request-sent">Request Sent</span>
            )}
          </div>
        ))}
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/home")}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Back to Home
      </button>

      <style>{`
        .friends-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .search-container {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        input {
          flex: 1;
          padding: 8px;
        }
        .results {
          margin-top: 20px;
        }
        .user-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .username {
          font-weight: bold;
        }
        .email {
          color: #666;
          font-size: 0.9em;
        }
        .message {
          padding: 10px;
          background: #f0f0f0;
          border-radius: 4px;
          margin: 10px 0;
        }
        .request-sent {
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default FindFriendsPage;
