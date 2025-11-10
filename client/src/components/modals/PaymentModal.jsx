// src/components/modals/PaymentModal.jsx
import React from "react";

export default function PaymentModal({ isEditing, editingPayment, clientInfo, selectedProperty, paymentForm, onChange, onClose, onSave, error }) {
  // onSave should receive a payload object ready for API
  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      property_id: paymentForm.property_id,
      client_id: Number(paymentForm.client_id || clientInfo.id),
      amount: Number(paymentForm.amount) || null,
      payment_method: paymentForm.payment_method || "cash",
      paid_at: paymentForm.paid_at ? paymentForm.paid_at.replace("T", " ") : new Date().toISOString(),
      notes: paymentForm.details || null,
      status: editingPayment?.status || "pending",
      backgroundColor: "yellow",
    };
    onSave(payload);
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal better-modal mark-paid-modal">
        <div className="payment-modal-header">
          <h3>{isEditing ? "Edit Payment" : "Record a New Payment"}</h3>
          <button className="payment-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <p style={{ color: "crimson", fontWeight: 500 }}>{error}</p>}

        <label>Client</label>
        <input className="payment-input" value={clientInfo.name || ""} readOnly style={{ backgroundColor: "#f5f5f5" }} />

        <label>Property</label>
        <input className="payment-input" value={selectedProperty?.title || ""} readOnly style={{ backgroundColor: "#f5f5f5" }} />

        <label>Amount</label>
        <input className="payment-input" type="number" name="amount" value={paymentForm.amount} onChange={onChange} placeholder="Enter amount" />

        <label>Payment Method</label>
        <select className="payment-input" name="payment_method" value={paymentForm.payment_method} onChange={onChange}>
          <option value="">-- select --</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="card">Card</option>
        </select>

        <label>Payment Date</label>
        <input className="payment-input" type="datetime-local" name="paid_at" value={paymentForm.paid_at} onChange={onChange} />

        <textarea className="payment-textarea" name="details" value={paymentForm.details} onChange={onChange} placeholder="Description (Optional)" />

        <div className="payment-modal-actions">
          <button className="payment-cancel" onClick={onClose}>Cancel</button>
          <button className="payment-save" onClick={handleSave}>{isEditing ? "Update Payment" : "Save Payment"}</button>
        </div>
      </div>
    </div>
  );
}
