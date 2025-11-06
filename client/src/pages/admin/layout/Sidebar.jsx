import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { RiAdminLine } from 'react-icons/ri';
import { FiLogOut, FiX } from 'react-icons/fi';
import '../../../assets/css/admin/sidebar.css';

const Sidebar = ({ admin, onLogout, isMobile, isTablet, isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const role = admin?.role || 'client';

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      localStorage.clear()
    }
  };

  // Close sidebar when route changes on mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      // Close the sidebar when route changes
      const timer = setTimeout(() => {
        toggleSidebar();
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only depend on pathname

  // Prevent body scroll when sidebar is open on mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen, isMobile, isTablet]);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isSidebarOpen && (isMobile || isTablet)) {
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isSidebarOpen, isMobile, isTablet, toggleSidebar]);

  // Build sidebar classes dynamically
  const getSidebarClasses = () => {
    let classes = 'admin-dashboard-sidebar';
    
    if (isMobile) {
      classes += ' mobile-sidebar';
    } else if (isTablet) {
      classes += ' tablet-sidebar';
    }
    
    if ((isMobile || isTablet) && isSidebarOpen) {
      classes += ' sidebar-open';
    }
    
    return classes;
  };

  // Handler for nav link clicks
  const handleNavClick = () => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {(isMobile || isTablet) && isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar overlay"
          onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={getSidebarClasses()}
        aria-label="Main navigation sidebar"
      >
        {/* Mobile/Tablet Header with Close Button */}
        {(isMobile || isTablet) && (
          <div className="sidebar-mobile-header">
            <div className="admin-sidebar-logo">
              <h4>XCART</h4>
            </div>
            <button 
              className="sidebar-close-btn" 
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <FiX />
            </button>
          </div>
        )}
        
        {/* Desktop Logo */}
        {!isMobile && !isTablet && (
          <div className="admin-sidebar-logo">
            <h4>XCART</h4>
          </div>
        )}

        <nav className="menu-content">
          <h6>MENU</h6>
          <ul>
            <li>
              <NavLink 
                to="/admin/dashboard" 
                onClick={handleNavClick}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <RxDashboard />
                <span>Dashboard</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <nav className="menu-content">
          <h6>USER MANAGEMENT</h6>
          <ul>
            {role === 'admin' && (
              <li>
                <NavLink 
                  to="/admin/manage-admins" 
                  onClick={handleNavClick}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <RiAdminLine />
                  <span>Manage Admins</span>
                </NavLink>
              </li>
            )}
            <li>
              <NavLink 
                to="/admin/property" 
                onClick={handleNavClick}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <RiAdminLine />
                <span>Properties</span>
              </NavLink>
            </li>
          </ul>
        </nav>
          )}
          <li>
            <NavLink to="/admin/property">
              <RiAdminLine />
              Properties
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/propertyassigned">
              <RiAdminLine />
              Propertyasigned
            </NavLink>
          </li>
        </ul>
      </nav>

        <div className="menu-content">
          <h6>OTHERS</h6>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;