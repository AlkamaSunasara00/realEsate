// client/src/pages/admin/properties/UpdateProperty.jsx
import React, { useEffect, useState } from "react";
import { MdSave } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const UpdateProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.item || {};

  const [form, setForm] = useState({
    id: initial.id || "",
    title: initial.title || "",
    description: initial.description || "",
    address: initial.address || "",
    price: initial.price || "",
    status: initial.status || "available",
    image: null,
  });

  const [imgPreview, setImgPreview] = useState(initial.image ? `/uploads/${initial.image}` : null);
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
      setForm(prev => ({ ...prev, image: file }));
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const isValid = () => form.id && form.title.trim() && form.price && form.address.trim();

  const handleUpdate = async () => {
    if (!isValid()) return alert("Fill required fields");
    setLoading(true);
    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] !== null) fd.append(key, form[key]);
    });

    try {
      await axios.put(`http://localhost:4500/updateproperty/${form.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Updated successfully!");
      navigate("/admin/property");
    } catch (err) {
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (!form.id) {
    return (
      <main className="admin-panel-header-div">
        <div className="empty-state-center">
          <h3>No property selected</h3>
          <button className="primary-btn" onClick={() => navigate("/admin/property")}>
            Go Back
          </button>
        </div>
      </main>
    );
  }

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
            onClick={handleUpdate}
            disabled={!isValid() || loading}
          >
            <MdSave /> {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="form-header-title">
        <h5>Edit Property</h5>
        <p className="subtle-note">Update details and optionally change image.</p>
      </div>

      <div className="form-content-grid">
        <div className="form-left">
          <div className="form-card">
            <h6>Property Information</h6>
            <div className="form-grid">
              <div className="form-field">
                <label>Title <span className="required">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Price (₹) <span className="required">*</span></label>
                <input type="number" name="price" value={form.price} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Address <span className="required">*</span></label>
                <input name="address" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field full-width">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
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
              <label>Change Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFile} />
              <small className="subtle-note">Current image stays if not changed.</small>
            </div>
          </div>
        </div>

        <div className="form-right">
          <div className="preview-card">
            <h6>Current Image</h6>
            {imgPreview ? (
              <img src={imgPreview} alt="Preview" className="preview-img" />
            ) : (
              <div className="no-image-placeholder">No image</div>
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

export default UpdateProperty;