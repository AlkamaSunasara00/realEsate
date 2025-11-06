import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../../../assets/css/admin-card.css"; // make sure this file includes modal css from earlier

const GetProperties = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [properties, setProperties] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024 && window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null); // modal
  const navigate = useNavigate();

  // Fetch all properties
  const fetchProperties = async () => {
    try {
      const res = await axios.get("http://localhost:4500/getproperties");
      setProperties(res.data || []);
    } catch (err) {
      console.error("fetchProperties error", err);
      alert("Failed to fetch properties");
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("http://localhost:4500/getassignedproperties");
      setAssignments(res.data || []);
    } catch (err) {
      console.error("fetchAssignments error", err);
      // do not alert here, assignments are optional for UI overlay
    }
  };

  // unified refresh that fetches both lists
  const refreshAll = async () => {
    await Promise.all([fetchProperties(), fetchAssignments()]);
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // responsive listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth < 1024 && window.innerWidth >= 768;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (!mobile && !tablet) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Delete property
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await axios.delete(`http://localhost:4500/deleteproperty/${id}`);
      await fetchProperties();
      // close modal if same property deleted
      if (selectedProperty?.id === id) setSelectedProperty(null);
      alert("Property deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete property");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  // Filter by status
  const filtered = properties.filter((p) =>
    activeTab === "All"
      ? true
      : activeTab === "Available"
        ? p.status === "available"
        : activeTab === "Reserved"
          ? p.status === "reserved"
          : p.status === "sold"
  );

  return (
    <>
      <Sidebar
        isMobile={isMobile}
        isTablet={isTablet}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <Navbar isMobile={isMobile} isTablet={isTablet} toggleSidebar={toggleSidebar} />

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
        <Breadcrumb
          title="Properties"
          breadcrumbText="Property List"
          button={{ link: "/admin/addproperty", text: "Add New Property" }}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        <div className="admin-panel-header-tabs">
          {["All", "Available", "Reserved", "Sold"].map(tab => (
            <button
              key={tab}
              className={`admin-panel-header-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Desktop/tablet: keep table */}
        {!isMobile && (
          <div className={`dashboard-table-container ${isTablet ? "tablet-table" : ""}`}>
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  {!isMobile && <th>Description</th>}
                  {!isMobile && <th>Address</th>}
                  <th>Price</th>
                  <th>Status</th>
                  {!isMobile && <th>Added</th>}
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="product-info">
                        <img
                          src={`/uploads/${p.image}`}
                          alt={p.title}
                          style={{
                            width: isMobile ? "60px" : "80px",
                            height: isMobile ? "45px" : "60px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td>
                        <div className="property-title-mobile">
                          {p.title}
                          {isMobile && (
                            <p style={{ fontSize: "11px", color: "var(--light-gray-color)", marginTop: "4px" }}>
                              {p.address}
                            </p>
                          )}
                        </div>
                      </td>
                      {!isMobile && <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</td>}
                      {!isMobile && <td>{p.address}</td>}
                      <td style={{ fontWeight: "600", color: "var(--primary-btn-bg)" }}>₹{p.price}</td>
                      <td>
                        <span
                          className={`status ${p.status === "available"
                            ? "published"
                            : p.status === "reserved"
                              ? "low-stock"
                              : "out-of-stock"
                            }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      {!isMobile && <td>{p.createdat?.slice(0, 10) || "—"}</td>}
                      <td className="actions">
                        <IoPencil
                          onClick={() =>
                            navigate("/admin/updateproperty", { state: { item: p } })
                          }
                          className="edit-btn"
                          title="Edit property"
                        />
                        <MdDeleteForever
                          onClick={() => handleDelete(p.id)}
                          className="delete-btn"
                          title="Delete property"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile: stacked cards like admin */}
        {isMobile && (
          <div className="cardlist" style={{ marginTop: 16 }}>
            {filtered.length > 0 ? filtered.map(p => (
              <article
                key={p.id}
                className="card-row"
                onClick={() => setSelectedProperty(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setSelectedProperty(p); }}
              >
                <div className="card-left">
                  <img src={`/uploads/${p.image}`} alt={p.title} />
                </div>

                <div className="card-middle">
                  <div className="card-title">{p.title}</div>
                  <div className="card-sub">{p.address}</div>
                </div>

                <div className="card-right">
                  <div className={`count-pill ${p.status === "available" ? "published" : p.status === "reserved" ? "low-stock" : "out-of-stock"}`}>
                    ₹{p.price}
                  </div>
                </div>
              </article>
            )) : (
              <div className="empty-state">No properties found</div>
            )}
          </div>
        )}

        {/* Modal for selected property */}
        {selectedProperty && (
          <div className="detail-modal-overlay" onClick={() => setSelectedProperty(null)}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="detail-modal-header">
                <div className="detail-modal-title-wrap">
                  <div className="detail-modal-thumb">
                    <img src={`/uploads/${selectedProperty ? selectedProperty.image : selectedAdmin.img}`} alt={selectedProperty ? selectedProperty.title : selectedAdmin.name} />
                  </div>
                  <div>
                    <h3 className="detail-modal-title">{selectedProperty ? selectedProperty.title : selectedAdmin.name}</h3>
                    <div className="detail-modal-sub">{selectedProperty ? selectedProperty.address : (selectedAdmin.email || selectedAdmin.role)}</div>
                  </div>
                </div>
              </div>
              <div className="detail-modal-content">
                <div className="modal-image-area">
                  <img src={`/uploads/${selectedProperty.image}`} alt={selectedProperty.title} />
                </div>

                <div className="modal-info">
                  <div className="meta-row">
                    <div className="meta-label">Price</div>
                    <div className="meta-chip">₹{selectedProperty.price}</div>

                    <div className="meta-label">Status</div>
                    <div className="meta-chip">{selectedProperty.status}</div>
                  </div>

                  <div className="meta-row">
                    <div className="meta-label">Added</div>
                    <div className="key-val">{selectedProperty.createdat?.slice(0, 10) || "—"}</div>
                  </div>

                  <div className="modal-desc">
                    <strong>Description</strong>
                    <p style={{ marginTop: 8 }}>{selectedProperty.description || "—"}</p>

                    {selectedProperty.features && <>
                      <strong style={{ display: 'block', marginTop: 10 }}>Features</strong>
                      <p style={{ marginTop: 8 }}>{selectedProperty.features}</p>
                    </>}
                  </div>
                </div>
              </div>

              <div className="detail-modal-footer">
                <button className="btn ghost" onClick={() => setSelectedProperty(null)}>Close</button>
                <button className="btn danger" onClick={() => { handleDelete(selectedProperty.id); }}>Delete</button>
                <button className="btn primary" onClick={() => navigate("/admin/updateproperty", { state: { item: selectedProperty } })}>Edit Property</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
};

export default GetProperties;
