import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const UpdateProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    address: "",
    price: "",
    status: "available",
    image: null,
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
    if (location.state?.item) {
      setForm(location.state.item);
      if (location.state.item.image) {
        setImgPreview(`http://localhost:4500/uploads/${location.state.item.image}`);
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!form.id) return alert("No property selected to update");

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
      if (form.image instanceof File) fd.append("image", form.image);

      await axios.put(`http://localhost:4500/updateproperty/${form.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Property updated successfully ✅");
      navigate("/admin/property");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update property ❌");
    }
  };

  if (!form || !form.id) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <main className="admin-panel-header-div">
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h3>No property selected to update</h3>
            <button 
              onClick={() => navigate("/admin/property")}
              className="primary-btn"
              style={{ marginTop: '20px' }}
            >
              Go Back to Property List
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={`admin-panel-header-div ${isMobile ? 'mobile-view' : ''} ${isTablet ? 'tablet-view' : ''}`}>
        {/* ===== HEADER ===== */}
        <div className="admin-dashboard-main-header" style={{ marginBottom: "24px" }}>
          <div>
            <h5>Edit Property</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">
                Dashboard
              </Link>
              <IoMdArrowDropright />
              <Link to="/admin/property" className="breadcrumb-link active">
                Property List
              </Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Edit Property</span>
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
              onClick={handleUpdate}
              className="primary-btn dashboard-add-product-btn"
            >
              <MdSave /> Save Changes
            </button>
          </div>
        </div>

        {/* ===== FORM SECTION ===== */}
        <div className="dashboard-add-content-card-div">
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>Property Details</h6>

              <div className="add-product-form-container">
                <div className="coupon-code-input-profile">
                  <div>
                    <label>Title <span style={{color: 'red'}}>*</span></label>
                    <input
                      name="title"
                      type="text"
                      value={form.title || ""}
                      onChange={handleChange}
                      placeholder="Property title..."
                      required
                    />
                  </div>

                  <div>
                    <label>Price (₹) <span style={{color: 'red'}}>*</span></label>
                    <input
                      name="price"
                      type="number"
                      value={form.price || ""}
                      onChange={handleChange}
                      placeholder="Property price..."
                      required
                    />
                  </div>

                  <div>
                    <label>Address <span style={{color: 'red'}}>*</span></label>
                    <input
                      name="address"
                      type="text"
                      value={form.address || ""}
                      onChange={handleChange}
                      placeholder="Full address..."
                      required
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={form.description || ""}
                      onChange={handleChange}
                      placeholder="Describe the property..."
                    ></textarea>
                  </div>

                  <div>
                    <label>Status</label>
                    <select
                      name="status"
                      value={form.status || "available"}
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
                    <label>Change Image (Optional)</label>
                    <input
                      type="file"
                      name="image"
                      id="propertyImg"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT SIDE ===== */}
          <div className="dashboard-add-content-right-side">
            <div className="dashboard-add-content-card">
              <h6>Property Image</h6>

              <div className="add-product-form-container">
                {imgPreview ? (
                  <img
                    src={imgPreview}
                    alt="Property Preview"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      objectFit: "cover",
                      maxHeight: "300px"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "8px",
                    backgroundColor: "#f5f5f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b8e99",
                    marginBottom: "10px"
                  }}>
                    No image uploaded
                  </div>
                )}
                <p style={{ fontSize: "13px", color: "#8b8e99", marginTop: "8px" }}>
                  Upload a new image to replace the current one
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UpdateProperty;
