import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../../../assets/css/admin-card.css"; // keep your styles

const GetProperties = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [properties, setProperties] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024 && window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      // if you need assignments later, store them; currently not used
      // setAssignments(res.data || []);
    } catch (err) {
      console.error("fetchAssignments error", err);
    }
  };

  // unified refresh that fetches both lists
  const refreshAll = async () => {
    await Promise.all([fetchProperties(), fetchAssignments()]);
  };

  useEffect(() => {
    fetchProperties();
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
  const handleDelete = async (id, e) => {
    // stop propagation if called from row click
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await axios.delete(`http://localhost:4500/deleteproperty/${id}`);
      await fetchProperties();
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

  // navigate to details page (also pass state to avoid re-fetch)
  const openDetails = (p) => {
    if (!p) return;
    navigate(`/admin/property/${p.id}`, { state: { item: p } });
  };

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
          button={{ link: "/admin/addproperty", text: "Add" }}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* <div className="admin-panel-header-tabs">
          {["All", "Available", "Reserved", "Sold"].map(tab => (
            <button
              key={tab}
              className={`admin-panel-header-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div> */}

        {/* Desktop/tablet: table with clickable rows */}
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
                    <tr
                      key={p.id}
                      className="clickable-row"
                      onClick={() => openDetails(p)}
                      onKeyDown={(e) => { if (e.key === "Enter") openDetails(p); }}
                      tabIndex={0}
                      role="button"
                    >
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
                        {/* stopPropagation to prevent row navigation when clicking icons */}
                        <IoPencil
                          onClick={(e) => { e.stopPropagation(); navigate("/admin/updateproperty", { state: { item: p } }); }}
                          className="edit-btn"
                          title="Edit property"
                        />
                        <MdDeleteForever
                          onClick={(e) => handleDelete(p.id, e)}
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

        {/* Mobile & Tablet: stacked cards that navigate to details on click */}
        {(isMobile || isTablet) && (
          <div className="cardlist" style={{ marginTop: 16 }}>
            {filtered.length > 0 ? filtered.map(p => (
              <article
                key={p.id}
                className="card-row"
                onClick={() => openDetails(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") openDetails(p); }}
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
      </main>
    </>
  );
};

export default GetProperties;