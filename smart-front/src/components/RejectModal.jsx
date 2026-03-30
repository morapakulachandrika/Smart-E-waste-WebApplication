import React, { useState } from "react";
import "./RejectModal.css";

export default function RejectModal({ show, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason("");
  };

  return (
    <div className="reject-modal-backdrop">
      <div className="reject-modal-card">
        <h4 className="mb-3">❌ Rejection Reason</h4>

        <textarea
          className="form-control mb-3"
          rows="4"
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleSubmit}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
