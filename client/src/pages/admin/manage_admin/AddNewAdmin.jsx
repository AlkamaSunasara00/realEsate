import React, { useState, useEffect } from "react";
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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!form.name || !form.email || !form.number || !form.password) {
        alert("Please fill in all required fields");
        return;
      }

      await api.post("/add-client", form);
      navigate("/admin/manage-admins");
    } catch (err) {
      alert(err?.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <>
      <Navbar />

      <main className={`admin-panel-header-div ${isMobile ? 'mobile-view' : ''} ${isTablet ? 'tablet-view' : ''}`}>
        <div className="admin-dashboard-main-header" style={{ marginBottom: "24px" }}>
          <div>
            <h5>Add New Admin</h5>
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
                    <label>Name <span style={{color: 'red'}}>*</span></label>
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Enter full name" 
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Email <span style={{color: 'red'}}>*</span></label>
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Enter email address" 
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Phone Number <span style={{color: 'red'}}>*</span></label>
                    <input 
                      name="number" 
                      type="tel" 
                      placeholder="Enter phone number" 
                      value={form.number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label>Password <span style={{color: 'red'}}>*</span></label>
                    <input 
                      name="password" 
                      type="password" 
                      placeholder="Set login password" 
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="block">Blocked</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="dashboard-add-content-right-side">
            {/* Empty for now - can add profile image upload later */}
          </div>

        </div>
      </main>
    </>
  );
};

export default AddNewAdmin;
