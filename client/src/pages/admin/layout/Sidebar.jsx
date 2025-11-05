// Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { RiAdminLine, RiCoupon2Line, RiProductHuntLine } from 'react-icons/ri';
import { LuUsers } from 'react-icons/lu';
import { FiLogOut } from 'react-icons/fi';
import { IoGiftOutline } from 'react-icons/io5';
import { MdOutlineCategory } from 'react-icons/md';
import '../../../assets/css/admin/sidebar.css';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <aside className="admin-dashboard-sidebar">
      <div className="admin-sidebar-logo">
        <h4>XCART</h4>
      </div>
      <nav className="menu-content">
        <h6>MENU</h6>
        <ul>
          <li>
            <NavLink to="/admin/dashboard">
              <RxDashboard />
              Dashboard
            </NavLink>
          </li>
        </ul>
      </nav>
      <nav className="menu-content">
        <h6>USER MANAGEMENT</h6>
        <ul>
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
        <button onClick={handleLogout}>
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
