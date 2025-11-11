// src/components/admin/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { GoSearch } from "react-icons/go";
import { TiArrowSortedDown } from "react-icons/ti";
import { FiMenu } from "react-icons/fi";
import { HiOutlineLogout } from "react-icons/hi";
import { RiAdminLine } from "react-icons/ri";
import "../../../assets/css/admin/navbar.css";

const Navbar = ({ toggleSidebar, isMobile, isTablet, admin, onLogout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  const toggleProfileDropdown = () => setShowProfileDropdown(!showProfileDropdown);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  return (
    <nav className={`dashboard-navbar ${isMobile ? "mobile-nav" : ""} ${isTablet ? "tablet-nav" : ""}`}>
      <div className="dashboard-navbar-left">
        {/* Hamburger */}
        {(isMobile || isTablet) && (
          <button className="hamburger-menu" onClick={toggleSidebar} aria-label="Open menu">
            <FiMenu />
          </button>
        )}

        {/* Search */}
        <div className="dashboard-navbar-search-input">
          <input type="text" placeholder="Search..." aria-label="Search" />
          <GoSearch />
        </div>
      </div>

      {/* Profile */}
      <div className="dashboard-nav-notification-bell-profile">
        <div className="dashboard-nav-profile-wrapper" ref={dropdownRef}>
          <div className="dashboard-nav-profile" onClick={toggleProfileDropdown}>
            {/* Avatar with fallback */}
            {admin?.profileImage ? (
              <img src={admin.profileImage} alt={admin.name} />
            ) : (
              <div className="sidebar-user-avatar" style={{ width: 40, height: 40, fontSize: 18 }}>
                <RiAdminLine />
              </div>
            )}

            {/* Name & Role - Hidden on mobile */}
            {!isMobile && (
              <div className="profile-info">
                <div className="dashboard-nav-profile-name">
                  {admin?.name || "Admin"}
                </div>
                <div className="dashboard-nav-profile-role">
                  {admin?.role?.toUpperCase() || "ADMIN"}
                </div>
              </div>
            )}

            {/* Arrow */}
            {!isMobile && <TiArrowSortedDown className={showProfileDropdown ? "rotate-arrow" : ""} />}
          </div>

          {/* Dropdown */}
          {showProfileDropdown && (
            <div className={`profile-dropdown ${isMobile ? "mobile-dropdown" : ""}`}>
              {isMobile && (
                <div className="mobile-profile-header">
                  <div className="mobile-profile-info">
                    <span>{admin?.name || "Admin"}</span>
                    <p>{admin?.email || "admin@example.com"}</p>
                  </div>
                </div>
              )}

              <div className="dropdown-menu-items">
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <HiOutlineLogout />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;