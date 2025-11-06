import React, { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const AddProperty = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    status: "available",
    image: null,
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

  // handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!form.title || !form.price || !form.address) {
        alert("Please fill in all required fields");
        return;
      }

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("address", form.address);
      fd.append("price", form.price);
      fd.append("status", form.status);
      if (form.image) fd.append("image", form.image);

      await axios.post("http://localhost:4500/addproperty", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Property added successfully ✅");
      navigate("/admin/property");
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add property ❌");
    }
  };

  return (
    <>
      <Navbar />

      <main className={`admin-panel-header-div ${isMobile ? 'mobile-view' : ''} ${isTablet ? 'tablet-view' : ''}`}>
        {/* ===== HEADER + BREADCRUMB ===== */}
        <div className="admin-dashboard-main-header" style={{ marginBottom: "24px" }}>
          <div>
            <h5>Add Property</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">
                Dashboard
              </Link>
              <IoMdArrowDropright />
              <Link to="/admin/property" className="breadcrumb-link active">
                Property List
              </Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Add Property</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink
              to="/admin/property"
              className="cancel-btn dashboard-add-product-btn"
            >
              <HiXMark /> Cancel
            </NavLink>

            <button
              onClick={handleSubmit}
              className="primary-btn dashboard-add-product-btn"
            >
              <MdSave /> Save Property
            </button>
          </div>
        </div>

        {/* ===== FORM SECTION ===== */}
        <div className="dashboard-add-content-card-div">
          {/* ===== LEFT SIDE (Form fields) ===== */}
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>Property Details</h6>

              <div className="add-product-form-container">
                <div className="coupon-code-input-profile">
                  <div>
                    <label>Title <span style={{color: 'red'}}>*</span></label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter property title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Price (₹) <span style={{color: 'red'}}>*</span></label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label>Address <span style={{color: 'red'}}>*</span></label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter full address"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Write about this property..."
                      rows={4}
                      value={form.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div>
                    <label>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label>Upload Image</label>
                    <input 
                      type="file" 
                      name="image" 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right side card for image preview */}
          <div className="dashboard-add-content-right-side">
            {form.image && (
              <div className="dashboard-add-content-card">
                <h6>Image Preview</h6>
                <div className="add-product-form-container">
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginTop: "8px",
                      objectFit: "cover",
                      maxHeight: "300px"
                    }}
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

export default AddProperty;