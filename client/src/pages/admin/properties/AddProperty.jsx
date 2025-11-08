import React, { useEffect, useState } from "react";
import { MdSave } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
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

  const [imgPreview, setImgPreview] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
      setForm((prev) => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setImgPreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  const isValid = () => {
    return form.title.trim() && form.price && form.address.trim();
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      alert("Please fill in all required fields");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("address", form.address);
    fd.append("price", form.price);
    fd.append("status", form.status);
    if (form.image) fd.append("image", form.image);

    try {
      await axios.post("http://localhost:4500/addproperty", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Property added successfully!");
      navigate("/admin/property");
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
      {/* Top controls: Back + Save (side by side). Title below on left */}
      <div className="form-header-top">
        <div className="header-top-left">
          <button
            className="header-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            title="Back"
          >
            <IoChevronBackOutline /> Back
          </button>
        </div>

        <div className="header-top-right">
          <button
            className="primary-btn form-save-btn"
            onClick={handleSubmit}
            disabled={!isValid() || loading}
            aria-disabled={!isValid() || loading}
            title={isValid() ? "Save" : "Fill required fields to save"}
          >
            <MdSave /> {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="form-header-title">
        <h5>Add New Property</h5>
        <p className="subtle-note">Fill the required fields (Title, Price, Address) before saving.</p>
      </div>

      <div className="form-content-grid">
        {/* Left: Form */}
        <div className="form-left">
          <div className="form-card add-form-card">
            <h6>Property Information</h6>

            <div className="form-grid">
              <div className="form-field">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., 3 BHK in Andheri"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Price (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g., 15000000"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Full Address <span className="required">*</span></label>
                <input
                  type="text"
                  name="address"
                  placeholder="123, Palm Street, Mumbai"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the property in detail..."
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                />
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
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <small className="subtle-note">Max recommended size 5MB.</small>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="form-right">
          <div className="preview-card">
            <h6>Image Preview</h6>
            {imgPreview ? (
              <img src={imgPreview} alt="Preview" className="preview-img" />
            ) : (
              <div className="no-image-placeholder">
                <span>No image selected</span>
              </div>
            )}

            <div className="preview-meta">
              <div><strong>Title:</strong> {form.title || "—"}</div>
              <div><strong>Price:</strong> {form.price ? `₹ ${form.price}` : "—"}</div>
              <div><strong>Status:</strong> <span className={`status-badge ${form.status}`}>{form.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddProperty;
