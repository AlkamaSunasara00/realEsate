// src/pages/admin/ViewAdmin.jsx
import React, { useState, useRef, useEffect } from "react";
import "../../../assets/css/admin/viewAdmin.css";
import SignaturePad from "react-signature-canvas";
import {
  FaEnvelope,
  FaPhone,
  FaChevronDown,
  FaChevronUp,
  FaFileDownload,
  FaTrashAlt,
} from "react-icons/fa";
import api from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmModal from "../../../components/modals/DeleteConfirmModal";

function ViewAdmin() {
  const { id } = useParams();
  const admin_id = localStorage.getItem("admin_id");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user_role = user.role || "";
  const navigate = useNavigate();

  // helper – current datetime-local string
  const nowLocal = () => new Date().toISOString().slice(0, 16);

  /* ──────────────────────── STATE ──────────────────────── */
  const [openProperty, setOpenProperty] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showRejectComment, setShowRejectComment] = useState(false);

  const [clientInfo, setClientInfo] = useState({});
  const [propertId, setPropertId] = useState([]);
  const [propertiesDetail, setPropertiesDetail] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clientPayments, setClientPayments] = useState([]);
  const [confirmationPayments, setConfirmationPayments] = useState({}); // ← restored

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [assignedForm, setAssignedForm] = useState({
    property_id: "",
    client_id: id,
    assigned_by: admin_id || "",
    amount: "",
    details: "",
    assigned_at: "",
  });
  const [assignedError, setAssignedError] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    property_id: "",
    client_id: "",
    amount: "",
    details: "",
    payment_method: "",
    paid_at: "",
    created_by: admin_id,
  });
  const [paymentError, setPaymentError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [markConfirmedAt, setMarkConfirmedAt] = useState(nowLocal());
  const [rejectReason, setRejectReason] = useState("");
  const [markError, setMarkError] = useState("");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetPaymentId, setDeleteTargetPaymentId] = useState(null);

  const sigCanvas = useRef(null);
  const API_ROOT = "http://localhost:4500";

  /* ──────────────────────── FETCHERS ──────────────────────── */
  const fetchClientInfo = async () => {
    try {
      const { data } = await api.get(`/admin/getUserById/${id}`);
      setClientInfo(data);
    } catch (err) {
      console.error("fetchClientInfo", err);
    }
  };

  const fetchClientAssignProperties = async () => {
    try {
      const { data } = await api.get(`${API_ROOT}/getAssignedPropertyByClientId/${id}`);
      setPropertId(data || []);
    } catch (err) {
      console.error("fetchClientAssignProperties", err);
    }
  };

  const assignProperties = async () => {
    try {
      const { data } = await api.get(`${API_ROOT}/getproperties`);
      setProperties(
        (data || []).filter((p) => p.status?.toLowerCase() === "available")
      );
    } catch (err) {
      console.error("assignProperties", err);
    }
  };

  const getClientPayments = async () => {
    try {
      const { data } = await api.get(`${API_ROOT}/getPaymentsByClientId/${id}`);
      setClientPayments(data || []);
    } catch (err) {
      console.error("getClientPayments", err);
    }
  };

  const fetchConfirmationByPaymentId = async (paymentId) => {
    try {
      const { data } = await api.get(`${API_ROOT}/getConfirmationByPaymentId/${paymentId}`);
      setConfirmationPayments((prev) => ({ ...prev, [paymentId]: data[0] }));
    } catch (err) {
      console.error("fetchConfirmationByPaymentId", err);
    }
  };

  useEffect(() => {
    fetchClientInfo();
    fetchClientAssignProperties();
    assignProperties();
    getClientPayments();
  }, [id]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!propertId.length) {
        setPropertiesDetail([]);
        return;
      }
      const responses = await Promise.all(
        propertId.map((p) => api.get(`${API_ROOT}/getproperties/${p.property_id}`))
      );
      setPropertiesDetail(responses.map((r) => r.data));
    };
    fetchDetails();
  }, [propertId]);

  /* ──────────────────────── HANDLERS ──────────────────────── */
  const handleAssignProperty = (e) =>
    setAssignedForm({ ...assignedForm, [e.target.name]: e.target.value });

  const handleAssignPropertySubmit = async (e) => {
    e.preventDefault();
    if (!assignedForm.property_id) {
      setAssignedError("Select a property");
      return;
    }

    try {
      await api.post(`${API_ROOT}/addassignedproperty`, {
        property_id: Number(assignedForm.property_id),
        client_id: Number(id),
        assigned_by: Number(admin_id),
        amount: assignedForm.amount || null,
        details: assignedForm.details || null,
        assigned_at: assignedForm.assigned_at || new Date().toISOString(),
      });
      toast.success("Property assigned");
      await fetchClientAssignProperties();
      await assignProperties();
      setShowSaleModal(false);
      setAssignedForm({
        property_id: "",
        client_id: id,
        assigned_by: admin_id,
        amount: "",
        details: "",
        assigned_at: "",
      });
    } catch {
      setAssignedError("Failed to assign");
    }
  };

  const handlePayment = (e) =>
    setPaymentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenAddPayment = (property) => {
    setIsEditing(false);
    setEditingPayment(null);
    setSelectedProperty(property);
    setPaymentForm({
      property_id: property.id,
      client_id: id,
      amount: "",
      details: "",
      payment_method: "",
      paid_at: nowLocal(),
      created_by: admin_id,
    });
    setShowPaymentModal(true);
  };

  const handleEditPayment = (e, pay) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingPayment(pay);
    setSelectedProperty(propertiesDetail.find((p) => p.id === pay.property_id));
    setPaymentForm({
      property_id: pay.property_id,
      client_id: pay.client_id || id,
      amount: pay.amount,
      payment_method: pay.payment_method,
      paid_at: pay.paid_at
        ? pay.paid_at.replace(" ", "T").slice(0, 16)
        : nowLocal(),
      details: pay.notes || "",
    });
    setShowPaymentModal(true);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.property_id || !paymentForm.amount) {
      setPaymentError("Fill required fields");
      return;
    }

    try {
      await api.post(`${API_ROOT}/addpayment`, {
        property_id: Number(paymentForm.property_id),
        client_id: Number(id),
        amount: Number(paymentForm.amount) || null,
        payment_method: paymentForm.payment_method || "cash",
        paid_at: paymentForm.paid_at
          ? new Date(paymentForm.paid_at).toISOString()
          : new Date().toISOString(),
        notes: paymentForm.details || null,
        status: "pending",
        created_by: admin_id,
      });
      toast.success("Payment added");
      await getClientPayments();
      closePaymentModal();
    } catch {
      setPaymentError("Failed to add");
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      await api.put(`${API_ROOT}/updatepayment/${editingPayment.id}`, {
        property_id: Number(paymentForm.property_id),
        client_id: Number(paymentForm.client_id),
        amount: Number(paymentForm.amount) || null,
        payment_method: paymentForm.payment_method || null,
        status: editingPayment.status || "pending",
        notes: paymentForm.details || null,
        paid_at: paymentForm.paid_at
          ? paymentForm.paid_at.replace("T", " ")
          : null,
      });
      toast.success("Payment updated");
      await getClientPayments();
      closePaymentModal();
    } catch {
      toast.error("Update failed");
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setIsEditing(false);
    setEditingPayment(null);
    setPaymentError("");
    setPaymentForm({
      property_id: "",
      client_id: id,
      amount: "",
      details: "",
      payment_method: "cash",
      paid_at: nowLocal(),
    });
  };

  const toggleProperty = (pid) => setOpenProperty((prev) => (prev === pid ? null : pid));

  const openMarkPaidForPayment = (e, payment) => {
    e.stopPropagation();
    setSelectedPayment(payment);
    setSelectedProperty(
      propertiesDetail.find((p) => p.id === payment.property_id) || null
    );
    setMarkConfirmedAt(nowLocal());
    setRejectReason("");
    setShowRejectComment(false);
    setMarkError("");
    setShowMarkPaidModal(true);
  };

  const getSignatureBlob = async () => {
    if (!sigCanvas.current?.getTrimmedCanvas) return null;
    const canvas = sigCanvas.current.getTrimmedCanvas();
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleConfirmAndMarkPaid = async () => {
    setMarkError("");
    if (!selectedPayment || sigCanvas.current?.isEmpty()) {
      setMarkError("Signature required");
      return;
    }

    try {
      const blob = await getSignatureBlob();
      const fd = new FormData();
      fd.append("payment_id", selectedPayment.id);
      fd.append("sent_by", id);
      fd.append("confirmed_by", admin_id);
      fd.append("status", "confirmed");
      fd.append("confirmed_at", markConfirmedAt.replace("T", " "));
      fd.append("reject_reason", "");
      fd.append("signature", blob, `sig_${Date.now()}.png`);

      await api.post(`${API_ROOT}/addpaymentconfirmation`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.put(`${API_ROOT}/updatepayment/${selectedPayment.id}`, {
        status: "completed",
        paid_at: markConfirmedAt.replace("T", " "),
      });

      toast.success("Payment confirmed");
      setShowMarkPaidModal(false);
      sigCanvas.current.clear();
      setSelectedPayment(null);
      await getClientPayments();
    } catch {
      setMarkError("Confirmation failed");
    }
  };

  const handleSubmitRejection = async () => {
    setMarkError("");
    if (!rejectReason.trim()) {
      setMarkError("Reason required");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("payment_id", selectedPayment.id);
      fd.append("sent_by", id);
      fd.append("confirmed_by", admin_id);
      fd.append("status", "rejected");
      fd.append("confirmed_at", markConfirmedAt.replace("T", " ") || null);
      fd.append("reject_reason", rejectReason);

      await api.post(`${API_ROOT}/addpaymentconfirmation`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.put(`${API_ROOT}/updatepayment/${selectedPayment.id}`, {
        status: "rejected",
      });

      toast.success("Payment rejected");
      setShowMarkPaidModal(false);
      setShowRejectComment(false);
      setSelectedPayment(null);
      await getClientPayments();
    } catch {
      setMarkError("Rejection failed");
    }
  };

  /* ─────── DELETE MODAL LOGIC ─────── */
  const openDeleteModal = (paymentId) => {
    setDeleteTargetPaymentId(paymentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const pid = deleteTargetPaymentId;
    if (!pid) return;
    try {
      await api.put(`${API_ROOT}/updatePaymentStatus/${pid}`, {
        status: "refunded",
      });
      toast.success("Payment deleted");
      setDeleteModalOpen(false);
      setDeleteTargetPaymentId(null);
      await getClientPayments();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const { data } = await api.get(`${API_ROOT}/generateInvoice/${paymentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([data], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${paymentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="client-section">
        {/* ---------- HEADER ---------- */}
        <div className="view-admin-header">
          <div className="header-top">
            <div className="header-top-left">
              <button className="header-back-btn" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
            <div className="header-top-right">
              {user_role === "admin" && (
                <button
                  className="client-add-sale-btn"
                  onClick={() => setShowSaleModal(true)}
                >
                  Add Sale
                </button>
              )}
            </div>
          </div>
          <div className="header-title">
            <h2 className="client-title">Payment Details</h2>
          </div>
        </div>

        {/* ---------- LAYOUT ---------- */}
        <div className="client-layout">
          {/* SIDEBAR */}
          <div className="client-sidebar">
            <div className="client-card">
              <h3 className="client-name">{clientInfo.name}</h3>
              <p className="client-subtext">Contact Information</p>
              <p className="client-contact-row">
                <FaEnvelope /> {clientInfo.email}
              </p>
              <p className="client-contact-row">
                <FaPhone /> {clientInfo.number}
              </p>
            </div>

            <div className="client-card">
              <h4 className="client-subtext">Associated Properties</h4>
              <ul className="client-property-list">
                {propertiesDetail.length > 0 ? (
                  propertiesDetail.map((p, i) => (
                    <li key={i}>
                      {p.title} — {p.address}
                    </li>
                  ))
                ) : (
                  <li>No Properties Assigned</li>
                )}
              </ul>
            </div>
          </div>

          {/* MAIN */}
          <div className="client-main">
            <div className="client-sale-box">
              <h4 className="client-box-title">Sales & Payments</h4>

              {propertiesDetail.length > 0 ? (
                propertiesDetail.map((prop, i) => (
                  <div
                    key={i}
                    className="client-property-sale"
                    onClick={() => {
                      toggleProperty(prop.id);
                      clientPayments
                        .filter((pay) => pay.property_id === prop.id)
                        .forEach((pay) => fetchConfirmationByPaymentId(pay.id));
                    }}
                  >
                    <div className="client-property-header">
                      <span className="client-property-name">{prop.title}</span>
                      <span className="client-property-date">
                        {prop.createdAt
                          ? new Date(prop.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>

                    <p className="client-sale-price">
                      ₹{Number(prop.price).toLocaleString()}
                    </p>

                    <div className="client-sale-plan">
                      <p className="client-sale-note">{prop.description}</p>
                      {openProperty === prop.id ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </div>

                    {/* TRANSACTIONS */}
                    {openProperty === prop.id && (
                      <div className="client-transaction-box">
                        <div className="client-transaction-header">
                          <h5>Transaction History</h5>
                          <button
                            className="client-add-payment-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddPayment(prop);
                            }}
                          >
                            Add Payment
                          </button>
                        </div>

                        <table className="client-table">
                          <thead>
                            <tr>
                              <th>S.No</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Payment Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientPayments
                              .filter((pay) => pay.property_id === prop.id)
                              .map((pay, idx) => (
                                <tr key={pay.id}>
                                  <td data-label="S.No">{idx + 1}</td>
                                  <td data-label="Amount">
                                    ₹{Number(pay.amount).toLocaleString()}
                                  </td>
                                  <td data-label="Status">
                                    <span
                                      className="client-badge"
                                      style={{
                                        backgroundColor:
                                          pay.status === "completed"
                                            ? "#22c55e"
                                            : pay.status === "rejected"
                                            ? "#ef4444"
                                            : pay.status === "refunded"
                                            ? "#6b7280"
                                            : "#f97316",
                                        color:
                                          pay.status === "pending"
                                            ? "black"
                                            : "white",
                                      }}
                                    >
                                      {pay.status}
                                    </span>
                                  </td>
                                  <td data-label="Payment Date">
                                    {pay.paid_at
                                      ? new Date(pay.paid_at).toLocaleDateString(
                                          "en-IN"
                                        )
                                      : "—"}
                                  </td>
                                  <td
                                    data-label="Actions"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {pay.status === "refunded" ? null : (
                                      pay.status === "completed" ||
                                      pay.status === "rejected" ? (
                                        user_role === "admin" ? (
                                          <div className="action-btn-group">
                                            {pay.status === "completed" && (
                                              <button
                                                className="client-download-btn"
                                                onClick={() =>
                                                  handleDownloadInvoice(pay.id)
                                                }
                                                title="Download Invoice"
                                              >
                                                <FaFileDownload />
                                              </button>
                                            )}
                                            <button
                                              className="client-delete-btn"
                                              onClick={() =>
                                                openDeleteModal(pay.id)
                                              }
                                              title="Delete Payment"
                                            >
                                              <FaTrashAlt />
                                            </button>
                                          </div>
                                        ) : null
                                      ) : pay.created_by == admin_id ? (
                                        <button
                                          className="client-edit-btn"
                                          onClick={(e) =>
                                            handleEditPayment(e, pay)
                                          }
                                        >
                                          Edit
                                        </button>
                                      ) : (
                                        <button
                                          className="client-mark-paid-btn"
                                          onClick={(e) =>
                                            openMarkPaidForPayment(e, pay)
                                          }
                                        >
                                          Mark Paid
                                        </button>
                                      )
                                    )}
                                  </td>
                                </tr>
                              ))}
                            {clientPayments.filter(
                              (pay) => pay.property_id === prop.id
                            ).length === 0 && (
                              <tr>
                                <td colSpan={5} className="empty-state">
                                  No payments
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-state">No Properties Available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────── MODALS ──────────────────────── */}

      {/* SALE MODAL */}
      {showSaleModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h3>Record a New Sale</h3>
              <button
                className="payment-close-btn"
                onClick={() => setShowSaleModal(false)}
              >
                ×
              </button>
            </div>
            {assignedError && <p className="error-text">{assignedError}</p>}
            <select
              name="property_id"
              value={assignedForm.property_id}
              onChange={handleAssignProperty}
            >
              <option value="">-- select property --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — ₹{p.price}
                </option>
              ))}
            </select>
            <input
              className="payment-input"
              name="amount"
              value={assignedForm.amount}
              onChange={handleAssignProperty}
              placeholder="Amount"
            />
            <input
              className="payment-input"
              type="datetime-local"
              name="assigned_at"
              value={assignedForm.assigned_at}
              onChange={handleAssignProperty}
            />
            <textarea
              className="payment-textarea"
              name="details"
              value={assignedForm.details}
              onChange={handleAssignProperty}
              placeholder="Details"
            />
            <div className="payment-modal-actions">
              <button
                className="payment-cancel"
                onClick={() => setShowSaleModal(false)}
              >
                Cancel
              </button>
              <button
                className="payment-save"
                onClick={handleAssignPropertySubmit}
              >
                Save Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h3>{isEditing ? "Edit Payment" : "Record Payment"}</h3>
              <button className="payment-close-btn" onClick={closePaymentModal}>
                ×
              </button>
            </div>
            {paymentError && <p className="error-text">{paymentError}</p>}

            <label>Client</label>
            <input
              className="payment-input"
              value={clientInfo.name || ""}
              readOnly
            />
            <label>Property</label>
            <input
              className="payment-input"
              value={selectedProperty?.title || ""}
              readOnly
            />
            <label>Amount</label>
            <input
              className="payment-input"
              type="number"
              name="amount"
              value={paymentForm.amount}
              onChange={handlePayment}
            />
            <label>Payment Method</label>
            <select
              className="payment-input"
              name="payment_method"
              value={paymentForm.payment_method}
              onChange={handlePayment}
            >
              <option value="">-- select --</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </select>
            <label>Payment Date</label>
            <input
              className="payment-input"
              type="datetime-local"
              name="paid_at"
              value={paymentForm.paid_at}
              onChange={handlePayment}
            />
            <textarea
              className="payment-textarea"
              name="details"
              value={paymentForm.details}
              onChange={handlePayment}
              placeholder="Notes"
            />
            <div className="payment-modal-actions">
              <button className="payment-cancel" onClick={closePaymentModal}>
                Cancel
              </button>
              <button
                className="payment-save"
                onClick={isEditing ? handleUpdatePayment : handleAddPayment}
              >
                {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK-PAID / REJECT MODAL */}
      {showMarkPaidModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>{showRejectComment ? "Reject Payment" : "Confirm Payment"}</h3>
              <button
                className="payment-close-btn"
                onClick={() => {
                  setShowRejectComment(false);
                  setShowMarkPaidModal(false);
                }}
              >
                ×
              </button>
            </div>
            {markError && <p className="error-text">{markError}</p>}

            {!showRejectComment ? (
              <>
                <label>Confirm Date & Time</label>
                <input
                  className="payment-input"
                  type="datetime-local"
                  value={markConfirmedAt}
                  onChange={(e) => setMarkConfirmedAt(e.target.value)}
                />
                <label>Client</label>
                <input
                  className="payment-input"
                  value={clientInfo.name || ""}
                  readOnly
                />
                <label>Property</label>
                <input
                  className="payment-input"
                  value={selectedProperty?.title || ""}
                  readOnly
                />
                <label>Amount</label>
                <input
                  className="payment-input"
                  value={`₹${selectedPayment?.amount || ""}`}
                  readOnly
                />
                <label>Signature</label>
                <SignaturePad
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: "signature-pad" }}
                />
                <button
                  className="signature-clear-btn"
                  onClick={() => sigCanvas.current.clear()}
                >
                  Clear
                </button>
                <div className="payment-modal-actions">
                  <button
                    className="payment-cancel reject-btn"
                    onClick={() => setShowRejectComment(true)}
                  >
                    Reject
                  </button>
                  <button className="payment-save" onClick={handleConfirmAndMarkPaid}>
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <>
                <label>Rejection Reason</label>
                <textarea
                  className="payment-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Why rejecting?"
                />
                <div className="payment-modal-actions">
                  <button
                    className="payment-cancel"
                    onClick={() => setShowRejectComment(false)}
                  >
                    Back
                  </button>
                  <button
                    className="payment-save reject-submit-btn"
                    onClick={handleSubmitRejection}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
      />
    </>
  );
}

export default ViewAdmin;