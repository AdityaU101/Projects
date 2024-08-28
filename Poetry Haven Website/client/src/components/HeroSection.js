import React from 'react';
import '../css/HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero">
      <h1>Discover the World of Poetry</h1>
      <p>Explore, Read, and Connect with Your Favourite Poets.</p>
      <div className="search-bar">
        <input type="text" placeholder="Search Poet" />
        <button>Search</button>
      </div>
      <button className="subscribe-btn">Subscribe Now!!</button>
    </div>
  );
};

export default HeroSection;
