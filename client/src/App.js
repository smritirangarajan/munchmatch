import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from "react-router-dom";

// Page imports
import LandingPage from "./pages/landing/landing.js";
import SignUp from "./pages/signup/signup.js";
import Login from "./pages/login/login.js";
import Home from "./pages/home/home.js";
import FindFriends from "./pages/findfriends/findfriends.js";
import AcceptFriends from "./pages/acceptfriend/acceptfriend.js";
import DinnerPlan from "./pages/dinnerplan/dinnerplan.js";
import MatchScreen from "./pages/matching/match.js";
import RatingScreen from "./pages/rating/rating.js";
import MatchSuccessPage from "./pages/matchsuccess/matchsuccess.js";
import NoMatches from "./pages/matchfail/matchfail.js";

// Simple responsive navigation bar component
function NavBar({ isLoggedIn, handleLogout }) {
  return (
    <nav style={styles.navbar}>
      {isLoggedIn ? (
        <>
          <Link to="/home" style={styles.link}>Home</Link>
          <button onClick={handleLogout} style={styles.link}>Log Out</button>
        </>
      ) : (
        <div>
          <Link to="/login" style={styles.link}>Log In</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </div>
      )}
    </nav>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // Check login status on route change
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
  
    if (storedUserId) {
      try {
        const parsed = JSON.parse(storedUserId);
        if (parsed) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Error parsing stored userId:", err);
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]);

  // Handle logout: clear state and reload to reset app
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    window.location.href = "/"; // Full reload ensures no stale state
  };

  // Hide NavBar on public routes
  const hideNavbarPaths = ["/", "/login", "/signup"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {/* Conditionally render navbar */}
      {showNavbar && <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
      
      {/* Define application routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Protected routes */}
        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" />} />
        <Route path="/findfriends" element={isLoggedIn ? <FindFriends /> : <Navigate to="/" />} />
        <Route path="/acceptfriend" element={isLoggedIn ? <AcceptFriends /> : <Navigate to="/" />} />
        <Route path="/dinnerplan" element={isLoggedIn ? <DinnerPlan /> : <Navigate to="/" />} />
        <Route path="/matching" element={isLoggedIn ? <MatchScreen /> : <Navigate to="/" />} />
        <Route path="/rating" element={isLoggedIn ? <RatingScreen /> : <Navigate to="/" />} />
        <Route path="/matching-completed" element={isLoggedIn ? <MatchSuccessPage /> : <Navigate to="/" />} />
        <Route path="/match-fail" element={isLoggedIn ? <NoMatches /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}

// Basic navbar styling
const styles = {
  navbar: {
    padding: "1rem 2rem",
    background: "#FFF6EC",
    color: "#FFF6EC",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  link: {
    color: "#FF5501",
    textDecoration: "none",
    marginLeft: "1rem",
    fontWeight: "bold",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "inherit",
    fontFamily: "inherit"
  },
};

// AppWrapper: provides routing context to <App />
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
