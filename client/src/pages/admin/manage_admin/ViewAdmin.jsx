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
    const [clientInfo, setClientInfo] = useState({})
    const [propertId, setPropertId] = useState([]);
    const [propertiesDetail, setPropertiesDetail] = useState([])
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);
    const [form, setForm] = useState({
        property_id: "",
        client_id: id,
        assigned_by: localStorage.getItem("admin_id") || "",
        amount: "",
        details: "",
        assigned_at: "",
    });
    const [error, setError] = useState("");



    const fetchClientInfo = async () => {
        try {
            const res = await api.get(`/getUserById/${id}`);
            setClientInfo(res.data)
        } catch (error) {
            console.error(error);

        }
    }

    const fetchClientAssignProperties = async () => {
        try {
            const res = await axios.get(`http://localhost:4500/getAssignedPropertyByClientId/${id}`)
            setPropertId(res.data)
        } catch (error) {
            console.error(error);

        }
    }



    useEffect(() => {
        fetchClientInfo()
        fetchClientAssignProperties()

    }, [])

    useEffect(() => {

        const fetchPropertiesById = async () => {
            try {
                const requests = propertId.map(p =>
                    axios.get(`http://localhost:4500/getproperties/${p.property_id}`)
                );

                const responses = await Promise.all(requests);

                const formatted = responses.map(r => r.data);
                setPropertiesDetail(formatted);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPropertiesById();
    }, [propertId]);


    const assignProperties = async () => {
        try {
            const res = await axios.get(`http://localhost:4500/getproperties`)
            const available = (res.data || []).filter(
                (p) => (p.status || "").toLowerCase() === "available"
            );
            setProperties(available);
        } catch (error) {
            console.error(error);

        }
    }

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.property_id || !form.client_id || !form.assigned_by) {
            setError("Property, client, and assigned_by are required");
            return;
        }

        try {
            await axios.post(`http://localhost:4500/addassignedproperty`, {
                property_id: form.property_id,
                client_id: Number(form.client_id),
                assigned_by: Number(form.assigned_by),
                amount: form.amount || null,
                details: form.details || null,
                assigned_at: form.assigned_at || new Date().toISOString(),
            });

            alert("Property assigned successfully ✔");
            await fetchClientAssignProperties();
            await assignProperties();
            setShowSaleModal(false)
            setForm({
                property_id: "",
                client_id: id,
                assigned_by: localStorage.getItem("admin_id") || "",
                amount: "",
                details: "",
                assigned_at: "",
            });
        } catch (err) {
            console.error("Submit error:", err);
            setError("Failed to assign property");
        }
    };

    useEffect(() => {
        assignProperties()
    }, [])


    const sigCanvas = useRef(null);

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    const toggleProperty = (id) => {
        setOpenProperty(openProperty === id ? null : id);
    };

    return (
        <>

            <div className="client-section">
                <div className="client-header">
                    <h2 className="client-title">Client Details</h2>
                    <button className="client-add-sale-btn" onClick={() => setShowSaleModal(true)}>
                        Add Sale
                    </button>
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
                                    propertiesDetail.map((p, i) => (
                                        <li key={i}>{p.title}  {p.address} </li>
                                    ))
                                ) : (
                                    <li>No Properties Assigned</li>
                                )}

                            </ul>
                        </div>
                    </div>

                    <div className="client-main">
                        <div className="client-sale-box">
                            <h4 className="client-box-title">Sales & Payments</h4>
                            {propertiesDetail.length > 0 ? (
                                propertiesDetail.map((p, i) => (
                                    <div className="client-property-sale" onClick={() => toggleProperty(p.id)} key={i}>
                                        <div className="client-property-header">
                                            <span className="client-property-name">{p.title}</span>
                                            <span className="client-property-date">{p.createdAt}</span>
                                        </div>

                                        <p className="client-sale-price">${p.price}</p>

                                        <div className="client-sale-plan">
                                            <p className="client-sale-note">{p.description}.</p>
                                            {openProperty === 1 ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>

                                        {openProperty === p.id && (
                                            <div className="client-transaction-box">
                                                <div className="client-transaction-header">
                                                    <h5>Transaction History</h5>
                                                    <button
                                                        className="client-add-payment-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowPaymentModal(true);
                                                        }}
                                                    >
                                                        Add Payment
                                                    </button>
                                                </div>

                                                <table className="client-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Due Date</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                            <th>Payment Date</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>February 1, 2024</td>
                                                            <td>$6,250</td>
                                                            <td><span className="client-badge client-paid">Paid</span></td>
                                                            <td>February 1, 2024</td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td>March 1, 2024</td>
                                                            <td>$6,250</td>
                                                            <td><span className="client-badge client-paid">Paid</span></td>
                                                            <td>February 28, 2024</td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td>April 1, 2024</td>
                                                            <td>$6,250</td>
                                                            <td><span className="client-badge client-pending">Pending</span></td>
                                                            <td>N/A</td>
                                                            <td>
                                                                <button
                                                                    className="client-mark-paid-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowMarkPaidModal(true);
                                                                    }}
                                                                >
                                                                    Mark as Paid
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <li> No Properties Awailable</li>
                            )}


                        </div>
                    </div>
                </div>
            </div>

            {/* PAYMENT MODAL */}
            {showPaymentModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal better-modal mark-paid-modal">
                        <div className="payment-modal-header">
                            <h3>Record a New Payment</h3>
                            <button className="payment-close-btn" onClick={() => setShowPaymentModal(false)}>✕</button>
                        </div>

                        <label>Property</label>
                        <select className="payment-input">
                            <option>101 Forest Path</option>
                            <option>456 Oakwood Lane</option>
                        </select>

                        <label>Amount</label>
                        <input className="payment-input" type="number" placeholder="10000" />

                        <label>Payment Method</label>
                        <div className="payment-methods">
                            <label><input type="radio" name="method" defaultChecked /> Cash</label>
                            <label><input type="radio" name="method" /> Bank Transfer</label>
                            <label><input type="radio" name="method" /> Card</label>
                        </div>

                        <textarea className="payment-textarea" placeholder="Description (Optional)"></textarea>

                        <div className="payment-modal-actions">
                            <button className="payment-cancel" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="payment-save">Save Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SALE MODAL */}
            {showSaleModal && (

                <div className="payment-modal-overlay">
                    <div className="payment-modal better-modal mark-paid-modal">
                        <div className="payment-modal-header">
                            <h3>Record a New Sale</h3>
                            <button className="payment-close-btn" onClick={() => setShowSaleModal(false)}>✕</button>
                        </div>
                        {error && (
                            <div style={{ color: "crimson", marginBottom: 10, fontWeight: 500 }}>
                                {error}
                            </div>
                        )}
                        <select
                            name="property_id"
                            value={form.property_id}
                            onChange={handleChange}
                            required
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
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="Amount"
                        />
                        <input
                            className="payment-input"
                            type="datetime-local"
                            name="assigned_at"
                            value={form.assigned_at}
                            onChange={handleChange}
                        />

                        <textarea
                            className="payment-textarea"
                            name="details"
                            value={form.details}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Details"
                        />

                        <div className="payment-modal-actions">
                            <button className="payment-cancel" onClick={() => setShowSaleModal(false)}>Cancel</button>
                            <button className="payment-save" onClick={handleSubmit}>Save Sale</button>
                        </div>

                    </div>
                </div>
            )}

            {/* MARK AS PAID MODAL */}
            {showMarkPaidModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal better-modal mark-paid-modal">

                        <div className="payment-modal-header">
                            <h3>{showRejectComment ? "Reject Payment" : "Confirm Payment"}</h3>
                            <button className="payment-close-btn" onClick={() => {
                                setShowRejectComment(false);
                                setShowMarkPaidModal(false);
                            }}>✕</button>
                        </div>

                        {!showRejectComment && (
                            <>
                                <input className="payment-input" type="date" />
                                <input className="payment-input" type="text" value="Bob Williams" readOnly />
                                <input className="payment-input" type="text" value="456 Oakwood Lane" readOnly />
                                <input className="payment-input" type="text" value="$6,250" readOnly />

                                <label>Signature</label>
                                <SignaturePad ref={sigCanvas} penColor="black" canvasProps={{ className: "signature-pad" }} />
                                <button className="signature-clear-btn" onClick={handleClearSignature}>Clear</button>
                            </>
                        )}

                        {showRejectComment && (
                            <textarea className="payment-textarea" placeholder="Why rejecting?"></textarea>
                        )}

                        <div className="payment-modal-actions">
                            {!showRejectComment ? (
                                <>
                                    <button className="payment-cancel reject-btn" onClick={() => setShowRejectComment(true)}>Reject</button>
                                    <button className="payment-save">Confirm & Mark Paid</button>
                                </>
                            ) : (
                                <>
                                    <button className="payment-cancel" onClick={() => setShowRejectComment(false)}>Back</button>
                                    <button className="payment-save reject-submit-btn">Submit Rejection</button>
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
