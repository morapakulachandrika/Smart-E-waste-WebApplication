import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { getPendingRequests, updateRequestStatus } from "../services/requestService";
import "./UserEwasteHistory.css";

export default function AdminEwasteRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const navigate = useNavigate();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getPendingRequests();
      const data = Array.isArray(res.data) ? res.data : [];
      // Sort by pickupScheduledAt instead of createdAt
      data.sort((a, b) => new Date(b.pickupScheduledAt) - new Date(a.pickupScheduledAt));
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    setActionId(id);
    try {
      await updateRequestStatus(id, status);
      await loadRequests();
    } catch (err) {
      alert("Failed to update request status");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>← Back</button>
      <h3 className="mb-4">⏳ Pending E-Waste Requests</h3>

      {requests.length === 0 ? (
        <p className="text-muted">No pending requests</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle table-striped">
            <thead className="table-success">
              <tr>
                <th>User</th>
                <th>Device</th>
                <th>Condition</th>
                <th>Pickup Address</th>
                <th>Contacts</th>
                <th>Images</th>
                <th>Pickup Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <strong>User #{r.userId}</strong><br />
                    <small className="text-muted">Req ID: #{r.id}</small>
                  </td>
                  <td>
                    <strong>{r.deviceType}</strong><br />
                    <small>{r.brand} {r.model}</small>
                  </td>
                  <td>{r.conditionStatus}</td>
                  <td>
                    <small>{r.address}</small><br />
                    <em className="text-muted">{r.landmark}</em>
                  </td>
                  <td>
                    {r.contactNumber}<br />
                    <small className="text-muted">{r.alternateContact}</small>
                  </td>
                  <td>
                    {r.images && r.images.length > 0 ? (
                      r.images.map((img, i) => (
                        <img
                          key={i}
                          src={`http://localhost:9091/${img.replace("\\","/")}`}
                          alt="ewaste"
                          width="45"
                          className="rounded me-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => setPreviewImg(`http://localhost:9091/${img.replace("\\","/")}`)}
                        />
                      ))
                    ) : <small>No image</small>}
                  </td>
                  <td>
                    {r.pickupScheduledAt
                      ? new Date(r.pickupScheduledAt).toLocaleString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td>
                    <button
                      disabled={actionId === r.id}
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleStatusChange(r.id, "ACCEPTED")}
                    >
                      ✔ Approve
                    </button>
                    <button
                      disabled={actionId === r.id}
                      className="btn btn-sm btn-danger"
                      onClick={() => handleStatusChange(r.id, "REJECTED")}
                    >
                      ✖ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewImg && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewImg(null)}
        >
          <img src={previewImg} alt="full" className="modal-img" />
        </div>
      )}
    </div>
  );
}
