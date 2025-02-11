import React, { useState } from "react";
import "../styles/VerificationModal.css";

function VerificationModal({ isOpen, onClose, onVerify }) {
  const [otp, setOtp] = useState(Array(6).fill(""));

  const handleChange = (value, index) => {
    if (value.length > 1) return; // Restrict input to a single character
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically focus next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleVerify = () => {
    onVerify(otp.join("")); // Pass the OTP to the parent component
    onClose(); // Close the modal
  };

  return isOpen ? (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Enter Customer Verification Code</h3>
        <div className="otp-inputs">
          {otp.map((value, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength="1"
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <div className="modal-actions">
          <button className="verify-button" onClick={handleVerify}>
            Verify
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default VerificationModal;
