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

  // ✅ Confirm & generate invoice
  const handleConfirm = async () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Signature required");
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
      if (data?.file) {
        const link = document.createElement("a");
        link.download = `invoice_${payment.id}.pdf`;
        link.click();
      }

      toast.success("Invoice generated successfully");
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

  // ❌ Reject payment
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
      fd.append("confirmed_at", confirmDate.replace("T", " "));

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
        <div className="invoice-header">
          <h3>{showReject ? "Reject Payment" : "Confirm Payment & Generate Invoice"}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {!showReject ? (
          <div className="invoice-body">
            <p><strong>Client:</strong> {clientInfo.name}</p>
            <p><strong>Property:</strong> {property.title}</p>
            <p><strong>Amount:</strong> ₹{payment.amount}</p>
            <p><strong>Date:</strong> {new Date(confirmDate).toLocaleString()}</p>

            <div className="signature-box">
              <label>Signature:</label>
              <SignaturePad ref={sigCanvas} penColor="black" canvasProps={{ className: "signature-canvas" }} />
              <button onClick={() => sigCanvas.current.clear()}>Clear</button>
            </div>

            <div className="invoice-footer">
              <button onClick={() => setShowReject(true)} className="reject-btn">
                Reject
              </button>
              <button onClick={handleConfirm} disabled={loading}>
                {loading ? "Saving..." : "Confirm & Save Invoice"}
              </button>
            </div>
          </div>
        ) : (
          <div className="invoice-body">
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="reject-textarea"
            />
            <div className="invoice-footer">
              <button onClick={() => setShowReject(false)}>Back</button>
              <button onClick={handleReject} disabled={loading}>
                {loading ? "Rejecting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceModal;
