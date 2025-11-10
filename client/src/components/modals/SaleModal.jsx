// src/components/modals/SaleModal.jsx
import React from "react";

export default function SaleModal({ properties, assignedForm, onChange, onClose, onSave, error }) {
  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal better-modal mark-paid-modal">
        <div className="payment-modal-header">
          <h3>Record a New Sale</h3>
          <button className="payment-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>}

        <select name="property_id" value={assignedForm.property_id} onChange={onChange}>
          <option value="">-- select property --</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.title} — ₹{p.price}</option>)}
        </select>

        <input className="payment-input" name="amount" value={assignedForm.amount} onChange={onChange} placeholder="Amount" />

        <input className="payment-input" type="datetime-local" name="assigned_at" value={assignedForm.assigned_at} onChange={onChange} />

        <textarea className="payment-textarea" name="details" value={assignedForm.details} onChange={onChange} placeholder="Details" />

        <div className="payment-modal-actions">
          <button className="payment-cancel" onClick={onClose}>Cancel</button>
          <button className="payment-save" onClick={onSave}>Save Sale</button>
        </div>
      </div>
    </div>
  );
}
