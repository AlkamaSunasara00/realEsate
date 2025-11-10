import React, { useEffect, useState } from "react";
import Navbar from "../layout/Navbar";
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
  const [imgPreview, setImgPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/admin/getUserById/${id}`);
        setForm((p) => ({ ...p, ...(res?.data || {}) }));
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleImg = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const isValid = () => form.name.trim() && form.email.trim();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid()) return alert("Please fill required fields");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => {
        if (form[k] !== undefined) fd.append(k, form[k]);
      });

      const fileInput = document.getElementById("profileImg");
      if (fileInput && fileInput.files && fileInput.files[0]) {
        fd.append("img", fileInput.files[0]);
      }

      await api.put(`/admin/update-client/${id}`, fd);
      alert("Admin updated!");
      navigate("/admin/manage-admins");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to update admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
        {/* top buttons */}
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

        {/* title row below */}
        <div className="form-header-title">
          <h5>Edit Admin</h5>
        </div>

        <form onSubmit={handleSubmit} className="form-content-grid" encType="multipart/form-data" autoComplete="off">
          <div className="form-left">
            <div className="form-card add-form-card">
              <h6>General Information</h6>

              <div className="form-grid" style={{ marginTop: 8 }}>
                <div className="form-field">
                  <label>Name</label>
                  <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Enter name" />
                </div>

                <div className="form-field">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email || ""} onChange={handleChange} placeholder="Enter email" />
                </div>

                <div className="form-field">
                  <label>Phone Number</label>
                  <input name="number" value={form.number || ""} onChange={handleChange} placeholder="Enter phone number" />
                </div>

                <div className="form-field">
                  <label>Alt Phone Number</label>
                  <input name="alt_number" value={form.alt_number || ""} onChange={handleChange} placeholder="Alternate number" />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={form.status || "active"} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="block">Blocked</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Change Password (optional)</label>
                  <input name="password" type="password" onChange={handleChange} placeholder="Leave blank to keep current" />
                </div>
              </div>
            </div>
          </div>

          <div className="form-right">
            <div className="preview-card">
              <h6>Profile Image</h6>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img
                  src={imgPreview || (form.img ? `/uploads/${form.img}` : "/uploads/default.png")}
                  alt="profile"
                  className="preview-img"
                />
                <label htmlFor="profileImg" style={{ marginTop: 12 }}>Upload New Image</label>
                <input id="profileImg" type="file" name="img" accept="image/*" onChange={handleImg} />
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
};

export default EditAdmin;
