// client/src/pages/admin/properties/GetProperties.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import "../../../assets/css/admin-card.css";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmModal from "../../../components/modals/DeleteConfirmModal";

const GetProperties = () => {
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const navigate = useNavigate();

  const fetchProperties = async () => {
    try {
      const res = await api.get("http://localhost:4500/getproperties");
      setProperties(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load properties");
    }
  };

  const fetchAssignments = async () => {
    try {
      await api.get("http://localhost:4500/getassignedproperties");
    } catch (err) {
      console.error("fetchAssignments error", err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchAssignments();
  }, []);

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // open modal instead of confirm()
  const openDeleteModal = (p, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    setSelectedProperty(p);
    setDeleteModalOpen(true);
  };

  // confirmDelete will be called by modal when code matches
  const confirmDelete = async () => {
    if (!selectedProperty) {
      toast.error("No property selected");
      setDeleteModalOpen(false);
      return;
    }
    try {
      await api.delete(`http://localhost:4500/deleteproperty/${selectedProperty.id}`);
      toast.success("Property deleted successfully");
      setDeleteModalOpen(false);
      setSelectedProperty(null);
      await fetchProperties();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete property");
    }
  };

  const openDetails = (p) => navigate(`/admin/property/${p.id}`, { state: { item: p } });

  const filtered = properties.filter(p =>
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
      <Breadcrumb
        title="Properties"
        breadcrumbText="Property List"
        button={{ link: "/admin/addproperty", text: "Add" }}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Desktop Table */}
      {(!isMobile && !isTablet) && (
        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Address</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(p => (
                <tr key={p.id} className="clickable-row" onClick={() => openDetails(p)}>
                  <td>
                    <img
                      src={`/uploads/${p.image}`}
                      alt={p.title}
                      style={{ width: 80, height: 60, borderRadius: 8, objectFit: "cover" }}
                    />
                  </td>
                  <td>{p.title}</td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.description}
                  </td>
                  <td>{p.address}</td>
                  <td style={{ fontWeight: 600, color: "var(--primary-btn-bg)" }}>₹{p.price}</td>
                  <td>
                    <span className={`status ${p.status === "available" ? "published" : p.status === "reserved" ? "low-stock" : "out-of-stock"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="actions">
                    <IoPencil
                      onClick={(e) => { e.stopPropagation(); navigate("/admin/updateproperty", { state: { item: p } }); }}
                      style={{ cursor: "pointer", fontSize: 20, color: "var(--primary-btn-bg)" }}
                      title="Edit"
                    />
                    <MdDeleteForever
                      onClick={(e) => openDeleteModal(p, e)}          // <-- FIXED: use openDeleteModal
                      style={{ cursor: "pointer", fontSize: 20, color: "var(--red-color)" }}
                      title="Delete"
                    />
                  </td>
                </tr>
              )) : (
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

      {/* Mobile / Tablet */}
      {(isMobile || isTablet) && (
        <div className="cardlist">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <article key={p.id} className="card-row" onClick={() => openDetails(p)}>
                <div className="card-left">
                  <img src={`/uploads/${p.image}`} alt={p.title} />
                </div>
                <div className="card-middle">
                  <div className="card-title">{p.title}</div>
                  <div className="card-sub">{p.address}</div>
                </div>
                <div className="card-right">
                  <div
                    className={`count-pill ${
                      p.status === "available"
                        ? "published"
                        : p.status === "reserved"
                        ? "low-stock"
                        : "out-of-stock"
                    }`}
                  >
                    ₹{p.price}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">No properties found</div>
          )}
        </div>
      )}

      {/* delete modal (random code confirmation) */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}       // <-- boolean flag (fixed)
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Toastify */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
    </>
  );
};

export default GetProperties;
