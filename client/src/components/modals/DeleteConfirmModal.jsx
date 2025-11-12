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
      toast.success("Code matched");
      onConfirm();
    } else {
      toast.error("Wrong code");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h3>Confirm Delete</h3>

        <p>Enter this code to confirm:</p>

        <div style={{
          fontSize: "22px",
          fontWeight: "bold",
          background: "#eee",
          padding: "8px",
          textAlign: "center",
          borderRadius: "6px",
          letterSpacing: "4px",
          marginBottom: "10px"
        }}>
          {randomCode}
        </div>

        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Enter code"
          maxLength={4}
          style={{
            width: "100%",
            padding: "8px",
            textAlign: "center",
            letterSpacing: "3px"
          }}
        />

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-around", gap: 10 }}>
          <button className="payment-cancel" onClick={onClose}>Cancel</button>
          <button className="payment-save" onClick={handleDelete}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
