import React, { useState, useRef, useEffect } from "react";
import { GoSearch } from "react-icons/go";
import { TiArrowSortedDown } from "react-icons/ti";
import { FiMenu } from "react-icons/fi";
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog } from "react-icons/hi";
import DashboardProfile from "../../../assets/image/dash-profile.png";
import "../../../assets/css/admin/navbar.css";

const Navbar = ({ toggleSidebar, isMobile, isTablet, admin }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <nav className={`dashboard-navbar ${isMobile ? 'mobile-nav' : ''} ${isTablet ? 'tablet-nav' : ''}`}>
      <div className="dashboard-navbar-left">
        {/* HAMBURGER MENU - Shows only on tablet/mobile */}
        {(isMobile || isTablet) && (
          <button 
            className="hamburger-menu" 
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >
            <FiMenu />
          </button>
        )}
        
        {/* Search Input - NOW VISIBLE ON ALL DEVICES */}
        <div className="dashboard-navbar-search-input">
          <input type="text" placeholder="Search..." aria-label="Search" />
          <GoSearch />
        </div>
      </div>
      
      <div className="dashboard-nav-notification-bell-profile">
        {/* NOTIFICATION BELL REMOVED AS REQUESTED */}
        
        {/* Profile Section with Dropdown */}
        <div className="dashboard-nav-profile-wrapper" ref={dropdownRef}>
          <div 
            className="dashboard-nav-profile" 
            onClick={toggleProfileDropdown}
          >
            <img src={DashboardProfile} alt="Admin profile" />
            {!isMobile && (
              <>
                <div className="dashboard-nav-profile-name">
                  <span>{admin?.name || 'Hammad'}</span>
                  <p>{admin?.role || 'ADMIN'}</p>
                </div>
                <TiArrowSortedDown className={showProfileDropdown ? 'rotate-arrow' : ''} />
              </>
            )}
          </div>

          {/* Profile Dropdown - Works on all screen sizes */}
          {showProfileDropdown && (
            <div className={`profile-dropdown ${isMobile ? 'mobile-dropdown' : ''}`}>
              {/* Only show profile info on mobile */}
              {isMobile && (
                <div className="mobile-profile-header">
                  <div className="mobile-profile-info">
                    <span>{admin?.name || 'Hammad'}</span>
                    <p>{admin?.email || 'admin@example.com'}</p>
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
