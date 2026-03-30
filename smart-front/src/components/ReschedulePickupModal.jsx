import React, { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "./ReschedulePickupModal.css";

export default function ReschedulePickupModal({ request, onClose, onSuccess }) {
  const [newPickupDate, setNewPickupDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!newPickupDate || !reason.trim()) {
      setError("Please select a new pickup date and provide a reason.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        newPickupDate: new Date(newPickupDate).toISOString(),
        reason: reason.trim()
      };

      const res = await api.post(
        `/api/ewaste/reschedule/${request.id}`,
        payload
      );

  

      // Close modal
      onClose();

      // Update parent (dashboard/cards)
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error("Reschedule error:", err.response?.data);

      // ✅ SAFELY EXTRACT STRING MESSAGE
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to submit reschedule request. Try again.";

      setError(message);     // ✅ string only
      toast.error(
  message,
  { toastId: "reschedule-error" }
);
  // ✅ string only

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="res-modal-backdrop">
      <div className="res-modal">
        <div className="res-modal-header">
          <h2>🔁 Reschedule Pickup</h2>
          <button className="res-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="res-modal-body">
          <div className="res-info">
            <p><strong>Request ID:</strong> {request.id}</p>
            <p>
              <strong>Current Pickup:</strong>{" "}
              {request.pickupScheduledAt
                ? new Date(request.pickupScheduledAt).toLocaleString()
                : "Not Scheduled"}
            </p>
          </div>

          <div className="res-field">
            <label>New Pickup Date</label>
            <input
              type="datetime-local"
              value={newPickupDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setNewPickupDate(e.target.value)}
              required
            />
          </div>

          <div className="res-field">
            <label>Reason</label>
            <textarea
              rows="3"
              placeholder="Brief reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* ✅ SAFE ERROR RENDER */}
          {error && <p className="res-error">{error}</p>}

          <div className="res-actions">
            <button
              type="button"
              className="res-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="res-submit-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
