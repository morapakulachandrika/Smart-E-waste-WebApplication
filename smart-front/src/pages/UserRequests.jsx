import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import BackButton from "../components/BackButton";
import { getAllUserRequests } from "../services/authService";

export default function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllUserRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setMsg(e.response?.data?.error || "Error loading requests");
    }
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <BackButton />
      <h2 className="fw-bold mb-4" style={{ color: "#2e7d32" }}>
        📦 User E-Waste Requests
      </h2>

      {msg && <div className="alert alert-info">{msg}</div>}

      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <p className="text-muted">No user requests found.</p>
      ) : (
        <div className="list-group">
          {requests.map((r) => (
            <div
              key={r.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              style={{ borderRadius: "10px", padding: "15px", background: "#f9fff9" }}
            >
              <div>
                <div className="fw-bold">{r.userName}</div>
                <div className="text-muted">{r.email}</div>
                <div className="text-muted small">{r.itemName} - {r.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
