import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./acceptfriend.css";
import munchImage from "..//landing/munch.png";

const AcceptFriends = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchFriendRequests = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userId"));
      const userId = storedUser.userId;

      const response = await axios.get("https://munchmatch.onrender.com/api/friends/requests", {
        params: { userId },
      });

      setIncomingRequests(response.data.requests);
    } catch (err) {
      setMessage("Failed to fetch friend requests.");
    }
  };

  const declineFriendRequest = async (senderId, receiverId) => {
    try {
      const response = await fetch("https://munchmatch.onrender.com/api/friends/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": receiverId,
        },
        body: JSON.stringify({ senderId, receiverId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to decline request.");
      }

      return { success: true };
    } catch (error) {
      console.error("Decline failed:", error);
      return { success: false, error: error.message };
    }
  };

  const handleDecline = async (senderId) => {
    const currentUserId = JSON.parse(localStorage.getItem("userId")).userId;
    const result = await declineFriendRequest(senderId, currentUserId);

    if (result.success) {
      setIncomingRequests((prev) => prev.filter((r) => r.userId !== senderId));
    } else {
      alert("Failed to decline request: " + result.error);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      await axios.post("https://munchmatch.onrender.com/api/friends/accept-request", {
        senderId,
        receiverId: JSON.parse(localStorage.getItem("userId")).userId,
      });
      setMessage("Friend request accepted.");
      fetchFriendRequests();
    } catch (err) {
      setMessage("Failed to accept request.");
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "white", overflow: "hidden" }}>
      <div className="flex flex-col items-center mt-10 space-y-4">
        <div className="header">Friend Requests</div>
        {incomingRequests.length === 0 ? (
          <div>
            <img src={munchImage} alt="No Requests" className="img" />
            <p className="p">No Incoming Friend Requests</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {incomingRequests.map((request) => (
              <li key={request._id} className="friend-card">
                <span className="friend-name">@{request.name}</span>
                <div className="friend-buttons">
                  <button
                    onClick={() => handleAcceptRequest(request.userId)}
                    className="accept-button"
                  >
                    accept
                  </button>
                  <button
                    onClick={() => handleDecline(request.userId)}
                    className="delete-button"
                  >
                    delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default AcceptFriends;
