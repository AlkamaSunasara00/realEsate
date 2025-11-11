// client/src/pages/admin/manage/ClientDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { IoTrashOutline, IoPencilOutline } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import "../../../assets/css/admin/client-details.css";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 768);
      setIsTablet(w <= 1024 && w > 768);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchClient = async () => {
    try {
      const res = await api.get(`/admin/getUserById/${id}`);
      setClient(res.data || {});
    } catch (err) {
      console.error("fetchClient", err);
    }
  };

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/clients/${id}`);
      alert("Client deleted.");
      navigate("/admin/manage-admins");
    } catch (err) {
      console.error("delete client", err);
      alert("Failed to delete client.");
    }
  };

  return (
    <>
      <Sidebar
        admin={{ name: "Admin" }}
        onLogout={() => { }}
        isMobile={isMobile}
        isTablet={isTablet}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(v => !v)}
      />
      <Navbar admin={{ name: "Admin" }} isMobile={isMobile} isTablet={isTablet} toggleSidebar={() => setIsSidebarOpen(v => !v)} />

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""} ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {/* Top row: Back (left) + Payment (right) */}
        <div className="form-header-top">
          <div className="header-top-left">
            <button className="header-back-btn" onClick={() => navigate(-1)}>
              {/* keep icon consistent with AddProperty */}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <IoPencilOutline style={{ display: "none" }} />
              </span>
              Back
            </button>
          </div>

          <div className="header-top-right">
            <button
              className="info-btn form-save-btn"
              onClick={() => navigate(`/admin/view-admin/${id}`)}
            >
              <MdPayments />View Payments
            </button>
          </div>
        </div>

        {/* Title row: Title centered (below top) + Edit/Delete on the right */}
        <div className="form-header-title header-with-actions">
          <div>
            <h5>Client Details</h5>
          </div>

          <div className="header-actions-right">
            <button
              className="primary-btn"
              onClick={() => navigate(`/admin/edit-admin/${id}`)}
            >
              <IoPencilOutline /> Edit
            </button>
            <button className="cancel-btn" onClick={handleDelete}>
              <IoTrashOutline /> Delete
            </button>
          </div>
        </div>

        <div className="form-content-grid">
          <div className="form-left">
            <div className="form-card">
              <h6>Profile</h6>
              <div className="profile-info">
                <img
                  src={client.img ? `/uploads/${client.img}` : "/uploads/default.png"}
                  alt={client.name}
                  className="profile-img"
                />
                <div className="profile-details">
                  <h3>{client.name || "—"}</h3>
                  <p><FaEnvelope /> {client.email || "—"}</p>
                  <p><FaPhone /> {client.number || "—"}</p>
                  <div className="profile-bio">{client.about || "No bio available."}</div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h6>Other Details</h6>
              <div className="details-grid">
                <div><strong>Status:</strong> <span>{client.status || "—"}</span></div>
                <div><strong>Added:</strong> <span>{(client.createdat || client.created_at || "").slice(0, 10) || "—"}</span></div>
                <div><strong>Alternate Phone:</strong> <span>{client.alt_number || "—"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ClientDetails;
