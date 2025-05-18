import React from "react";
import { Link } from "react-router-dom";
import './landing.css';
import munchImage from './munch.png';

const LandingPage = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#FFF6EC', overflow: 'hidden' }}>
      <div className="login">
        <Link to="/login" className="login-link">
          Log In
        </Link>
      </div>

      <div className="container">
        <div className="left-container">
          <div className="munch-match">
            MUNCH MATCH
          </div>
          <div className="create-account-btn">
            <div className="create-account-text">
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>

        <div className="right-section">
          <img src={munchImage} alt="Munch Match logo" className="image" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
