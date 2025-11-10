// src/components/modals/MarkPaidModal.jsx
import React from "react";
import SignaturePad from "react-signature-canvas";

export default function MarkPaidModal({
  sigCanvasRef,
  showReject,
  setShowReject,
  markConfirmedAt,
  setMarkConfirmedAt,
  clientInfo,
  selectedProperty,
  selectedPayment,
  onClose,
  onConfirm,
  onRejectSubmit,
  markError,
  setRejectReason,
  rejectReason,
}) {
  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal better-modal mark-paid-modal">
        <div className="payment-modal-header">
          <h3>{showReject ? "Reject Payment" : "Confirm Payment"}</h3>
          <button className="payment-close-btn" onClick={onClose}>✕</button>
        </div>

        {markError && <div style={{ color: "crimson", marginBottom: 8 }}>{markError}</div>}

        {!showReject ? (
          <>
            <label>Confirm Date & Time</label>
            <input className="payment-input" type="datetime-local" value={markConfirmedAt} onChange={(e) => setMarkConfirmedAt(e.target.value)} />

            <label>Client</label>
            <input className="payment-input" type="text" value={clientInfo.name || ""} readOnly />

            <label>Property</label>
            <input className="payment-input" type="text" value={selectedProperty?.title || ""} readOnly />

            <label>Amount</label>
            <input className="payment-input" type="text" value={`₹${selectedPayment?.amount || ""}`} readOnly />

            <label>Signature</label>
            <SignaturePad ref={sigCanvasRef} penColor="black" canvasProps={{ className: "signature-pad" }} />
            <button className="signature-clear-btn" onClick={() => sigCanvasRef.current && sigCanvasRef.current.clear()}>Clear</button>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="payment-cancel reject-btn" onClick={() => setShowReject(true)}>Reject</button>
              <button className="payment-save" onClick={onConfirm}>Confirm & Mark Paid</button>
            </div>
          </>
        ) : (
          <>
            <label>Rejection Reason</label>
            <textarea className="payment-textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Why are you rejecting this payment?" />

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="payment-cancel" onClick={() => setShowReject(false)}>Back</button>
              <button className="payment-save reject-submit-btn" onClick={() => onRejectSubmit(rejectReason)}>Submit Rejection</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
