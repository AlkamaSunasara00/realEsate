// src/pages/admin/ViewAdmin.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import "../../../assets/css/admin/viewAdmin.css";
import SignaturePad from "react-signature-canvas";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import api from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

function ViewAdmin() {
    const { id } = useParams(); // client id
    const admin_id = localStorage.getItem("admin_id")
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const user_role = user.role
    const navigate = useNavigate();

    const [openProperty, setOpenProperty] = useState(null);

    // modals
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [showRejectComment, setShowRejectComment] = useState(false);

    // data
    const [clientInfo, setClientInfo] = useState({});
    const [propertId, setPropertId] = useState([]); // assigned rows (assigned_properties)
    const [propertiesDetail, setPropertiesDetail] = useState([]); // assigned property details
    const [properties, setProperties] = useState([]); // available properties for assign
    const [clientPayments, setClientPayments] = useState([]); // payments list

    // selected payment/property for mark paid
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // forms
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

    // mark-paid modal state
    const [markConfirmedAt, setMarkConfirmedAt] = useState(""); // datetime-local string
    const [rejectReason, setRejectReason] = useState("");
    const [markError, setMarkError] = useState("");

    const sigCanvas = useRef(null);

    const API_ROOT = "http://localhost:4500";

    // ----------------- helpers -----------------
    const formatCurrency = (val) => {
        const n = Number(val) || 0;
        // Indian rupee style, fallback simple
        return `₹${n.toLocaleString("en-IN")}`;
    };
    // ---------- helper extractors & sums (replace existing helpers) ----------
    const getAmountFromPayment = (p) => {
        // tolerant extractor for amount-like fields
        // prefer numeric 'amount' but fallback to other names commonly used
        const candidates = [p?.amount, p?.paid_amount, p?.payment_amount, p?.value, p?.price];
        for (let c of candidates) {
            if (c !== undefined && c !== null && c !== "") {
                const n = Number(c);
                if (!Number.isNaN(n)) return n;
            }
        }
        return 0;
    };

    const getStatusFromPayment = (p) => {
        // tolerant status normalizer
        // common variants mapped to normalized string: 'completed' | 'pending' | 'rejected' | 'refunded'
        const raw = (p?.status || p?.payment_status || p?.state || "").toString().trim().toLowerCase();

        if (!raw) return "pending"; // default fallback

        if (["completed", "complete", "paid", "done", "successful", "success"].includes(raw)) return "completed";
        if (["pending", "waiting", "in_progress", "inprogress", "processing"].includes(raw)) return "pending";
        if (["rejected", "failed", "declined", "cancelled", "canceled"].includes(raw)) return "rejected";
        if (["refunded", "refund"].includes(raw)) return "refunded";

        // otherwise return raw so nothing gets hidden
        return raw;
    };

    const getPaymentSumsForProperty = (propertyId) => {
        // tolerant filtering: compare strings so '1' vs 1 won't break
        const payments = clientPayments.filter(p => String(p?.property_id) === String(propertyId));
        const completedSum = payments
            .filter(p => getStatusFromPayment(p) === "completed")
            .reduce((s, p) => s + getAmountFromPayment(p), 0);
        const pendingSum = payments
            .filter(p => getStatusFromPayment(p) === "pending")
            .reduce((s, p) => s + getAmountFromPayment(p), 0);
        const rejectedSum = payments
            .filter(p => getStatusFromPayment(p) === "rejected")
            .reduce((s, p) => s + getAmountFromPayment(p), 0);
        const refundedSum = payments
            .filter(p => getStatusFromPayment(p) === "refunded")
            .reduce((s, p) => s + getAmountFromPayment(p), 0);
        const allSum = payments.reduce((s, p) => s + getAmountFromPayment(p), 0);

        return { completedSum, pendingSum, rejectedSum, refundedSum, allSum, count: payments.length };
    };

    // overall totals across assigned properties
    const overallTotals = useMemo(() => {
        const totals = propertiesDetail.reduce((acc, prop) => {
            const sums = getPaymentSumsForProperty(prop.id);
            acc.totalPrice += Number(prop.price) || 0;
            acc.totalPaid += sums.completedSum;
            acc.totalPending += sums.pendingSum;
            acc.totalRejected += sums.rejectedSum;
            acc.totalAll += sums.allSum;
            return acc;
        }, { totalPrice: 0, totalPaid: 0, totalPending: 0, totalRejected: 0, totalAll: 0 });
        totals.totalRemaining = Math.max(0, totals.totalPrice - totals.totalPaid);
        return totals;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertiesDetail, clientPayments]);

    // ===========================================================
    // 🔹 FETCH CLIENT INFO, PROPERTIES, AND PAYMENTS
    // ===========================================================
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
            const res = await api.get(
                `${API_ROOT}/getAssignedPropertyByClientId/${id}`
            );
            setPropertId(res.data || []);
        } catch (error) {
            console.error("fetchClientAssignProperties", error);
        }
    };

    const assignProperties = async () => {
        try {
            const res = await api.get(`${API_ROOT}/getproperties`);
            const available = (res.data || []).filter(
                (p) => (p.status || "").toLowerCase() === "available"
            );
            setProperties(available);
        } catch (error) {
            console.error("assignProperties", error);
        }
    };
    const getClientPayments = async () => {
        try {
            const res = await api.get(`${API_ROOT}/getPaymentsByClientId/${id}`);
            // debug: show raw response in console (first 5 items)
            console.log("GET /getPaymentsByClientId raw:", res?.data?.slice ? res.data.slice(0, 10) : res.data);
            // set state
            setClientPayments(res.data || []);
        } catch (error) {
            console.error("getClientPayments", error);
        }
    };

    useEffect(() => {
        fetchClientInfo();
        fetchClientAssignProperties();
        assignProperties();
        getClientPayments();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const fetchPropertiesById = async () => {
            try {
                if (!propertId.length) {
                    setPropertiesDetail([]);
                    return;
                }
                const requests = propertId.map((p) =>
                    api.get(`${API_ROOT}/getproperties/${p.property_id}`)
                );
                const responses = await Promise.all(requests);
                const formatted = responses.map((r) => r.data);
                setPropertiesDetail(formatted);
            } catch (error) {
                console.error("fetchPropertiesById", error);
            }
        };
        fetchPropertiesById();
        // eslint-disable-next-line
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
            await api.post(`${API_ROOT}/addassignedproperty`, {
                property_id: assignedForm.property_id,
                client_id: Number(assignedForm.client_id),
                assigned_by: Number(assignedForm.assigned_by),
                amount: assignedForm.amount || null,
                details: assignedForm.details || null,
                assigned_at: assignedForm.assigned_at || null,
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
            console.error("handleAssignPropertySubmit", err);
            setAssignedError("Failed to assign property");
        }
    };

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
            paid_at: pay.paid_at ? pay.paid_at.replace(" ", "T").slice(0, 16) : "",
            details: pay.notes || "",
        });
        setShowPaymentModal(true);
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!paymentForm.property_id || !paymentForm.client_id)
            return setPaymentError("Property and Client are required");

        try {
            await api.post(`${API_ROOT}/addpayment`, {
                property_id: paymentForm.property_id,
                client_id: Number(paymentForm.client_id),
                amount: paymentForm.amount || null,
                payment_method: paymentForm.payment_method || "cash",
                paid_at: paymentForm.paid_at || new Date().toISOString(),
                notes: paymentForm.details || null,
                status: "pending",
                backgroundColor: "yellow"
            });

            alert("Payment added successfully ✅");
            await getClientPayments();
            closePaymentModal();
        } catch (err) {
            console.error("handleAddPayment", err);
            setPaymentError("Failed to add payment ❌");
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        if (!editingPayment) return alert("No payment selected");

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

            alert("Payment updated successfully ✅");
            await getClientPayments();
            closePaymentModal();
        } catch (err) {
            console.error("handleUpdatePayment", err);
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

    const toggleProperty = (id) => setOpenProperty(openProperty === id ? null : id);

    const openMarkPaidForPayment = (e, payment) => {
        e.stopPropagation();
        setSelectedPayment(payment);
        // try to derive selectedProperty from propertiesDetail so UI shows title
        const prop = propertiesDetail.find((p) => p.id === payment.property_id) || null;
        setSelectedProperty(prop);
        // default confirm datetime to now (for datetime-local: yyyy-mm-ddThh:mm)
        const now = new Date();
        const isoSimple = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
        setMarkConfirmedAt(isoSimple);
        setRejectReason("");
        setShowRejectComment(false);
        setMarkError("");
        setShowMarkPaidModal(true);
    };
    // helper: safely get a PNG blob from the signature pad (tries trimmed, falls back)
    const getSignatureBlob = async () => {
        if (!sigCanvas.current) throw new Error("Signature pad ref missing");
        // prefer trimmed canvas (smaller), but gracefully fallback
        let canvasEl;
        try {
            canvasEl = sigCanvas.current.getTrimmedCanvas();
            if (!(canvasEl instanceof HTMLCanvasElement)) throw new Error("trimmed canvas invalid");
        } catch (trimErr) {
            // fallback to full canvas
            console.warn("getTrimmedCanvas failed — falling back to full canvas:", trimErr);
            canvasEl = sigCanvas.current.getCanvas();
            if (!(canvasEl instanceof HTMLCanvasElement)) throw new Error("full canvas invalid");
        }

        const blob = await new Promise((resolve) => {
            // toBlob uses callback
            canvasEl.toBlob((b) => resolve(b), "image/png");
        });

        if (!blob) throw new Error("Failed to create blob from canvas");
        return blob;
    };

    // Confirm & mark paid (uses helper)
    const handleConfirmAndMarkPaid = async () => {
        setMarkError("");
        if (!selectedPayment) {
            setMarkError("No payment selected.");
            return;
        }
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setMarkError("Signature required to confirm.");
            return;
        }

        try {
            // get blob safely (trimmed -> fallback)
            let blob;
            try {
                blob = await getSignatureBlob();
            } catch (err) {
                console.error("Signature processing error:", err);
                setMarkError("Could not process signature. Try clearing and signing again.");
                return;
            }

            const fd = new FormData();
            fd.append("payment_id", selectedPayment.id); // payment record id
            fd.append("sent_by", id); // client id (who sent)
            fd.append("confirmed_by", localStorage.getItem("admin_id") || ""); // admin id
            fd.append("status", "confirmed");
            fd.append(
                "confirmed_at",
                markConfirmedAt ? markConfirmedAt.replace("T", " ") : new Date().toISOString().replace("T", " ")
            );
            fd.append("reject_reason", "");
            fd.append("signature", blob, `signature_${Date.now()}.png`);

            // call addpaymentconfirmation (multer expects 'signature' file)
            await api.post(`${API_ROOT}/addpaymentconfirmation`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // update the payment row as paid
            await api.put(`${API_ROOT}/updatepayment/${selectedPayment.id}`, {
                status: "completed",
                paid_at: markConfirmedAt ? markConfirmedAt.replace("T", " ") : new Date().toISOString().replace("T", " "),
            });

            alert("Payment confirmed & marked paid ✅");
            setShowMarkPaidModal(false);
            sigCanvas.current.clear();
            setSelectedPayment(null);
            await getClientPayments();
        } catch (err) {
            console.error("handleConfirmAndMarkPaid", err);
            setMarkError("Failed to confirm payment. Check server logs.");
        }
    };

    // Reject flow: store reject reason and optionally signature
    const handleSubmitRejection = async () => {
        setMarkError("");
        if (!selectedPayment) {
            setMarkError("No payment selected for rejection.");
            return;
        }
        if (!rejectReason || rejectReason.trim().length < 3) {
            setMarkError("Please provide a valid rejection reason (3+ chars).");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("payment_id", selectedPayment.id);
            fd.append("sent_by", id);
            fd.append("confirmed_by", localStorage.getItem("admin_id") || "");
            fd.append("status", "rejected");
            fd.append("confirmed_at", markConfirmedAt ? markConfirmedAt.replace("T", " ") : null);
            fd.append("reject_reason", rejectReason);

            await api.post(`${API_ROOT}/addpaymentconfirmation`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // update payment status to rejected if desired
            await api.put(`${API_ROOT}/updatepayment/${selectedPayment.id}`, {
                status: "rejected",
            });

            alert("Payment rejected and reason saved ❌");
            setShowMarkPaidModal(false);
            setShowRejectComment(false);
            sigCanvas.current.clear();
            setSelectedPayment(null);
            await getClientPayments();
        } catch (err) {
            console.error("handleSubmitRejection", err);
            setMarkError("Failed to submit rejection.");
        }
    };

    const handleUpdatePaymentStatus = async (paymentId) => {
        try {
            await api.put(`${API_ROOT}/updatePaymentStatus/${paymentId}`, {
                status: "refunded",
            })
            alert("Payment refunded Successfull");
            await getClientPayments();
        } catch (error) {
            console.error(error);
            alert("Payment refunded Failed");
        }
    }

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
                            {user_role === "admin" ? (
                                <button className="client-add-sale-btn" onClick={() => setShowSaleModal(true)}>
                                    Add Sale
                                </button>
                            ) : (<></>)}

                        </div>
                    </div>

                    <div className="header-title">
                        <h2 className="client-title">Client Details</h2>
                    </div>
                </div>

                <div className="client-layout">
                    {/* Sidebar */}
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
                                    propertiesDetail.map((p, i) => {
                                        const sums = getPaymentSumsForProperty(p.id);
                                        const remaining = Math.max(0, (Number(p.price) || 0) - sums.completedSum);
                                        return (
                                            <li key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                                    <div>
                                                        <strong>{p.title}</strong> — {p.address}
                                                    </div>
                                                    <div style={{ textAlign: "right", minWidth: 150 }}>
                                                        <div style={{ fontSize: 13 }}>Total: {formatCurrency(p.price)}</div>
                                                        <div style={{ fontSize: 13 }}>Paid: {formatCurrency(sums.completedSum)}</div>
                                                        <div style={{ fontSize: 13 }}>Pending: {formatCurrency(sums.pendingSum)}</div>
                                                        <div style={{ fontSize: 13, fontWeight: 600 }}>Remaining: {formatCurrency(remaining)}</div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : <li>No Properties Assigned</li>}
                            </ul>
                        </div>

                        {/* overall summary */}
                        <div className="client-card" style={{ marginTop: 12 }}>
                            <h4 className="client-subtext">Summary</h4>
                            <p style={{ margin: "6px 0" }}>Total Price: <strong>{formatCurrency(overallTotals.totalPrice)}</strong></p>
                            <p style={{ margin: "6px 0" }}>Total Paid: <strong>{formatCurrency(overallTotals.totalPaid)}</strong></p>
                            <p style={{ margin: "6px 0" }}>Total Pending: <strong>{formatCurrency(overallTotals.totalPending)}</strong></p>
                            <p style={{ margin: "6px 0" }}>Total Remaining: <strong>{formatCurrency(overallTotals.totalRemaining)}</strong></p>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="client-main">
                        <div className="client-sale-box">
                            <h4 className="client-box-title">Sales & Payments</h4>
                            {propertiesDetail.length > 0 ? propertiesDetail.map((p, i) => {
                                const sums = getPaymentSumsForProperty(p.id);
                                const remaining = Math.max(0, (Number(p.price) || 0) - sums.completedSum);
                                return (
                                    <div className="client-property-sale" onClick={() => toggleProperty(p.id)} key={i}>
                                        <div className="client-property-header">
                                            <div>
                                                <span className="client-property-name">{p.title}</span>
                                                <div style={{ fontSize: 12, color: "#666" }}>{p.address}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(p.price)}</div>
                                                <div style={{ fontSize: 12 }}>{formatCurrency(sums.completedSum)} paid • {formatCurrency(remaining)} remaining</div>
                                            </div>
                                        </div>

                                        <p className="client-sale-price">₹{p.price}</p>
                                        <div className="client-sale-plan">
                                            <p className="client-sale-note">{p.description}</p>
                                            {openProperty === p.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>

                                        {openProperty === p.id && (
                                            <div className="client-transaction-box">
                                                <div className="client-transaction-header">
                                                    <h5>Transaction History</h5>
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                        {/* <div style={{ fontSize: 13, color: "#333" }}>
                                                            Paid: <strong>{formatCurrency(sums.completedSum)}</strong>
                                                            {" • "}
                                                            Pending: <strong>{formatCurrency(sums.pendingSum)}</strong>
                                                        </div> */}
                                                        <button className="client-add-payment-btn" onClick={(e) => { e.stopPropagation(); handleOpenAddPayment(p); }}>
                                                            Add Payment
                                                        </button>
                                                    </div>
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
                                                        {clientPayments.filter(pay => String(pay.property_id) === String(p.id))
                                                            .length > 0 ? (
                                                            clientPayments.filter(pay => pay.property_id === p.id).map((pay, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>₹{pay.amount}</td>
                                                                    <td>
                                                                        <span
                                                                            className="client-badge"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    pay.status?.toLowerCase() === "completed"
                                                                                        ? "green"
                                                                                        : pay.status?.toLowerCase() === "pending"
                                                                                            ? "yellow"
                                                                                            : pay.status?.toLowerCase() === "rejected"
                                                                                                ? "red"
                                                                                                : "gray",
                                                                                color: pay.status?.toLowerCase() === "pending" ? "black" : "white",
                                                                                padding: "4px 8px",
                                                                                borderRadius: "6px",
                                                                                fontWeight: 500,
                                                                            }}
                                                                        >
                                                                            {pay.status || "completed"}
                                                                        </span>

                                                                    </td>
                                                                    <td>{pay.payment_date ? pay.payment_date.slice(0, 10) : "N/A"}</td>
                                                                    <td>
                                                                        {
                                                                            pay.status === "refunded" ? (
                                                                                <></>
                                                                            ) : pay.status === "completed" || pay.status === "rejected" ? (
                                                                                id === admin_id ? (
                                                                                    <></>
                                                                                ) : (
                                                                                    <button
                                                                                        className="client-add-payment-btn"
                                                                                        onClick={() => handleUpdatePaymentStatus(pay.id)}
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                )
                                                                            ) : (
                                                                                id === admin_id ? (
                                                                                    <button
                                                                                        className="client-mark-paid-btn"
                                                                                        onClick={(e) => openMarkPaidForPayment(e, pay)}
                                                                                    >
                                                                                        Mark Paid
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        className="client-add-payment-btn"
                                                                                        onClick={(e) => handleEditPayment(e, pay)}
                                                                                    >
                                                                                        Edit
                                                                                    </button>
                                                                                )
                                                                            )
                                                                        }

                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr><td colSpan={5} style={{ textAlign: "center", opacity: 0.6 }}>No payments for this property</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : <p>No Properties Available</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== SALE MODAL (unchanged) ===================== */}
            {showSaleModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal better-modal mark-paid-modal">
                        <div className="payment-modal-header">
                            <h3>Record a New Sale</h3>
                            <button className="payment-close-btn" onClick={() => setShowSaleModal(false)}>✕</button>
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

            {/* ===================== PAYMENT MODAL (unchanged) ===================== */}
            {showPaymentModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal better-modal mark-paid-modal">
                        <div className="payment-modal-header">
                            <h3>{isEditing ? "Edit Payment" : "Record a New Payment"}</h3>
                            <button className="payment-close-btn" onClick={closePaymentModal}>✕</button>
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

            {/* ===================== MARK PAID / REJECT MODAL (wired up) ===================== */}
            {showMarkPaidModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal better-modal mark-paid-modal">
                        <div className="payment-modal-header">
                            <h3>{showRejectComment ? "Reject Payment" : "Confirm Payment"}</h3>
                            <button className="payment-close-btn" onClick={() => { setShowRejectComment(false); setShowMarkPaidModal(false); }}>
                                ✕
                            </button>
                        </div>

                        {/* show any errors */}
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
