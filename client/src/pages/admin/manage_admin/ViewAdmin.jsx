import React, { useState, useRef, useEffect } from "react";
import "../../../assets/css/admin/viewAdmin.css";
import SignaturePad from "react-signature-canvas";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import axios from "axios";
import api from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

function ViewAdmin() {
  const { id } = useParams();
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

  const [assignedForm, setAssignedForm] = useState({
    property_id: "",
    client_id: id,
    assigned_by: localStorage.getItem("admin_id") || "",
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
  });
  const [paymenterror, setPaymentError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const sigCanvas = useRef(null);

  // ===========================================================
  // 🔹 FETCH CLIENT INFO, PROPERTIES, AND PAYMENTS
  // ===========================================================
  const fetchClientInfo = async () => {
    try {
      const res = await api.get(`/getUserById/${id}`);
      setClientInfo(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClientAssignProperties = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4500/getAssignedPropertyByClientId/${id}`
      );
      setPropertId(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const assignProperties = async () => {
    try {
      const res = await axios.get(`http://localhost:4500/getproperties`);
      const available = (res.data || []).filter(
        (p) => (p.status || "").toLowerCase() === "available"
      );
      setProperties(available);
    } catch (error) {
      console.error(error);
    }
  };

  const getClientPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4500/getPaymentsByClientId/${id}`
      );
      setClientPayments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClientInfo();
    fetchClientAssignProperties();
    assignProperties();
    getClientPayments();
  }, []);

  useEffect(() => {
    const fetchPropertiesById = async () => {
      try {
        const requests = propertId.map((p) =>
          axios.get(`http://localhost:4500/getproperties/${p.property_id}`)
        );
        const responses = await Promise.all(requests);
        const formatted = responses.map((r) => r.data);
        setPropertiesDetail(formatted);
      } catch (error) {
        console.error(error);
      }
    };
    if (propertId.length) fetchPropertiesById();
  }, [propertId]);

  // ===========================================================
  // 🔹 ASSIGN SALE HANDLERS
  // ===========================================================
  const handleAssignProperty = (e) =>
    setAssignedForm({ ...assignedForm, [e.target.name]: e.target.value });

  const handleAssignPropertySubmit = async (e) => {
    e.preventDefault();

    if (!assignedForm.property_id || !assignedForm.client_id) {
      setAssignedError("Property and Client are required");
      return;
    }

    try {
      await axios.post(`http://localhost:4500/addassignedproperty`, {
        property_id: assignedForm.property_id,
        client_id: Number(assignedForm.client_id),
        assigned_by: Number(assignedForm.assigned_by),
        amount: assignedForm.amount || null,
        details: assignedForm.details || null,
        assigned_at: assignedForm.assigned_at || new Date().toISOString(),
      });

      alert("Property assigned successfully ✅");
      await fetchClientAssignProperties();
      await assignProperties();
      setShowSaleModal(false);
      setAssignedForm({
        property_id: "",
        client_id: id,
        assigned_by: localStorage.getItem("admin_id") || "",
        amount: "",
        details: "",
        assigned_at: "",
      });
    } catch (err) {
      console.error(err);
      setAssignedError("Failed to assign property");
    }
  };

  // ===========================================================
  // 🔹 PAYMENT HANDLERS (ADD + EDIT)
  // ===========================================================
  const handlePayment = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddPayment = (property) => {
    setIsEditing(false);
    setEditingPayment(null);
    setSelectedProperty(property);
    setPaymentForm({
      property_id: property.id || "",
      client_id: id,
      amount: "",
      details: "",
      payment_method: "",
      paid_at: "",
    });
    setShowPaymentModal(true);
  };

  const handleEditPayment = (e, pay) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingPayment(pay);
    setSelectedProperty(propertiesDetail.find((p) => p.id === pay.property_id));
    setPaymentForm({
      property_id: pay.property_id || "",
      client_id: pay.client_id || id,
      amount: pay.amount || "",
      payment_method: pay.payment_method || "",
      paid_at: pay.paid_at
        ? pay.paid_at.replace(" ", "T").slice(0, 16)
        : "",
      details: pay.notes || "",
    });
    setShowPaymentModal(true);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.property_id || !paymentForm.client_id)
      return setPaymentError("Property and Client are required");

    try {
      await axios.post(`http://localhost:4500/addpayment`, {
        property_id: paymentForm.property_id,
        client_id: Number(paymentForm.client_id),
        amount: paymentForm.amount || null,
        payment_method: paymentForm.payment_method || "cash",
        paid_at: paymentForm.paid_at || new Date().toISOString(),
        notes: paymentForm.details || null,
        status: "pending",
      });

      alert("Payment added successfully ✅");
      await getClientPayments();
      closePaymentModal();
    } catch (err) {
      console.error(err);
      setPaymentError("Failed to add payment ❌");
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return alert("No payment selected");

    try {
      await axios.put(
        `http://localhost:4500/updatepayment/${editingPayment.id}`,
        {
          property_id: paymentForm.property_id,
          client_id: paymentForm.client_id,
          amount: Number(paymentForm.amount) || null,
          payment_method: paymentForm.payment_method || null,
          status: "pending",
          notes: paymentForm.details || null,
          paid_at: paymentForm.paid_at
            ? paymentForm.paid_at.replace("T", " ")
            : null,
        }
      );

      alert("Payment updated successfully ✅");
      await getClientPayments();
      closePaymentModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update payment ❌");
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setIsEditing(false);
    setEditingPayment(null);
    setPaymentError("");
    setPaymentForm({
      property_id: "",
      client_id: "",
      amount: "",
      details: "",
      payment_method: "",
      paid_at: "",
    });
  };

  const toggleProperty = (id) =>
    setOpenProperty(openProperty === id ? null : id);

  // ===========================================================
  // 🔹 UI SECTION
  // ===========================================================
  return (
    <>
      <div className="client-section">
        <div className="client-header">
          <h2 className="client-title">Client Details</h2>
          <button
            className="client-add-sale-btn"
            onClick={() => setShowSaleModal(true)}
          >
            Add Sale
          </button>
        </div>

        <div className="client-layout">
          {/* Sidebar */}
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

          {/* Main Section */}
          <div className="client-main">
            <div className="client-sale-box">
              <h4 className="client-box-title">Sales & Payments</h4>
              {propertiesDetail.length > 0 ? (
                propertiesDetail.map((p, i) => (
                  <div
                    className="client-property-sale"
                    onClick={() => toggleProperty(p.id)}
                    key={i}
                  >
                    <div className="client-property-header">
                      <span className="client-property-name">{p.title}</span>
                      <span className="client-property-date">{p.createdAt}</span>
                    </div>

                    <p className="client-sale-price">₹{p.price}</p>
                    <div className="client-sale-plan">
                      <p className="client-sale-note">{p.description}</p>
                      {openProperty === p.id ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </div>

                    {openProperty === p.id && (
                      <div className="client-transaction-box">
                        <div className="client-transaction-header">
                          <h5>Transaction History</h5>
                          <button
                            className="client-add-payment-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddPayment(p);
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
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientPayments.filter(
                              (pay) => pay.property_id === p.id
                            ).length > 0 ? (
                              clientPayments
                                .filter((pay) => pay.property_id === p.id)
                                .map((pay, idx) => (
                                  <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>₹{pay.amount}</td>
                                    <td>
                                      <span
                                        className={`client-badge ${
                                          pay.status?.toLowerCase() === "paid"
                                            ? "client-paid"
                                            : "client-pending"
                                        }`}
                                      >
                                        {pay.status || "unknown"}
                                      </span>
                                    </td>
                                    <td>
                                      {pay.payment_date
                                        ? pay.payment_date.slice(0, 10)
                                        : "N/A"}
                                    </td>
                                    <td>
                                      <button
                                        className="client-add-payment-btn"
                                        onClick={(e) =>
                                          handleEditPayment(e, pay)
                                        }
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="client-mark-paid-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProperty(p);
                                          setShowMarkPaidModal(true);
                                        }}
                                      >
                                        Mark Paid
                                      </button>
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={5}
                                  style={{ textAlign: "center", opacity: 0.6 }}
                                >
                                  No payments for this property
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
                <p>No Properties Available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== SALE MODAL ===================== */}
      {showSaleModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal better-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>Record a New Sale</h3>
              <button
                className="payment-close-btn"
                onClick={() => setShowSaleModal(false)}
              >
                ✕
              </button>
            </div>

            {assignedError && (
              <div style={{ color: "crimson", marginBottom: 10 }}>
                {assignedError}
              </div>
            )}

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

      {/* ===================== PAYMENT MODAL ===================== */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal better-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>{isEditing ? "Edit Payment" : "Record a New Payment"}</h3>
              <button className="payment-close-btn" onClick={closePaymentModal}>
                ✕
              </button>
            </div>

            {paymenterror && (
              <p style={{ color: "crimson", fontWeight: 500 }}>{paymenterror}</p>
            )}

            <label>Client</label>
            <input
              className="payment-input"
              value={clientInfo.name || ""}
              readOnly
              style={{ backgroundColor: "#f5f5f5" }}
            />

            <label>Property</label>
            <input
              className="payment-input"
              value={selectedProperty?.title || ""}
              readOnly
              style={{ backgroundColor: "#f5f5f5" }}
            />

            <label>Amount</label>
            <input
              className="payment-input"
              type="number"
              name="amount"
              value={paymentForm.amount}
              onChange={handlePayment}
              placeholder="Enter amount"
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
              placeholder="Description (Optional)"
            />

            <div className="payment-modal-actions">
              <button className="payment-cancel" onClick={closePaymentModal}>
                Cancel
              </button>
              <button
                className="payment-save"
                onClick={isEditing ? handleUpdatePayment : handleAddPayment}
              >
                {isEditing ? "Update Payment" : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MARK PAID / REJECT MODAL ===================== */}
      {showMarkPaidModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal better-modal mark-paid-modal">
            <div className="payment-modal-header">
              <h3>{showRejectComment ? "Reject Payment" : "Confirm Payment"}</h3>
              <button
                className="payment-close-btn"
                onClick={() => {
                  setShowRejectComment(false);
                  setShowMarkPaidModal(false);
                }}
              >
                ✕
              </button>
            </div>

            {!showRejectComment && (
              <>
                <input
                  className="payment-input"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
                <input
                  className="payment-input"
                  type="text"
                  value={clientInfo.name || ""}
                  readOnly
                />
                <input
                  className="payment-input"
                  type="text"
                  value={selectedProperty?.title || ""}
                  readOnly
                />
                <input
                  className="payment-input"
                  type="text"
                  value={`₹${paymentForm.amount || ""}`}
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
              </>
            )}

            {showRejectComment && (
              <textarea
                className="payment-textarea"
                placeholder="Why are you rejecting this payment?"
              ></textarea>
            )}

            <div className="payment-modal-actions">
              {!showRejectComment ? (
                <>
                  <button
                    className="payment-cancel reject-btn"
                    onClick={() => setShowRejectComment(true)}
                  >
                    Reject
                  </button>
                  <button
                    className="payment-save"
                    onClick={() => {
                      alert("Payment marked as paid ✅");
                      setShowMarkPaidModal(false);
                    }}
                  >
                    Confirm & Mark Paid
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="payment-cancel"
                    onClick={() => setShowRejectComment(false)}
                  >
                    Back
                  </button>
                  <button
                    className="payment-save reject-submit-btn"
                    onClick={() => {
                      alert("Rejection submitted ❌");
                      setShowRejectComment(false);
                      setShowMarkPaidModal(false);
                    }}
                  >
                    Submit Rejection
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewAdmin;
