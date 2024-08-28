import React from 'react';
import '../css/Header.css';
import logo from "../images/logo.PNG"

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Poetry Haven Logo" />
        </div>
      <nav className="nav">
        <a href="#"><b>Home</b></a>
        <a href="#"><b>About Us</b></a>
        <a href="#"><b>Explore</b></a>
        <a href="#"><b>Contact Us</b></a>
        </nav>
        <div>
            <button className="btn">Log In</button>
        <button className="btn">Create Account</button>
        </div>
        
      
    </header>
  );
};

export default Header;
