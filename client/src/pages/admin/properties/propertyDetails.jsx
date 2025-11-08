import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import "../../../assets/css/admin/property-details.css";
import { IoChevronBackOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil } from "react-icons/io5";

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [property, setProperty] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);

  // responsive helpers
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024 && window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth < 1024 && window.innerWidth >= 768;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile || tablet) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (property) return;

    const fetchProperty = async () => {
      if (!id) {
        setError("No property selected");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:4500/getproperty/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch property:", err);
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!property?.id) return;
    const ok = window.confirm("Delete this property permanently?");
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:4500/deleteproperty/${property.id}`);
      alert("Property deleted");
      navigate(-1);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete property");
    }
  };

  const handleEdit = () => {
    if (!property) return;
    navigate("/admin/updateproperty", { state: { item: property } });
  };

  if (loading) {
    return (
      <>
        <Sidebar isMobile={isMobile} isTablet={isTablet} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Navbar isMobile={isMobile} isTablet={isTablet} toggleSidebar={toggleSidebar} />

        <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
          <div className="pd-center">Loading property…</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar isMobile={isMobile} isTablet={isTablet} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Navbar isMobile={isMobile} isTablet={isTablet} toggleSidebar={toggleSidebar} />

        <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
          <div className="pd-center">{error}</div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button className="btn ghost" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </main>
      </>
    );
  }

  const p = property || {};

  return (
    <>
      <Sidebar isMobile={isMobile} isTablet={isTablet} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar isMobile={isMobile} isTablet={isTablet} toggleSidebar={toggleSidebar} />

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
        {/* Top controls - Back + Actions row, then title block */}
        <div className="pd-header-grid">
          <div className="pd-header-left">
            <button className="back-btn" onClick={() => navigate(-1)} title="Back to list" aria-label="Back">
              <IoChevronBackOutline /> Back
            </button>
          </div>

          <div className="pd-header-right">
            <div className="pd-actions-inline">
              <button className="btn ghost" onClick={handleEdit} title="Edit property">
                <IoPencil /> Edit
              </button>
              <button className="btn-danger" onClick={handleDelete} title="Delete property">
                <MdDeleteForever /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="pd-title-row">
          <h1 className="pd-title">{p.title || "Untitled property"}</h1>
          <div className="pd-subline">
            <span className="pd-address">{p.address || "Address not provided"}</span>
            <span className={`pd-status-chip ${p.status || "unknown"}`}>{p.status || "—"}</span>
          </div>
        </div>

        <div className="pd-content">
          <section className="pd-main">
            <div className="pd-image-wrap">
              {p.image ? (
                <img src={`/uploads/${p.image}`} alt={p.title} />
              ) : (
                <div className="no-img">No image</div>
              )}
            </div>

            <div className="pd-price-row">
              <div className="pd-price">₹{p.price ?? "—"}</div>
              <div className="pd-small-meta">
                <div>
                  <small className="meta-label">Added</small>
                  <div className="meta-value">{p.createdat ? p.createdat.slice(0, 10) : "—"}</div>
                </div>
                <div>
                  <small className="meta-label">Area</small>
                  <div className="meta-value">{p.area || "—"}</div>
                </div>
              </div>
            </div>

            <section className="pd-desc">
              <h3>Description</h3>
              <p>{p.description || "No description provided."}</p>
            </section>

            {p.features && (
              <section className="pd-features">
                <h3>Features</h3>
                <div className="pd-feat-list">
                  {p.features.split(",").map((f, i) => (
                    <span key={i} className="feat-pill">
                      {f.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </section>

          {/* Right column: sticky actions + summary */}
          <aside className="pd-compact-actions">
            <div className="action-top">
              <div className="action-price">₹{p.price ?? "—"}</div>
              <div className={`pd-status ${p.status || "unknown"}`}>{p.status || "—"}</div>
            </div>

            <div className="action-group">
              <button className="btn primary full" onClick={handleEdit} title="Edit property">
                <IoPencil /> Edit
              </button>
              <button className="btn-danger full" onClick={handleDelete} title="Delete property">
                <MdDeleteForever /> Delete
              </button>
            </div>

            <div className="action-meta">
              <div>
                <small className="meta-label">Address</small>
                <div className="meta-value">{p.address || "—"}</div>
              </div>
              <div>
                <small className="meta-label">Added</small>
                <div className="meta-value">{p.createdat ? p.createdat.slice(0, 10) : "—"}</div>
              </div>
              <div>
                <small className="meta-label">Status</small>
                <div className="meta-value">{p.status || "—"}</div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sticky bottom actions */}
        <div className="pd-mobile-bottom-actions" role="toolbar" aria-label="Property actions">
          <button className="btn ghost" onClick={() => navigate(-1)} title="Back">
            <IoChevronBackOutline /> Back
          </button>
          <button className="btn primary" onClick={handleEdit} title="Edit">
            <IoPencil /> Edit
          </button>
          <button className="btn-danger" onClick={handleDelete} title="Delete">
            <MdDeleteForever /> Delete
          </button>
        </div>
      </main>
    </>
  );
};

export default PropertyDetails;
