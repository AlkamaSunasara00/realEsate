// client/src/pages/admin/properties/PropertyDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { IoChevronBackOutline, IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [property, setProperty] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth <= 1024 && window.innerWidth > 768;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile || tablet) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (property) return;
    const fetch = async () => {
      if (!id) return setError("No property ID");
      setLoading(true);
      try {
        const res = await api.get(`http://localhost:4500/getproperty/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch property:", err);
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, property]);

  const handleDelete = async () => {
    if (!property?.id) return;
    if (!window.confirm("Delete this property permanently?")) return;
    try {
      await api.delete(`http://localhost:4500/deleteproperty/${property.id}`);
      alert("Property deleted");
      navigate("/admin/property");
    } catch (e) {
      alert("Failed to delete");
   
    }
  };

  const handleEdit = () => {
    navigate("/admin/updateproperty", { state: { item: property } });
  };

  if (loading) {
    return (
      <>
        <Sidebar isMobile={isMobile} isTablet={isTablet} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Navbar isMobile={isMobile} isTablet={isTablet} toggleSidebar={toggleSidebar} />
        <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
          <div className="loading-center">Loading property...</div>
        </main>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Sidebar isMobile={isMobile} isTablet={isTablet} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Navbar isMobile={isMobile} isTablet={isTablet} toggleSidebar={toggleSidebar} />
        <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
          <div className="error-center">
            <h3>{error || "Property not found"}</h3>
            <button className="primary-btn" onClick={() => navigate("/admin/property")}>
              Back to List
            </button>
          </div>
        </main>
      </>
    );
  }

  const p = property;

  return (
    <>

      <main className={`admin-panel-header-div ${isMobile ? "mobile-view" : ""} ${isTablet ? "tablet-view" : ""}`}>
        {/* === HEADER: Back + Actions on Line 1, Title on Line 2 === */}
        <div className="form-header-top">
          <div className="header-top-left">
            <button className="header-back-btn" onClick={() => navigate(-1)}>
              <IoChevronBackOutline /> Back
            </button>
          </div>
          <div className="header-top-right">
            <button className="btn ghost" onClick={handleEdit}>
              <IoPencil /> Edit
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              <MdDeleteForever /> Delete
            </button>
          </div>
        </div>

        <div className="form-header-title">
          <h5>{p.title || "Untitled"}</h5>
        </div>

        {/* === CONTENT GRID === */}
        <div className="form-content-grid">
          {/* Left: Info */}
          <div className="form-left">
            <div className="info-card">
              <div className="price-status">
                <div className="price">₹{p.price ?? "—"}</div>
                <span className={`status-badge ${p.status || "unknown"}`}>
                  {p.status || "—"}
                </span>
              </div>

              <div className="address">{p.address || "—"}</div>

              <div className="meta-grid">
                <div>
                  <strong>Added</strong>
                  <div>{p.createdat?.slice(0, 10) || "—"}</div>
                </div>
                <div>
                  <strong>Area</strong>
                  <div>{p.area || "—"} sqft</div>
                </div>
              </div>

              <section className="section">
                <h3>Description</h3>
                <p>{p.description || "No description provided."}</p>
              </section>

              {p.features && (
                <section className="section">
                  <h3>Features</h3>
                  <div className="pd-features">
                    {p.features.split(",").map((f, i) => (
                      <span key={i} className="pd-feature-pill">{f.trim()}</span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Right: Image */}
          <div className="form-right">
            <div className="image-card">
              {p.image ? (
                <img src={`/uploads/${p.image}`} alt={p.title} />
              ) : (
                <div className="no-image">No image</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PropertyDetails;