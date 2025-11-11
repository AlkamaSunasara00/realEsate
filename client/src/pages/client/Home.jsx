import React from "react";
import { FiSearch, FiHome, FiShield, FiClock } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import "../../assets/css/client/home.css";

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Find Your Dream Home</h1>
          <p>Discover the perfect property with XCART – trusted by thousands.</p>
          <NavLink to="/properties" className="btn btn-primary">
            Explore Properties
          </NavLink>
        </div>
      </section>

      {/* Search Bar */}
      <section className="search-section">
        <div className="container search-bar">
          <input type="text" placeholder="Search by location, price..." />
          <button className="btn btn-primary"><FiSearch /> Search</button>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container features-grid">
          <div className="feature-card">
            <FiHome />
            <h3>Wide Range</h3>
            <p>Apartments, villas, plots & more.</p>
          </div>
          <div className="feature-card">
            <FiShield />
            <h3>Verified Listings</h3>
            <p>100% genuine properties.</p>
          </div>
          <div className="feature-card">
            <FiClock />
            <h3>24/7 Support</h3>
            <p>Always here to help.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;