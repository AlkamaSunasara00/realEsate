// client/src/pages/admin/properties/UpdateProperty.jsx
import React, { useEffect, useState } from "react";
import { MdSave } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axiosInstance";

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
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (imgPreview && !initial.image) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview, initial.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please upload an image");
    setForm(prev => ({ ...prev, image: file }));
    if (imgPreview && !initial.image) URL.revokeObjectURL(imgPreview);
    setImgPreview(URL.createObjectURL(file));
  };

  const isValid = () => form.id && form.title.trim() && form.price && form.address.trim();

  const handleUpdate = async () => {
    if (!isValid()) return alert("Please fill all required fields");
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) fd.append(key, value);
    });

    try {
      await api.put(`/updateproperty/${form.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Property updated successfully!");
      navigate("/admin/property");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update property");
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
      <div className="form-header-top" style={{ marginTop: 4 }}>
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

      {/* Title */}
      <div className="form-header-title">
        <h5>Edit Property</h5>
      </div>

      {/* Form Grid */}
      <div className="form-content-grid">
        <div className="form-left">
          <div className="form-card">
            <h6>Property Information</h6>

            <div className="form-grid">
              <div className="form-field">
                <label>Title <span className="required">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Enter title" />
              </div>
              <div className="form-field">
                <label>Price (₹) <span className="required">*</span></label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Enter price" />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field full-width">
                <label>Address <span className="required">*</span></label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Full address" />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the property..."
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="form-field">
                <label>Change Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handleFile} />
                <small className="subtle-note">Current image stays if not changed.</small>
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW CARD – MOVED TO BOTTOM */}
        <div className="form-right preview-bottom">
          <div className="preview-card">
            <h6>Current Image</h6>
            {imgPreview ? (
              <img src={imgPreview} alt="Property preview" className="preview-img" />
            ) : (
              <div className="no-image-placeholder">No image</div>
            )}
            <div className="preview-meta">
              <div><strong>Title:</strong> {form.title || "—"}</div>
              <div><strong>Price:</strong> {form.price ? `₹${form.price}` : "—"}</div>
              <div><strong>Address:</strong> {form.address || "—"}</div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${form.status}`}>{form.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UpdateProperty;