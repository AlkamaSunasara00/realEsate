import React from "react";
import { LuBellRing } from "react-icons/lu";
import { GoSearch } from "react-icons/go";
import { TiArrowSortedDown } from "react-icons/ti";
import DashboardProfile from "../../../assets/image/dash-profile.png";
import "../../../assets/css/admin/navbar.css";

const Navbar = () => {
  return (
    <>
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-seach-input">
          <input type="text" placeholder="Search..." />
          <GoSearch />
        </div>
        <div className="dashboard-nav-notification-bell-profile">
          <div className="dashboard-nav-notification-bell">
            <LuBellRing />
          </div>
          <div className="dashboard-nav-profile">
            <img src={DashboardProfile} alt="profile-logo" />
            <div className="dashboard-nav-profile-name">
              <span>Admin Dashboard</span>
              <p>Admin</p>
            </div>
            <TiArrowSortedDown />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
