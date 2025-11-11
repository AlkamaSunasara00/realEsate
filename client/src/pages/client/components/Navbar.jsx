// src/pages/client/components/ClientNavbar.jsx
import React, { useState, useEffect } from "react";
import { FiMenu, FiX, FiUser } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import "../../../assets/css/client/navbar.css";

const ClientNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="client-navbar">
        <div className="client-navbar-container">
          <NavLink to="/" className="client-navbar-logo">
            <h2>properties</h2>
          </NavLink>

          <div className="client-navbar-links">
            <NavLink to="/" className="client-nav-link">Home</NavLink>
            <NavLink to="/properties" className="client-nav-link">Properties</NavLink>
            <NavLink to="/about" className="client-nav-link">About</NavLink>
            <NavLink to="/contact" className="client-nav-link">Contact</NavLink>
          </div>

          <div className="client-navbar-right">
            <button className="client-btn-outline">
              <FiUser /> Login
            </button>
            {isMobile && (
              <button
                className="client-hamburger"
                onClick={() => setIsSidebarOpen(true)}
              >
                <FiMenu />
              </button>
            )}
          </div>
        </div>
      </nav>

      {isSidebarOpen && (
        <>
          <div
            className="client-sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="client-sidebar">
            <div className="client-sidebar-header">
              <h3>XCART</h3>
              <button onClick={() => setIsSidebarOpen(false)}>
                <FiX />
              </button>
            </div>
            <nav className="client-sidebar-links">
              <NavLink to="/" onClick={() => setIsSidebarOpen(false)}>Home</NavLink>
              <NavLink to="/properties" onClick={() => setIsSidebarOpen(false)}>Properties</NavLink>
              <NavLink to="/about" onClick={() => setIsSidebarOpen(false)}>About</NavLink>
              <NavLink to="/contact" onClick={() => setIsSidebarOpen(false)}>Contact</NavLink>
              <NavLink  to="/admin/login" onClick={() => setIsSidebarOpen(false)}>
                <button className="client-btn-primary">
                <FiUser /> Login
              </button>
              </NavLink>
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default ClientNavbar;



