// src/components/Footer.jsx
import React from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import "../../../assets/css/client/footer.css";


const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <h3>XCART</h3>
          <p>Your trusted real estate partner in finding dream homes.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/properties">Properties</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p><FiMail /> support@xcart.com</p>
          <p><FiPhone /> +91 98765 43210</p>
          <p><FiMapPin /> Mumbai, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 XCART. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;