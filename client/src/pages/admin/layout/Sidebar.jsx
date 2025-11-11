// src/components/admin/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { RiAdminLine, RiHome7Fill, RiMoneyDollarCircleLine, RiFileList3Line } from 'react-icons/ri';
import { FiLogOut, FiX } from 'react-icons/fi';
import '../../../assets/css/admin/sidebar.css';

const Sidebar = ({ admin, onLogout, isMobile, isTablet, isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const role = admin?.role || 'client';
  const adminId = admin?.id;

  const [menuReady, setMenuReady] = useState(false);
  useEffect(() => {
    if (admin) setMenuReady(true);
  }, [admin]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      localStorage.clear();
    }
  };

  const handleNavClick = () => {
    if (!(isMobile || isTablet)) return;
    setTimeout(() => {
      if (isSidebarOpen) toggleSidebar();
    }, 120);
  };

  // Scroll lock
  useEffect(() => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen, isMobile, isTablet]);

  // ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isSidebarOpen && (isMobile || isTablet)) {
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isSidebarOpen, isMobile, isTablet, toggleSidebar]);

  const getSidebarClasses = () => {
    let classes = 'admin-dashboard-sidebar';
    if (isMobile) classes += ' mobile-sidebar';
    if (isTablet) classes += ' tablet-sidebar';
    if ((isMobile || isTablet) && isSidebarOpen) classes += ' sidebar-open';
    return classes;
  };

  const icons = {
    dashboard: <RxDashboard />,
    profile: <RiAdminLine />,
    clients: <RiAdminLine />,
    properties: <RiHome7Fill />,
    assigned: <RiFileList3Line />,
    payments: <RiMoneyDollarCircleLine />,
  };

  return (
    <>
      {/* Overlay */}
      {(isMobile || isTablet) && isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
        />
      )}

      <aside className={getSidebarClasses()} aria-label="Admin navigation">
        {/* Mobile Header */}
        {(isMobile || isTablet) && (
          <div className="sidebar-mobile-header">
            <div className="admin-sidebar-logo">
              <h4>XCART</h4>
            </div>
            <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close sidebar">
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

        {/* === USER INFO – HORIZONTAL LAYOUT === */}
        {admin && (
          <div className="sidebar-user-info-horizontal">
            <div className="sidebar-user-avatar">
              {admin.profileImage ? (
                <img src={admin.profileImage} alt={admin.name} />
              ) : (
                <RiAdminLine />
              )}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{admin.name || 'Admin'}</div>
              <div className="sidebar-user-role">{role.toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* Menu */}
        {admin && (
          <>
            <nav className="menu-content">
              <h6>MENU</h6>
              <ul>
                {role === 'admin' ? (
                  <li>
                    <NavLink to="/admin/dashboard" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
                      {icons.dashboard} <span>Dashboard</span>
                    </NavLink>
                  </li>
                ) : (
                  <li>
                    <NavLink to={`/admin/view-admin/${adminId}`} onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
                      {icons.profile} <span>My Profile</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>

            {role === 'admin' && (
              <nav className="menu-content">
                <h6>MANAGEMENT</h6>
                <ul>
                  <li>
                    <NavLink to="/admin/manage-admins" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
                      {icons.clients} <span>Clients</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/property" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
                      {icons.properties} <span>Properties</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/propertyassigned" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
                      {icons.assigned} <span>Assigned</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/payments" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
                      {icons.payments} <span>Payments</span>
                    </NavLink>
                  </li>
                </ul>
              </nav>
            )}

            <div className="menu-content logout-section">
              <button onClick={handleLogout} className="sidebar-logout-btn">
                <FiLogOut /> <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;