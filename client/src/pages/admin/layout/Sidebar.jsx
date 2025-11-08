import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { RiAdminLine } from 'react-icons/ri';
import { FiLogOut, FiX } from 'react-icons/fi';
import '../../../assets/css/admin/sidebar.css';

const Sidebar = ({ admin, onLogout, isMobile, isTablet, isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const role = admin?.role || 'client';
  const adminId = admin?.id;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      localStorage.clear();
    }
  };

  // Close sidebar when route changes (on mobile/tablet)
  useEffect(() => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      const timer = setTimeout(() => toggleSidebar(), 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Disable body scroll on sidebar open
  useEffect(() => {
    document.body.style.overflow = (isMobile || isTablet) && isSidebarOpen ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [isSidebarOpen, isMobile, isTablet]);

  // ESC key closes sidebar
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isSidebarOpen && (isMobile || isTablet)) toggleSidebar();
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isSidebarOpen, isMobile, isTablet, toggleSidebar]);

  const getSidebarClasses = () => {
    let classes = 'admin-dashboard-sidebar';
    if (isMobile) classes += ' mobile-sidebar';
    else if (isTablet) classes += ' tablet-sidebar';
    if ((isMobile || isTablet) && isSidebarOpen) classes += ' sidebar-open';
    return classes;
  };

  const handleNavClick = () => {
    if ((isMobile || isTablet) && isSidebarOpen) toggleSidebar();
  };

  return (
    <>
      {/* Mobile overlay */}
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

      <aside className={getSidebarClasses()} aria-label="Main navigation sidebar">
        {/* Header */}
        {(isMobile || isTablet) ? (
          <div className="sidebar-mobile-header">
            <div className="admin-sidebar-logo"><h4>XCART</h4></div>
            <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close sidebar">
              <FiX />
            </button>
          </div>
        ) : (
          <div className="admin-sidebar-logo"><h4>XCART</h4></div>
        )}

        {/* Sidebar Menu */}
        <nav className="menu-content">
          <h6>MENU</h6>
          <ul>
            {role === 'admin' ? (
              <>
                <li>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={handleNavClick}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <RxDashboard />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
              </>
            ) : (
              <li>
                <NavLink
                  to={`/admin/view-admin/${adminId}`}
                  onClick={handleNavClick}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <RiAdminLine />
                  <span>My Profile</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Admin-only section */}
        {role === 'admin' && (
          <>
            <nav className="menu-content">
              <h6>USER MANAGEMENT</h6>
              <ul>
                <li>
                  <NavLink
                    to="/admin/manage-admins"
                    onClick={handleNavClick}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <RiAdminLine />
                    <span>Clients</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/property" onClick={handleNavClick}>
                    <RiAdminLine />
                    <span>Properties</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/propertyassigned" onClick={handleNavClick}>
                    <RiAdminLine />
                    <span>Property Assigned</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/payments" onClick={handleNavClick}>
                    <RiAdminLine />
                    <span>Payments</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </>
        )}

        {/* Logout */}
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
