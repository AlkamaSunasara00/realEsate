import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { RiAdminLine } from 'react-icons/ri';
import { FiLogOut } from 'react-icons/fi';
import '../../../assets/css/admin/sidebar.css';

const Sidebar = ({ admin, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const role = admin?.role || 'client'; // default to 'client' if not present

  return (
    <aside className="admin-dashboard-sidebar">
      <div className="admin-sidebar-logo">
        <h4>XCART</h4>
        {admin?.name && <div className="sidebar-user-name">{admin.name}</div>}
        {admin?.role && <div className="sidebar-user-role">{admin.role}</div>}
      </div>

      <nav className="menu-content">
        <h6>MENU</h6>
        <ul>
          <li>
            <NavLink to="/admin/dashboard">
              <RxDashboard />
              <span>Dashboard</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <nav className="menu-content">
        <h6>USER MANAGEMENT</h6>
        <ul>
          {/* Only show Manage Admins to actual admins */}
          {role === 'admin' && (
            <li>
              <NavLink to="/admin/manage-admins">
                <RiAdminLine />
                <span>Manage Admins</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/admin/property">
              <RiAdminLine />
              Properties
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/manage-admins">
              <RiAdminLine />
              Manage Admins
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
  );
};

export default Sidebar;
