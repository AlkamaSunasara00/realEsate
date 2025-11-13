// client/src/pages/admin/ManageAdmin.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import api from "../../../api/axiosInstance";
import { NavLink, useNavigate } from "react-router-dom";

import "../../../assets/css/admin-card.css";
import { FaRegEye } from "react-icons/fa";
import DeleteConfirmModal from "../../../components/modals/DeleteConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageAdmin = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [admins, setAdmins] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // modal states
  const [selectedAdmin, setSelectedAdmin] = useState(null); // for detail modal
  const [selectedToDelete, setSelectedToDelete] = useState(null); // admin to delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/admin/clients");
        setAdmins(res.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load admins");
      }
    };
    fetchClients();
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter based on tab
  const filtered = admins.filter((a) =>
    activeTab === "All"
      ? a.trash === "0"
      : activeTab === "Trash"
      ? a.trash === "1"
      : true
  );

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  // open delete modal
  const openDeleteModal = (admin) => {
    setSelectedToDelete(admin);
    setDeleteModalOpen(true);
  };

  // Confirm delete -> trash user
 const handleConfirmDelete = async () => {
  if (!selectedToDelete) {
    toast.error("No admin selected");
    setDeleteModalOpen(false);
    return;
  }

  setIsDeleting(true);

  try {
    await api.put(`/admin/trash-client/${selectedToDelete.id}`, {
      trash: "1",
    });

    // 🔥 Update local state instead of removing
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === selectedToDelete.id ? { ...a, trash: "1" } : a
      )
    );

    setDeleteModalOpen(false);
    if (selectedAdmin?.id === selectedToDelete.id)
      setSelectedAdmin(null);

    setSelectedToDelete(null);

    toast.success("Admin moved to trash 🗑️");
  } catch (err) {
    console.error(err);
    toast.error("Failed to trash admin ❌");
  } finally {
    setIsDeleting(false);
  }
};


  const openDetailModal = (admin) => {
    setSelectedAdmin(admin);
  };

  const closeDetailModal = () => setSelectedAdmin(null);

  return (
    <>
      <main
        className={`admin-panel-header-div ${
          isMobile ? "mobile-view" : ""
        } ${isTablet ? "tablet-view" : ""} ${
          isSidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <Breadcrumb
          title="Clients"
          breadcrumbText="Clients List"
          button={{ link: "/admin/add-new_admin", text: "Add New Client" }}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        <div className="admin-panel-header-tabs">
          <button
            className={`admin-panel-header-tab ${
              activeTab === "All" ? "active" : ""
            }`}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>

          <button
            className={`admin-panel-header-tab ${
              activeTab === "Trash" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Trash")}
          >
            Trash
          </button>
        </div>

        {/* Desktop Table */}
        {!isMobile && !isTablet && (
          <div className="dashboard-table-container">
            <table>
              <thead>
                <tr>
                  <th className="admin-name">Name</th>
                  <th className="admin-email">Email</th>
                  <th className="admin-phone">Phone No</th>
                  <th className="admin-status">Status</th>
                  <th className="admin-added">Added</th>
                  <th className="admin-actions">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <tr key={a.id}>
                      <td className="product-info admin-profile">
                        <img
                          src={`/uploads/${a.img}`}
                          alt={`${a.name} profile`}
                        />
                        <div className="admin-info-mobile">
                          <span>{a.name}</span>
                        </div>
                      </td>
                      <td className="admin-email">{a.email}</td>
                      <td className="admin-phone">{a.number}</td>
                      <td className="admin-status">
                        <span
                          className={`status ${
                            a.status === "active"
                              ? "published"
                              : "out-of-stock"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="admin-added">
                        {a.createdat?.slice(0, 10)}
                      </td>

                      <td className="actions admin-actions">
                        <FaRegEye
                          onClick={() =>
                            navigate(`/admin/view-admin/${a.id}`)
                          }
                          style={{ cursor: "pointer", marginRight: 8 }}
                        />

                        <IoPencil
                          onClick={() =>
                            navigate(`/admin/edit-admin/${a.id}`)
                          }
                          className="edit-btn"
                          title="Edit Client"
                          style={{ cursor: "pointer", marginRight: 8 }}
                        />

                        {/* FIXED → DELETE OPENS MODAL */}
                        <MdDeleteForever
                          onClick={() => openDeleteModal(a)}
                          className="delete-btn"
                          title="Delete Client"
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        opacity: 0.6,
                      }}
                    >
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile / Tablet Cards */}
        {(isMobile || isTablet) && (
          <div className="cardlist" style={{ marginTop: 16 }}>
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <article
                  key={a.id}
                  className="card-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/admin/client/${a.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      navigate(`/admin/client/${a.id}`);
                  }}
                >
                  <div className="card-left">
                    <img src={`/uploads/${a.img}`} alt={a.name} />
                  </div>

                  <div className="card-middle">
                    <div className="card-title">{a.name}</div>
                    <div className="card-sub">{a.email}</div>
                  </div>

                  <div className="card-right">
                    <div
                      className={`count-pill ${
                        a.status === "active"
                          ? "published"
                          : "out-of-stock"
                      }`}
                    >
                      {a.status}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">No admins found</div>
            )}
          </div>
        )}

        {/* Detail modal */}
        {selectedAdmin && (
          <div
            className="detail-modal-overlay"
            onClick={closeDetailModal}
          >
            <div
              className="detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="detail-modal-header">
                <div className="header-left">
                  <img
                    src={`/uploads/${selectedAdmin.img}`}
                    alt={selectedAdmin.name}
                  />
                  <div>
                    <h3>{selectedAdmin.name}</h3>
                    <p className="muted">{selectedAdmin.email}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="icon-btn"
                    onClick={() =>
                      navigate(`/admin/edit-admin/${selectedAdmin.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() =>
                      openDeleteModal(selectedAdmin)
                    }
                  >
                    Delete
                  </button>
                  <button
                    className="close-btn"
                    onClick={closeDetailModal}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="detail-modal-body">
                <div className="detail-row">
                  <strong>Phone:</strong> {selectedAdmin.number || "—"}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> {selectedAdmin.status}
                </div>
                <div className="detail-row">
                  <strong>Added:</strong>{" "}
                  {selectedAdmin.createdat?.slice(0, 10) || "—"}
                </div>
                <div className="detail-row">
                  <strong>About:</strong>
                  <div style={{ marginTop: 6 }}>
                    {selectedAdmin.about || "—"}
                  </div>
                </div>
              </div>

              <div className="detail-modal-footer">
                <button
                  className="primary-btn"
                  onClick={() =>
                    navigate(`/admin/edit-admin/${selectedAdmin.id}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="cancel-btn"
                  onClick={() =>
                    openDeleteModal(selectedAdmin)
                  }
                >
                  Delete
                </button>
                <button
                  className="info-btn"
                  onClick={() => setSelectedAdmin(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        selected={selectedToDelete}
      />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="colored"
      />
    </>
  );
};

export default ManageAdmin;
