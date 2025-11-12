// src/components/admin/InvoiceModal.jsx
import React, { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { toast } from "react-toastify";
import api from "../../api/axiosInstance";
import "../../assets/css/admin/invoice.css";

function InvoiceModal({ payment, clientInfo, property, adminId, onClose, refreshPayments }) {
  const sigCanvas = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [confirmDate, setConfirmDate] = useState(new Date().toISOString().slice(0, 16));
  const API_ROOT = "http://localhost:4500";

  const handleConfirm = async () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Please sign to confirm");
      return;
    }

    setLoading(true);
    try {
      let canvasEl;
      try {
        canvasEl = sigCanvas.current.getTrimmedCanvas();
      } catch {
        canvasEl = sigCanvas.current.getCanvas();
      }
      const signatureDataURL = canvasEl.toDataURL("image/png");

      const payload = {
        payment_id: payment.id,
        client_name: clientInfo.name,
        property_title: property.title,
        property_address: property.address,
        amount: payment.amount,
        confirmed_by: adminId,
        confirmed_at: confirmDate.replace("T", " "),
        signatureDataURL,
      };

      const { data } = await api.post(`/generateInvoicePdf`, payload);

      // Only show success toast — NO auto-download
      toast.success("Invoice generated successfully! Check your backend or email.");

      sigCanvas.current.clear();
      onClose();
      refreshPayments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("Rejection reason required");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("payment_id", payment.id);
      fd.append("confirmed_by", adminId);
      fd.append("status", "rejected");
      fd.append("reject_reason", rejectNote);
      fd.append("confirmed_at", confirmDate.replace("T", " ") || new Date().toISOString());

      await api.post(`/addpaymentconfirmation`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Payment rejected");
      onClose();
      refreshPayments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-overlay">
      <div className="invoice-modal">
        {/* COMPANY HEADER */}
        <div className="invoice-company-header">
          <div className="company-info">
            <div className="logo-placeholder">
              <span>LOGO</span>
            </div>
            <div>
              <h3>Your Real Estate Co.</h3>
              <p>Mumbai, India</p>
            </div>
          </div>
          <div className="invoice-meta">
            <h2>INVOICE</h2>
            <p className="invoice-id">#{String(payment.id).padStart(5, "0")}</p>
          </div>
        </div>

        {/* INVOICE CONTENT */}
        <div className="invoice-content">
          {!showReject ? (
            <>
              {/* BILL TO & PROPERTY */}
              <div className="invoice-grid">
                <div className="invoice-section">
                  <h4>Bill To</h4>
                  <p className="client-name">{clientInfo.name}</p>
                  <p className="client-contact">{clientInfo.email}</p>
                  <p className="client-contact">{clientInfo.number}</p>
                </div>

                <div className="invoice-section">
                  <h4>Property</h4>
                  <p className="property-title">{property.title}</p>
                  <p className="property-address">{property.address}</p>
                </div>
              </div>

              {/* PAYMENT DETAILS */}
              <div className="invoice-details">
                <div className="detail-row">
                  <span>Amount</span>
                  <strong className="amount">₹{Number(payment.amount).toLocaleString("en-IN")}</strong>
                </div>
                <div className="detail-row">
                  <span>Confirm Date & Time</span>
                  <input
                    type="datetime-local"
                    value={confirmDate}
                    onChange={(e) => setConfirmDate(e.target.value)}
                    className="datetime-input"
                  />
                </div>
              </div>

              {/* SIGNATURE */}
              <div className="signature-section">
                <label>Client Signature</label>
                <div className="signature-pad-wrapper">
                  <SignaturePad
                    ref={sigCanvas}
                    penColor="#1e40af"
                    canvasProps={{ className: "signature-canvas" }}
                  />
                  <button className="clear-btn" onClick={() => sigCanvas.current.clear()}>
                    Clear Signature
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="invoice-actions">
                <button className="reject-btn" onClick={() => setShowReject(true)}>
                  Reject Payment
                </button>
                <button
                  className="confirm-btn"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Confirm & Generate"}
                </button>
              </div>
            </>
          ) : (
            <div className="reject-section">
              <h4>Reject Payment</h4>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Please explain why this payment is being rejected..."
                className="reject-textarea"
              />
              <div className="reject-actions">
                <button className="back-btn" onClick={() => setShowReject(false)}>
                  Back to Confirm
                </button>
                <button
                  className="submit-reject-btn"
                  onClick={handleReject}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DARK CLOSE BUTTON – TOP RIGHT CORNER */}
        <button className="invoice-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default InvoiceModal;