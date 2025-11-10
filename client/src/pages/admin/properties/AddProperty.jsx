// client/src/pages/admin/properties/AddProperty.jsx
import React, { useEffect, useState } from "react";
import { MdSave } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const AddProperty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", address: "", price: "", status: "available", image: null
  });
  const [imgPreview, setImgPreview] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
      setForm(prev => ({ ...prev, image: file }));
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const isValid = () => form.title.trim() && form.price && form.address.trim();

  const handleSubmit = async () => {
    if (!isValid()) return alert("Fill required fields");
    setLoading(true);
    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));

    try {
      await api.post("http://localhost:4500/addproperty", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Property added!");
      navigate("/admin/property");
    } catch (err) {
      alert("Failed to add");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
      {/* Header: Back + Save */}
      <div className="form-header-top">
        <div className="header-top-left">
          <button className="header-back-btn" onClick={() => navigate(-1)}>
            <IoChevronBackOutline /> Back
          </button>
        </div>
        <div className="header-top-right">
          <button
            className="primary-btn form-save-btn"
            onClick={handleSubmit}
            disabled={!isValid() || loading}
          >
            <MdSave /> {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="form-header-title">
        <h5>Add New Property</h5>
      </div>

      <div className="form-content-grid">
        <div className="form-left">
          <div className="form-card">
            <h6>Property Information</h6>
            <div className="form-grid">
              <div className="form-field">
                <label>Title <span className="required">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., 3 BHK in Andheri" />
              </div>
              <div className="form-field">
                <label>Price (₹) <span className="required">*</span></label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="15000000" />
              </div>
              <div className="form-field">
                <label>Address <span className="required">*</span></label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123, Palm Street, Mumbai" />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field full-width">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe the property..." />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleFile} />
            </div>
          </div>
        </div>

        <div className="form-right">
          <div className="preview-card">
            <h6>Image Preview</h6>
            {imgPreview ? (
              <img src={imgPreview} alt="Preview" className="preview-img" />
            ) : (
              <div className="no-image-placeholder">No image selected</div>
            )}
            <div className="preview-meta">
              <div><strong>Title:</strong> {form.title || "—"}</div>
              <div><strong>Price:</strong> {form.price ? `₹${form.price}` : "—"}</div>
              <div><strong>Status:</strong> <span className={`status-badge ${form.status}`}>{form.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddProperty;