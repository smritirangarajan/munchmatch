import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const LoginPage = ({ setIsLoggedIn }) => {
  // Local state for user credentials
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send login request to backend
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        userId,
        password,
      });

      // Save user info in localStorage
      localStorage.setItem("userId", JSON.stringify(res.data.user));

      // Update global login state and redirect to home
      setIsLoggedIn(true);
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Login failed.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#FF5501",
        overflow: "hidden"
      }}
    >
      <div className="login-container">
        <div className="login-header">Log in</div>

        {/* Login form */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Username input */}
          <div className="form-field">
            <div className="form-label">Username</div>
            <input
              className="form-input"
              placeholder="Username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div className="form-field">
            <div className="form-label">Password</div>
            <input
              className="form-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="login-button">
            Log In
          </button>

          {/* Link to sign-up page */}
          <a href="/signup" className="signup-link">
            Don’t have an account? Sign up
          </a>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
