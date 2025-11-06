import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import api from "../../../api/axiosInstance";
import { NavLink, useNavigate, useNavigationType } from "react-router-dom";

import "../../../assets/css/admin-card.css"
import { FaRegEye } from "react-icons/fa";

const ManageAdmin = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [admins, setAdmins] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null); // for modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/clients");
        setAdmins(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchClients();
  }, []);

  // responsive listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (!(width < 768) && !(width >= 768 && width < 1024)) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = admins.filter((a) =>
    activeTab === "All" ? true : activeTab === "Active" ? a.status === "active" : a.status === "block"
  );

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(`/clients/${id}`);
      setAdmins(prev => prev.filter(a => a.id !== id));
      // if modal open for same admin, close it
      if (selectedAdmin?.id === id) setSelectedAdmin(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete admin");
    }
  };
  const currentAdmin = { name: "Admin User", role: "admin" };

  return (
    <>
      <Sidebar
        admin={currentAdmin}
        onLogout={() => { console.log("Logging out..."); }}
        isMobile={isMobile}
        isTablet={isTablet}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <Navbar
        admin={currentAdmin}
        isMobile={isMobile}
        isTablet={isTablet}
        toggleSidebar={toggleSidebar}
      />

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""} ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Breadcrumb
          title="Admin"
          breadcrumbText="Admin List"
          button={{ link: "/admin/add-new_admin", text: "Add New Admin" }}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        <div className="admin-panel-header-tabs">
          <button className={`admin-panel-header-tab ${activeTab === "All" ? "active" : ""}`} onClick={() => setActiveTab("All")}>All</button>
          <button className={`admin-panel-header-tab ${activeTab === "Active" ? "active" : ""}`} onClick={() => setActiveTab("Active")}>Active</button>
          <button className={`admin-panel-header-tab ${activeTab === "Blocked" ? "active" : ""}`} onClick={() => setActiveTab("Blocked")}>Blocked</button>
        </div>

        {/* === Desktop / wide screens: keep your table === */}
        {!isMobile && (
          <div className={`dashboard-table-container ${isTablet ? "tablet-table" : ""}`}>
            <table>
              <thead>
                <tr>
                  <th className="admin-name">Name</th>
                  {!isMobile && <th className="admin-email">Email</th>}
                  {!isMobile && <th className="admin-phone">Phone No</th>}
                  <th className="admin-status">Status</th>
                  {!isMobile && <th className="admin-added">Added</th>}
                  <th className="admin-actions">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <tr key={a.id}>
                      <td className="product-info admin-profile">
                        <img src={`/uploads/${a.img}`} alt={`${a.name} profile`} />
                        <div className="admin-info-mobile">
                          <span>{a.name}</span>
                          {isMobile && <p>{a.email}</p>}
                        </div>
                      </td>
                      {!isMobile && <td className="admin-email">{a.email}</td>}
                      {!isMobile && <td className="admin-phone">{a.number}</td>}
                      <td className="admin-status">
                        <span className={`status ${a.status === "active" ? "published" : "out-of-stock"}`}>{a.status}</span>
                      </td>
                      {!isMobile && <td className="admin-added">{a.createdat?.slice(0, 10)}</td>}
                      <td className="actions admin-actions">
                        <FaRegEye onClick={() => navigate(`/admin/view-admin/${a.id}`)} />
                        <IoPencil onClick={() => navigate(`/admin/edit-admin/${a.id}`)} className="edit-btn" title="Edit admin" />
                        <MdDeleteForever onClick={() => handleDelete(a.id)} className="delete-btn" title="Delete admin" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* === Mobile: stacked cards like screenshot === */}
        {isMobile && (
          <div className="cardlist" style={{ marginTop: 16 }}>
            {filtered.length > 0 ? filtered.map(a => (
              <article
                key={a.id}
                className="card-row"
                onClick={() => setSelectedAdmin(a)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setSelectedAdmin(a); }}
              >
                <div className="card-left">
                  <img src={`/uploads/${a.img}`} alt={a.name} />
                </div>

                <div className="card-middle">
                  <div className="card-title">{a.name}</div>
                  <div className="card-sub">{a.email}</div>
                </div>

                <div className="card-right">
                  <div className={`count-pill ${a.status === "active" ? "published" : "out-of-stock"}`}>
                    {a.status}
                  </div>
                </div>
              </article>
            )) : (
              <div className="empty-state">No admins found</div>
            )}
          </div>
        )}

        {/* === Modal for selected admin === */}
        {selectedAdmin && (
          <div className="detail-modal-overlay" onClick={() => setSelectedAdmin(null)}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="detail-modal-header">
                <div className="header-left">
                  <img src={`/uploads/${selectedAdmin.img}`} alt={selectedAdmin.name} />
                  <div>
                    <h3>{selectedAdmin.name}</h3>
                    <p className="muted">{selectedAdmin.email}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="icon-btn" onClick={() => navigate(`/admin/edit-admin/${selectedAdmin.id}`)}>Edit</button>
                  <button className="icon-btn delete" onClick={() => handleDelete(selectedAdmin.id)}>Delete</button>
                  <button className="close-btn" onClick={() => setSelectedAdmin(null)}>Close</button>
                </div>
              </div>

              <div className="detail-modal-body">
                <div className="detail-row"><strong>Phone:</strong> {selectedAdmin.number || "—"}</div>
                <div className="detail-row"><strong>Status:</strong> {selectedAdmin.status}</div>
                <div className="detail-row"><strong>Added:</strong> {selectedAdmin.createdat?.slice(0, 10) || "—"}</div>
                <div className="detail-row"><strong>About:</strong> <div style={{ marginTop: 6 }}>{selectedAdmin.about || "—"}</div></div>
              </div>

              <div className="detail-modal-footer">
                <button className="primary-btn" onClick={() => navigate(`/admin/edit-admin/${selectedAdmin.id}`)}>Edit</button>
                <button className="cancel-btn" onClick={() => { handleDelete(selectedAdmin.id); }}>Delete</button>
                <button className="info-btn" onClick={() => setSelectedAdmin(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
};

export default ManageAdmin;
