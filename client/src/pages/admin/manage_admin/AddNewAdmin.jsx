// client/src/pages/admin/manage/AddNewAdmin.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
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

  const [imgFile, setImgFile] = useState(null);
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
    return () => {
      window.removeEventListener("resize", handleResize);
      if (imgPreview) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // optional: basic image validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const isValid = () =>
    form.name.trim() && form.email.trim() && form.number.trim() && form.password.trim();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid()) return alert("Please fill required fields");
    setLoading(true);

    try {
      const fd = new FormData();
      // append simple fields
      Object.keys(form).forEach((k) => {
        if (form[k] !== undefined) fd.append(k, form[k]);
      });
      // append image with same key as EditAdmin uses ("img")
      if (imgFile) fd.append("img", imgFile);

      // use same endpoint pattern you use elsewhere
      await api.post("/admin/add-client", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Admin added!");
      navigate("/admin/manage-admins");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
        {/* top buttons row: Back (left) and Save (right) */}
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
              <MdSave /> {loading ? "Saving..." : "Save Admin"}
            </button>
          </div>
        </div>

        {/* title below the top buttons */}
        <div className="form-header-title">
          <h5>Add New Admin</h5>
        </div>

        <form onSubmit={handleSubmit} className="form-content-grid" encType="multipart/form-data" autoComplete="off">
          <div className="form-left">
            <div className="form-card add-form-card">
              <h6>General Information</h6>

              <div className="form-grid" style={{ marginTop: 8 }}>
                <div className="form-field">
                  <label>Name <span className="required">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" />
                </div>

                <div className="form-field">
                  <label>Email <span className="required">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
                </div>

                <div className="form-field">
                  <label>Phone Number <span className="required">*</span></label>
                  <input name="number" value={form.number} onChange={handleChange} placeholder="Enter phone number" />
                </div>

                <div className="form-field">
                  <label>Password <span className="required">*</span></label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Set login password" />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="block">Blocked</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Upload Profile Image</label>
                  <input type="file" accept="image/*" onChange={handleFile} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-right">
            <div className="preview-card">
              <h6>Profile Preview</h6>

              {imgPreview ? (
                <img src={imgPreview} alt="preview" className="preview-img" />
              ) : (
                <div className="no-image-placeholder">No image selected</div>
              )}

              <div className="preview-meta" style={{ marginTop: 8 }}>
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
        </form>
      </main>
    </>
  );
};

export default AddNewAdmin;
