import React, { useState, useEffect } from "react";
import { CgTrash } from "react-icons/cg";
import { HiXMark } from "react-icons/hi2";

const DeleteModal = ({ title, onCancel, onDelete }) => {
  const [captcha, setCaptcha] = useState("");
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState("");

  // Generate a new CAPTCHA when the modal opens
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const randomCaptcha = Math.floor(10000 + Math.random() * 90000).toString(); // Generates a 5-digit random number
    setCaptcha(randomCaptcha);
    setUserInput(""); // Clear input field when new CAPTCHA is generated
    setError(""); // Reset error message
  };

  const handleCaptchaChange = (e) => {
    setUserInput(e.target.value);
    setError("");
  };

  const handleDelete = () => {
    if (userInput === captcha) {
      onDelete(); // Call the delete function passed as a prop
    } else {
      setError("Incorrect CAPTCHA value. Please try again.");
    }
  };

  return (
    <div className="delete-modal-container">
      <div className="modal">
        <h6>Delete {title}</h6>
        <div>
          <label htmlFor="captcha">
            If you want to delete, enter <strong>{captcha}</strong>
          </label>
          <input
            type="text"
            id="captcha"
            name="captcha"
            placeholder="Enter captcha code..."
            value={userInput}
            onChange={handleCaptchaChange}
          />
          {error && <span className="error-message">{error}</span>}
        </div>
        <div className="modal-container-buttons">
          <button className="cancel-btn" onClick={onCancel}>
            <HiXMark /> Cancel
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            <CgTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
