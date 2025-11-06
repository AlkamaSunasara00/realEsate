import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axiosInstance";

const EditAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    alt_number: "",
    status: "active",
  });

  const [imgPreview, setImgPreview] = useState(null);
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/getagencybyid/${id}`);
        setForm(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => fd.append(key, form[key]));
      if (document.getElementById("profileImg").files[0]) {
        fd.append("img", document.getElementById("profileImg").files[0]);
      }

      await api.put(`/update-client/${id}`, fd);
      navigate("/admin/manage-admins");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update admin");
    }
  };

  return (
    <>

      <main className={`admin-panel-header-div ${isMobile ? 'mobile-view' : ''} ${isTablet ? 'tablet-view' : ''}`}>

        <div className="admin-dashboard-main-header" style={{ marginBottom: "24px" }}>
          <div>
            <h5>Edit Admin</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">Dashboard</Link>
              <IoMdArrowDropright />
              <Link to="/admin/manage-admins" className="breadcrumb-link active">Admin List</Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Edit Admin</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink to="/admin/manage-admins" className="cancel-btn dashboard-add-product-btn">
              <HiXMark /> Cancel
            </NavLink>

            <button onClick={handleSubmit} className="primary-btn dashboard-add-product-btn">
              <MdSave /> Save Changes
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
                    <input 
                      name="name" 
                      type="text" 
                      value={form.name || ""} 
                      onChange={handleChange}
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label>Email</label>
                    <input 
                      name="email" 
                      type="email" 
                      value={form.email || ""} 
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label>Phone Number</label>
                    <input 
                      name="number" 
                      type="text" 
                      value={form.number || ""} 
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label>Alt Phone Number</label>
                    <input 
                      name="alt_number" 
                      type="text" 
                      value={form.alt_number || ""} 
                      onChange={handleChange}
                      placeholder="Enter alternate number"
                    />
                  </div>

                  <div>
                    <label>Status</label>
                    <select name="status" value={form.status || "active"} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="block">Blocked</option>
                    </select>
                  </div>

                  <div>
                    <label>Change Password (Optional)</label>
                    <input 
                      name="password" 
                      type="password" 
                      placeholder="Leave blank to keep current" 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="dashboard-add-content-right-side">
            <div className="dashboard-add-content-card">
              <h6>Profile Image</h6>
              <div className="add-product-form-container">
                <div className="profile-image-container">
                  <img
                    src={imgPreview || (form.img ? `/uploads/${form.img}` : "/uploads/default.png")}
                    alt="profile"
                    className="profile-image-preview"
                  />

                  <label htmlFor="profileImg" style={{ marginBottom: "8px" }}>Upload New Image</label>
                  <input 
                    type="file" 
                    id="profileImg" 
                    name="img" 
                    onChange={handleImg}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </>
  );
};

export default EditAdmin;
