import React from "react";
import "../styles/AlertModal.css";

function AlertModal({ isOpen, message, onConfirm, onCancel }) {
  return isOpen ? (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p className="alert-message">{message}</p>
        <div className="modal-actions">
          <button className="confirm-button" onClick={onConfirm}>
            Yes
          </button>
          <button className="cancel-button" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default AlertModal;
