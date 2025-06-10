import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import burgerImage from "..//landing/munch.png";

const SignUpPage = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Local form state for user input
  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
    confirmPassword: "",
    dietaryRestrictions: [],
  });

  // Handle input changes (text and checkbox)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Add or remove dietary restriction
      setForm((prev) => {
        const newRestrictions = checked
          ? [...prev.dietaryRestrictions, value]
          : prev.dietaryRestrictions.filter((d) => d !== value);
        return { ...prev, dietaryRestrictions: newRestrictions };
      });
    } else {
      // Update text field (name, username, password, etc.)
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit signup form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for password mismatch
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Send signup data to backend
      await axios.post(`${BASE_URL}/api/auth/signup`, {
        name: form.name,
        userId: form.userId,
        password: form.password,
        dietaryRestrictions: form.dietaryRestrictions,
      });

      // Redirect to login page on success
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        {/* Sign-up form */}
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          <input
            name="name"
            placeholder="Name"
            type="text"
            onChange={handleChange}
            required
          />

          <input
            name="userId"
            placeholder="Username"
            type="text"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          {/* Dietary restrictions */}
          <div className="checkbox-group">
            <label>
              <input type="checkbox" value="vegetarian" onChange={handleChange} />
              Vegetarian
            </label>
            <label>
              <input type="checkbox" value="vegan" onChange={handleChange} />
              Vegan
            </label>
            <label>
              <input type="checkbox" value="gluten-free" onChange={handleChange} />
              Gluten-Free
            </label>
          </div>

          {/* Submit and login redirect */}
          <button type="submit">Sign up</button>
          <a href="/login" className="login-link">
            Already have an account? Log in
          </a>
        </form>

        {/* Right-side image */}
        <div className="signup-image">
          <img src={burgerImage} alt="Sign up graphic" />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
