import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const [randomCode, setRandomCode] = useState("");
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setRandomCode(code);
      setInputCode("");
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (inputCode.trim() === randomCode) {
      toast.success("Code matched ✅");
      onConfirm();
    } else {
      toast.error("Wrong code ❌ — deletion cancelled");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal better-modal mark-paid-modal">
        <div className="payment-modal-header">
          <h3>Confirm Delete</h3>
          <button className="payment-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          <p style={{ marginBottom: 8 }}>
            To delete this payment, enter the verification code below 👇
          </p>

          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: "bold",
              letterSpacing: "4px",
              textAlign: "center",
              background: "#f3f3f3",
              borderRadius: "8px",
              padding: "8px 0",
              marginBottom: "10px",
            }}
          >
            {randomCode}
          </div>

          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter the code here"
            maxLength={4}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginBottom: "12px",
              textAlign: "center",
              fontSize: "1.1rem",
              letterSpacing: "3px",
            }}
          />

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="payment-cancel" onClick={onClose}>Cancel</button>
            <button className="payment-save" onClick={handleDelete}>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
