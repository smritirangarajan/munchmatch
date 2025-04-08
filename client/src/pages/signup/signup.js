import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const SignUpPage = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
    confirmPassword: "",
    dietaryRestrictions: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => {
        const newRestrictions = checked
          ? [...prev.dietaryRestrictions, value]
          : prev.dietaryRestrictions.filter((d) => d !== value);
        return { ...prev, dietaryRestrictions: newRestrictions };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name: form.name,
        userId: form.userId,
        password: form.password,
        dietaryRestrictions: form.dietaryRestrictions,
      });
      alert("Signup successful!");
      navigate("/login"); // 👈 Redirect to login page
    } catch (err) {
      console.error(err);
      alert("Signup failed.");
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="userId" placeholder="User ID" onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
        />

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

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;
