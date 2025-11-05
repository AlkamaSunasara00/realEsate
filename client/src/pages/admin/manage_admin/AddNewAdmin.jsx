import React, { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const AddNewAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    status: "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post("/add-client", form); // role = client backend pe auto set hai
      navigate("/admin/manage-admins");
    } catch (err) {
      alert(err?.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <div className="admin-dashboard-main-header" style={{ marginBottom: "24px" }}>
          <div>
            <h5>Add Admin</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">Dashboard</Link>
              <IoMdArrowDropright />
              <Link to="/admin/manage-admins" className="breadcrumb-link active">Admin List</Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Add Admin</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink to="/admin/manage-admins" className="cancel-btn dashboard-add-product-btn">
              <HiXMark /> Cancel
            </NavLink>

            <button onClick={handleSubmit} className="primary-btn dashboard-add-product-btn">
              <MdSave /> Save Admin
            </button>
          </div>
        </div>

        <div className="dashboard-add-content-card-div">
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>General Information</h6>

              <div className="add-product-form-container">
                <div className="coupon-code-input-profile">
                  <div>
                    <label>Name</label>
                    <input name="name" type="text" placeholder="Full Name..." onChange={handleChange} />
                  </div>

                  <div>
                    <label>Email</label>
                    <input name="email" type="text" placeholder="Email..." onChange={handleChange} />
                  </div>

                  <div>
                    <label>Phone Number</label>
                    <input name="number" type="text" placeholder="Phone Number..." onChange={handleChange} />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label>Password</label>
                    <input name="password" type="password" placeholder="Set Login Password..." onChange={handleChange} />
                  </div>

                  <div>
                    <label>Status</label>
                    <select name="status" onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="block">Blocked</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="dashboard-add-content-right-side">
            
          </div>

        </div>
      </main>
    </>
  );
};

export default AddNewAdmin;
