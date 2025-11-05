import React, { useState } from "react";
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

  // handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // handle file input
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files[0] }));
  };

  // submit property
  const handleSubmit = async () => {
    try {
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

      alert("Property added successfully");
      navigate("/admin/property");
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add property ❌");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
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
            <NavLink to="/admin/property" className="cancel-btn dashboard-add-product-btn">
              <HiXMark /> Cancel
            </NavLink>

            <button onClick={handleSubmit} className="primary-btn dashboard-add-product-btn">
              <MdSave /> Save Property
            </button>
          </div>
        </div>

        {/* ===== FORM CARD ===== */}
        <div className="dashboard-add-content-card-div">
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>Property Information</h6>

              <div className="add-product-form-container">
                <div className="coupon-code-input-profile">
                  <div>
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Property title..."
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price..."
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div style={{ flex: 1 }}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Write about this property..."
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Full address..."
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label>Upload Image</label>
                    <input type="file" name="image" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right side card (optional for image preview or map) */}
          <div className="dashboard-add-content-right-side">
            {form.image && (
              <div className="dashboard-add-content-card">
                <h6>Preview</h6>
                <img
                  src={URL.createObjectURL(form.image)}
                  alt="Preview"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginTop: "8px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default AddProperty;
