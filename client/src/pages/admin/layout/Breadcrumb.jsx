import React from "react";
import { Link, NavLink } from "react-router-dom";
import { HiOutlinePlus } from "react-icons/hi";
import { IoMdArrowDropright } from "react-icons/io";

const Breadcrumb = ({ title, breadcrumbText, button }) => {
  return (
    <div className="admin-dashboard-main-header">
      <div>
        <h5>{title}</h5>
        <div className="admin-panel-breadcrumb">
          <Link to="/admin/dashboard" className="breadcrumb-link active">
            Dashboard
          </Link>
          <IoMdArrowDropright />
          <span className="breadcrumb-text">{breadcrumbText}</span>
        </div>
      </div>
      {button && (
        <NavLink
          to={button.link}
          className="primary-btn dashboard-add-product-btn"
        >
          <HiOutlinePlus /> {button.text}
        </NavLink>
      )}
    </div>
  );
};

export default Breadcrumb;
