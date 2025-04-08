import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <nav style={styles.navbar}>
        <Link to="/" style={styles.link}>Home</Link>
        <div>
          <Link to="/login" style={styles.link}>Log In</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/findfriends" element={<FindFriends />} />
        <Route path="/acceptfriend" element={<AcceptFriends />} />
        <Route path="/dinnerplan" element={<DinnerPlan />} />
        <Route path="/matching" element={<MatchScreen />} />
        <Route path="/rating" element={<RatingScreen />} />
        <Route path="/matching-completed" element={<MatchSuccessPage/>} />
        <Route path="/match-fail" element={<NoMatches/>} />
      </Routes>
    </Router>
  );
}

const styles = {
  navbar: {
    padding: "1rem 2rem",
    background: "#333",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  link: {
    color: "white",
    textDecoration: "none",
    marginLeft: "1rem",
    fontWeight: "bold"
  }
};


export default App