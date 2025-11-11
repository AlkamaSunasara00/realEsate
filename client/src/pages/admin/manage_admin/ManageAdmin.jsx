// client/src/pages/admin/manage/EditAdmin.jsx
import React, { useEffect, useState } from "react";
import { MdSave } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
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
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (imgPreview) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  // FETCH ADMIN DATA
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/admin/get-client-by-id/${id}`); // CORRECT ENDPOINT
        const data = res.data;
        setForm({
          name: data.name || "",
          email: data.email || "",
          number: data.number || "",
          alt_number: data.alt_number || "",
          status: data.status || "active",
        });
        setImgPreview(data.img ? `/uploads/${data.img}` : null);
      } catch (err) {
        console.error("Failed to load admin:", err);
        alert("Could not load admin data");
      }
    };
    if (id) load();
  }, [id]);

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const isValid = () => form.name && form.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return alert("Name and Email are required");
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imgFile) fd.append("img", imgFile);

    try {
      await api.put(`/admin/update-client/${id}`, fd);
      alert("Admin updated!");
      navigate("/admin/manage-admins");
    } catch (err) {
      alert(err?.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
      {/* Top Buttons */}
      <div className="form-header-top" style={{ marginTop: 4 }}>
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
            <MdSave /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="form-header-title">
        <h5>Edit Admin</h5>
      </div>

      {/* PREVIEW CARD ON TOP */}
      <div className="preview-card preview-top">
        <h6>Profile Preview</h6>
        <div className="preview-content">
          {imgPreview ? (
            <img src={imgPreview} alt="preview" className="preview-img" />
          ) : (
            <div className="no-image-placeholder">No image</div>
          )}
          <div className="preview-meta">
            <div><strong>Name:</strong> {form.name || "—"}</div>
            <div><strong>Email:</strong> {form.email || "—"}</div>
            <div><strong>Phone:</strong> {form.number || "—"}</div>
            <div>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${form.status}`}>{form.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="form-content-grid" encType="multipart/form-data">
        <div className="form-left">
          <div className="form-card add-form-card">
            <h6>General Information</h6>
            <div className="form-grid" style={{ marginTop: 8 }}>
              <div className="form-field">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter name" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input name="number" value={form.number} onChange={handleChange} placeholder="Phone" />
              </div>
              <div className="form-field">
                <label>Alt Phone</label>
                <input name="alt_number" value={form.alt_number} onChange={handleChange} placeholder="Alternate" />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="block">Blocked</option>
                </select>
              </div>
              <div className="form-field">
                <label>Change Password (optional)</label>
                <input name="password" type="password" onChange={handleChange} placeholder="Leave blank to keep" />
              </div>
              <div className="form-field full-width">
                <label>Change Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImg} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default EditAdmin;