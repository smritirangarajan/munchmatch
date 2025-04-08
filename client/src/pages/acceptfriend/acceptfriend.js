import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AcceptFriends = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [message, setMessage] = useState(""); // feedback message
  const navigate = useNavigate(); // navigation hook

  const fetchFriendRequests = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userId")); // parse stored user object
      const userId = storedUser.userId;
      const response = await axios.get(`/api/friends/requests`, {
        params: { userId: userId }, // Assume userId is stored in localStorage
      });
      setIncomingRequests(response.data.requests);
    } catch (err) {
      setMessage("Failed to fetch friend requests.");
    }
  };

  const handleAcceptRequest = async (senderId) => {
    console.log("Receiver ID:", localStorage.getItem("userId"));
    console.log(senderId);
    try {
      await axios.post("/api/friends/accept-request", {
        senderId: senderId,
        receiverId: JSON.parse(localStorage.getItem("userId")).userId,
      });
      setMessage("Friend request accepted.");
      fetchFriendRequests(); // Reload the list of friend requests
    } catch (err) {
      setMessage("Failed to accept request.");
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <div className="flex flex-col items-center mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Incoming Friend Requests</h2>
      {incomingRequests.length === 0 ? (
        <p>No incoming friend requests.</p>
      ) : (
        <ul className="space-y-2">
          {incomingRequests.map((request) => (
            <li key={request._id} className="flex items-center gap-4">
              <span>{request.name}</span>
              <button
                onClick={() => handleAcceptRequest(request.userId)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-gray-600">{message}</p>
      <button
        onClick={() => navigate("/home")}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Back to Home
      </button>
    </div>
  );
};

export default AcceptFriends;
