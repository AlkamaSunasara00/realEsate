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

function ViewAdmin() {
  const { id } = useParams();
  const admin_id = localStorage.getItem("admin_id");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user_role = user.role || "";
  const navigate = useNavigate();

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
  const [paymenterror, setPaymentError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [markConfirmedAt, setMarkConfirmedAt] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [markError, setMarkError] = useState("");
  const [confirmationPayments, setConfirmationPayments] = useState({});

  const sigCanvas = useRef(null);
  const API_ROOT = "http://localhost:4500";

  // ──────────────────────────────────────────────────────────────
  // FETCHERS
  // ──────────────────────────────────────────────────────────────
  const fetchClientInfo = async () => {
    try {
      const res = await api.get(`/admin/getUserById/${id}`);
      setClientInfo(res.data);
    } catch (error) {
      console.error("fetchClientInfo", error);
    }
  };

  const fetchClientAssignProperties = async () => {
    try {
      const res = await api.get(`${API_ROOT}/getAssignedPropertyByClientId/${id}`);
      setPropertId(res.data || []);
    } catch (error) {
      console.error("fetchClientAssignProperties", error);
    }
  };

  const assignProperties = async () => {
    try {
      const res = await api.get(`${API_ROOT}/getproperties`);
      const available = (res.data || []).filter(p => p.status?.toLowerCase() === "available");
      setProperties(available);
    } catch (error) {
      console.error("assignProperties", error);
    }
  };

  const getClientPayments = async () => {
    try {
      const res = await api.get(`${API_ROOT}/getPaymentsByClientId/${id}`);
      setClientPayments(res.data || []);
    } catch (error) {
      console.error("getClientPayments", error);
    }
  };

  const fetchConfirmationByPaymentId = async (paymentId) => {
    try {
      const res = await api.get(`${API_ROOT}/getConfirmationByPaymentId/${paymentId}`);
      const data = res.data[0];
      setConfirmationPayments(prev => ({ ...prev, [paymentId]: data }));
    } catch (error) {
      console.error("fetchConfirmationByPaymentId", error);
    }
  };

  useEffect(() => {
    fetchClientInfo();
    fetchClientAssignProperties();
    assignProperties();
    getClientPayments();
  }, [id]);

  useEffect(() => {
    const fetchPropertiesById = async () => {
      if (!propertId.length) {
        setPropertiesDetail([]);
        return;
      }
      const requests = propertId.map(p => api.get(`${API_ROOT}/getproperties/${p.property_id}`));
      const responses = await Promise.all(requests);
      setPropertiesDetail(responses.map(r => r.data));
    };
    fetchPropertiesById();
  }, [propertId]);

  // ──────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────
  const handleAssignProperty = (e) => setAssignedForm({ ...assignedForm, [e.target.name]: e.target.value });

  const handleAssignPropertySubmit = async (e) => {
    e.preventDefault();
    if (!assignedForm.property_id || !assignedForm.client_id) {
      setAssignedError("Property and Client are required");
      return;
    }
    try {
      await api.post(`${API_ROOT}/addassignedproperty`, {
        property_id: assignedForm.property_id,
        client_id: Number(assignedForm.client_id),
        assigned_by: Number(assignedForm.assigned_by),
        amount: assignedForm.amount || null,
        details: assignedForm.details || null,
        assigned_at: assignedForm.assigned_at || null,
      });
      alert("Property assigned successfully");
      await fetchClientAssignProperties();
      await assignProperties();
      setShowSaleModal(false);
      setAssignedForm({ property_id: "", client_id: id, assigned_by: admin_id, amount: "", details: "", assigned_at: "" });
    } catch (err) {
      setAssignedError("Failed to assign property");
    }
  };

  const handlePayment = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

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
      paid_at: "",
      created_by: admin_id,
    });
    setShowPaymentModal(true);
  };

  const handleEditPayment = (e, pay) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingPayment(pay);
    setSelectedProperty(propertiesDetail.find(p => p.id === pay.property_id));
    setPaymentForm({
      property_id: pay.property_id,
      client_id: pay.client_id || id,
      amount: pay.amount,
      payment_method: pay.payment_method,
      paid_at: pay.paid_at ? pay.paid_at.replace(" ", "T").slice(0, 16) : "",
      details: pay.notes || "",
    });
    setShowPaymentModal(true);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.property_id || !paymentForm.client_id) return setPaymentError("Property and Client are required");
    try {
      await api.post(`${API_ROOT}/addpayment`, {
        property_id: paymentForm.property_id,
        client_id: Number(paymentForm.client_id),
        amount: paymentForm.amount || null,
        payment_method: paymentForm.payment_method || "cash",
        paid_at: paymentForm.paid_at || new Date().toISOString(),
        notes: paymentForm.details || null,
        status: "pending",
        created_by: admin_id,
      });
      alert("Payment added successfully");
      await getClientPayments();
      closePaymentModal();
    } catch (err) {
      setPaymentError("Failed to add payment");
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    try {
      await api.put(`${API_ROOT}/updatepayment/${editingPayment.id}`, {
        property_id: paymentForm.property_id,
        client_id: paymentForm.client_id,
        amount: Number(paymentForm.amount) || null,
        payment_method: paymentForm.payment_method || null,
        status: editingPayment.status || "pending",
        notes: paymentForm.details || null,
        paid_at: paymentForm.paid_at ? paymentForm.paid_at.replace("T", " ") : null,
      });
      alert("Payment updated successfully");
      await getClientPayments();
      closePaymentModal();
    } catch (err) {
      alert("Failed to update payment");
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setIsEditing(false);
    setEditingPayment(null);
    setPaymentError("");
    setPaymentForm({ property_id: "", client_id: "", amount: "", details: "", payment_method: "", paid_at: "" });
  };

  const toggleProperty = (id) => setOpenProperty(openProperty === id ? null : id);

  const openMarkPaidForPayment = (e, payment) => {
    e.stopPropagation();
    setSelectedPayment(payment);
    const prop = propertiesDetail.find(p => p.id === payment.property_id) || null;
    setSelectedProperty(prop);
    const now = new Date().toISOString().slice(0, 16);
    setMarkConfirmedAt(now);
    setRejectReason("");
    setShowRejectComment(false);
    setMarkError("");
    setShowMarkPaidModal(true);
  };

  const getSignatureBlob = async () => {
    if (!sigCanvas.current) throw new Error("Signature pad missing");
    let canvasEl;
    try {
      canvasEl = sigCanvas.current.getTrimmedCanvas();
    } catch {
      canvasEl = sigCanvas.current.getCanvas();
    }
    return await new Promise(resolve => canvasEl.toBlob(resolve, "image/png"));
  };

  const handleConfirmAndMarkPaid = async () => {
    setMarkError("");
    if (!selectedPayment || sigCanvas.current.isEmpty()) {
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
      fd.append("signature", blob, `signature_${Date.now()}.png`);
      await api.post(`${API_ROOT}/addpaymentconfirmation`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.put(`${API_ROOT}/updatepayment/${selectedPayment.id}`, {
        status: "completed",
        paid_at: markConfirmedAt.replace("T", " "),
      });
      alert("Payment confirmed & marked paid");
      setShowMarkPaidModal(false);
      sigCanvas.current.clear();
      setSelectedPayment(null);
      await getClientPayments();
    } catch (err) {
      setMarkError("Failed to confirm payment");
    }
  };

  const handleSubmitRejection = async () => {
    setMarkError("");
    if (!selectedPayment || !rejectReason.trim()) {
      setMarkError("Rejection reason required");
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
      await api.put(`${API_ROOT}/updatepayment/${selectedPayment.id}`, { status: "rejected" });
      alert("Payment rejected");
      setShowMarkPaidModal(false);
      setShowRejectComment(false);
      sigCanvas.current.clear();
      setSelectedPayment(null);
      await getClientPayments();
    } catch (err) {
      setMarkError("Failed to submit rejection");
    }
  };

  const handleUpdatePaymentStatus = async (paymentId) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await api.put(`${API_ROOT}/updatePaymentStatus/${paymentId}`, { status: "refunded" });
      alert("Payment deleted");
      await getClientPayments();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  // ──────────────────────────────────────────────────────────────
  // NEW: Download Invoice
  // ──────────────────────────────────────────────────────────────
  const handleDownloadInvoice = async (paymentId) => {
    try {
      const { data } = await api.get(`${API_ROOT}/generateInvoice/${paymentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${paymentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download invoice");
    }
  };

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="client-section">
        <div className="view-admin-header">
          <div className="header-top">
            <div className="header-top-left">
              <button className="header-back-btn" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
            <div className="header-top-right">
              {user_role === "admin" && (
                <button className="client-add-sale-btn" onClick={() => setShowSaleModal(true)}>
                  Add Sale
                </button>
              )}
            </div>
          </div>
          <div className="header-title">
            <h2 className="client-title">Payment Details</h2>
          </div>
        </div>

        <div className="client-layout">
          <div className="client-sidebar">
            <div className="client-card">
              <h3 className="client-name">{clientInfo.name}</h3>
              <p className="client-subtext">Contact Information</p>
              <p className="client-contact-row"><FaEnvelope /> {clientInfo.email}</p>
              <p className="client-contact-row"><FaPhone /> {clientInfo.number}</p>
            </div>
            <div className="client-card">
              <h4 className="client-subtext">Associated Properties</h4>
              <ul className="client-property-list">
                {propertiesDetail.length > 0 ? (
                  propertiesDetail.map((p, i) => <li key={i}>{p.title} — {p.address}</li>)
                ) : <li>No Properties Assigned</li>}
              </ul>
            </div>
          </div>

          <div className="client-main">
            <div className="client-sale-box">
              <h4 className="client-box-title">Sales & Payments</h4>
              {propertiesDetail.length > 0 ? propertiesDetail.map((p, i) => (
                <div
                  className="client-property-sale"
                  onClick={() => {
                    toggleProperty(p.id);
                    clientPayments
                      .filter(pay => pay.property_id === p.id)
                      .forEach(pay => fetchConfirmationByPaymentId(pay.id));
                  }}
                  key={i}
                >
                  <div className="client-property-header">
                    <span className="client-property-name">{p.title}</span>
                    <span className="client-property-date">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <p className="client-sale-price">₹{Number(p.price).toLocaleString()}</p>
                  <div className="client-sale-plan">
                    <p className="client-sale-note">{p.description}</p>
                    {openProperty === p.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>

                  {openProperty === p.id && (
                    <div className="client-transaction-box">
                      <div className="client-transaction-header">
                        <h5>Transaction History</h5>
                        <button className="client-add-payment-btn" onClick={(e) => { e.stopPropagation(); handleOpenAddPayment(p); }}>
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
                          {clientPayments.filter(pay => pay.property_id === p.id).length > 0 ? (
                            clientPayments.filter(pay => pay.property_id === p.id).map((pay, idx) => (
                              <tr key={pay.id} onClick={() => fetchConfirmationByPaymentId(pay.id)}>
                                <td data-label="S.No">{idx + 1}</td>
                                <td data-label="Amount">₹{Number(pay.amount).toLocaleString()}</td>
                                <td data-label="Status">
                                  <span
                                    className="client-badge"
                                    style={{
                                      backgroundColor:
                                        pay.status === "completed" ? "#22c55e" :
                                          pay.status === "rejected" ? "#ef4444" :
                                            pay.status === "refunded" ? "#6b7280" :
                                              "#f97316",
                                      color: pay.status === "pending" ? "black" : "white",
                                    }}
                                  >
                                    {pay.status}
                                  </span>
                                </td>
                                <td data-label="Payment Date">
                                  {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString("en-IN") : "—"}
                                </td>
                                <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                                  {pay.status === "refunded" ? null : (
                                    pay.status === "completed" || pay.status === "rejected" ? (
                                      user_role === "admin" ? (
                                        <div style={{ display: "flex", gap: 6 }}>
                                          {/* Download Button */}
                                          {pay.status === "completed" && (
                                            <button
                                              className="client-download-btn"
                                              onClick={() => handleDownloadInvoice(pay.id)}
                                              title="Download Invoice"
                                            >
                                              <FaFileDownload />
                                            </button>
                                          )}
                                          {/* Delete Button */}
                                          <button
                                            className="client-delete-btn"
                                            onClick={() => handleUpdatePaymentStatus(pay.id)}
                                          >
                                            <FaTrashAlt/>
                                          </button>
                                        </div>
                                      ) : null
                                    ) : (
                                      pay.created_by == admin_id ? (
                                        <button className="client-edit-btn" onClick={(e) => handleEditPayment(e, pay)}>
                                          Edit
                                        </button>
                                      ) : (
                                        <button className="client-mark-paid-btn" onClick={(e) => openMarkPaidForPayment(e, pay)}>
                                          Mark Paid
                                        </button>
                                      )
                                    )
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={5} className="empty-state">No payments for this property</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )) : <p className="empty-state">No Properties Available</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ──────── SALE MODAL ──────── */}
      {showSaleModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal better-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>Record a New Sale</h3>
              <button className="payment-close-btn" onClick={() => setShowSaleModal(false)}>X</button>
            </div>
            {assignedError && <div style={{ color: "crimson", marginBottom: 10 }}>{assignedError}</div>}
            <select name="property_id" value={assignedForm.property_id} onChange={handleAssignProperty}>
              <option value="">-- select property --</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title} — ₹{p.price}</option>)}
            </select>
            <input className="payment-input" name="amount" value={assignedForm.amount} onChange={handleAssignProperty} placeholder="Amount" />
            <input className="payment-input" type="datetime-local" name="assigned_at" value={assignedForm.assigned_at} onChange={handleAssignProperty} />
            <textarea className="payment-textarea" name="details" value={assignedForm.details} onChange={handleAssignProperty} placeholder="Details" />
            <div className="payment-modal-actions">
              <button className="payment-cancel" onClick={() => setShowSaleModal(false)}>Cancel</button>
              <button className="payment-save" onClick={handleAssignPropertySubmit}>Save Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── PAYMENT MODAL ──────── */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal better-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>{isEditing ? "Edit Payment" : "Record a New Payment"}</h3>
              <button className="payment-close-btn" onClick={closePaymentModal}>X</button>
            </div>
            {paymenterror && <p style={{ color: "crimson", fontWeight: 500 }}>{paymenterror}</p>}
            <label>Client</label>
            <input className="payment-input" value={clientInfo.name || ""} readOnly style={{ backgroundColor: "#f5f5f5" }} />
            <label>Property</label>
            <input className="payment-input" value={selectedProperty?.title || ""} readOnly style={{ backgroundColor: "#f5f5f5" }} />
            <label>Amount</label>
            <input className="payment-input" type="number" name="amount" value={paymentForm.amount} onChange={handlePayment} placeholder="Enter amount" />
            <label>Payment Method</label>
            <select className="payment-input" name="payment_method" value={paymentForm.payment_method} onChange={handlePayment}>
              <option value="">-- select --</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </select>
            <label>Payment Date</label>
            <input className="payment-input" type="datetime-local" name="paid_at" value={paymentForm.paid_at} onChange={handlePayment} />
            <textarea className="payment-textarea" name="details" value={paymentForm.details} onChange={handlePayment} placeholder="Description (Optional)" />
            <div className="payment-modal-actions">
              <button className="payment-cancel" onClick={closePaymentModal}>Cancel</button>
              <button className="payment-save" onClick={isEditing ? handleUpdatePayment : handleAddPayment}>
                {isEditing ? "Update Payment" : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── MARK PAID / REJECT MODAL ──────── */}
      {showMarkPaidModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal better-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>{showRejectComment ? "Reject Payment" : "Confirm Payment"}</h3>
              <button className="payment-close-btn" onClick={() => { setShowRejectComment(false); setShowMarkPaidModal(false); }}>
                X
              </button>
            </div>
            {markError && <div style={{ color: "crimson", marginBottom: 8 }}>{markError}</div>}
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
                <input className="payment-input" type="text" value={clientInfo.name || ""} readOnly />
                <label>Property</label>
                <input className="payment-input" type="text" value={selectedProperty?.title || ""} readOnly />
                <label>Amount</label>
                <input className="payment-input" type="text" value={`₹${selectedPayment?.amount || ""}`} readOnly />
                <label>Signature</label>
                <SignaturePad ref={sigCanvas} penColor="black" canvasProps={{ className: "signature-pad" }} />
                <button className="signature-clear-btn" onClick={() => sigCanvas.current.clear()}>Clear</button>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="payment-cancel reject-btn" onClick={() => setShowRejectComment(true)}>Reject</button>
                  <button className="payment-save" onClick={handleConfirmAndMarkPaid}>Confirm & Mark Paid</button>
                </div>
              </>
            ) : (
              <>
                <label>Rejection Reason</label>
                <textarea
                  className="payment-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Why are you rejecting this payment?"
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="payment-cancel" onClick={() => setShowRejectComment(false)}>Back</button>
                  <button className="payment-save reject-submit-btn" onClick={handleSubmitRejection}>Submit Rejection</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ViewAdmin;