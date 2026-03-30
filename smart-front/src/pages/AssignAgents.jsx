import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Loader from "../components/Loader";
import "./AssignAgents.css";

export default function AssignAgents() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
const [limitMessage, setLimitMessage] = useState("");


  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= FETCH DATA ================= */
  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/requests/admin/requests/assignable");
      setRequests(res.data || []);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get("/api/pickup-agent/admin/all");
      setAgents(res.data.filter((a) => a.status === "ACTIVE"));
    } catch {
      toast.error("Failed to load agents");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchAgents()]);
      setLoading(false);
    };
    load();
  }, []);

  /* ================= SORT BY PICKUP DATE ================= */
  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(a.pickupScheduledAt) - new Date(b.pickupScheduledAt)
    );
  }, [requests]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);

  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= ASSIGN / CHANGE AGENT ================= */
  const assignAgent = async () => {
    if (!selectedAgent) return toast.warning("Please select an agent");

    try {
      await api.post("/api/pickup-agent/admin/assign", null, {
        params: {
          requestId: selectedRequest.id,
          agentId: selectedAgent,
        },
      });
      toast.success("Agent updated successfully");
      setShowModal(false);
      fetchRequests();
      } catch (error) {
    const message =
      error?.response?.data?.message ||
      "Agent has reached maximum active pickup limit (5)";

    setLimitMessage(message);
    setShowLimitModal(true);
  }

  };

  if (loading) return <Loader />;

  return (
    <div className="assign-agents-page">

      <div className="d-flex justify-content-between align-items-center mb-4">
  <button
    className="btn btn-outline-primary"
    onClick={() => navigate("/admin/ewaste-management")}
  >
    ⬅ Back
  </button>

  <button
    className="btn btn-outline-dark"
    onClick={() => navigate("/admin/assignment-history")}
  >
    📋 Assignment History
  </button>
</div>


      <h2 className="assign-heading">Pickup Agent Assignment</h2>

      <div className="assign-table-card">
        <div className="table-responsive">
          

          <table className="table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Device</th>
                <th>Qty</th>
                <th>Pickup Date</th>
                <th>Address</th>
                <th> Agent</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRequests.map((r) => (
                <tr key={r.id}>
                  <td className="fw-bold">{r.id}</td>

                  <td>
                    <strong>{r.deviceType}</strong>
                    <br />
                    <small className="text-muted">
                      {r.brand} {r.model}
                    </small>
                  </td>

                  <td>{r.quantity}</td>

                  <td>
  {new Date(r.pickupScheduledAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

                  <td className="address-cell">
                    {r.address}
                  </td>

                  <td>
                    {r.pickupAgent ? (
                      <span className="agent-chip">
                        {r.pickupAgent.name}
                        <small> (ID: {r.pickupAgent.id})</small>
                      </span>
                    ) : (
                      <span className="text-muted">Not Assigned</span>
                    )}
                  </td>

                  <td>
                    <button
                      className={`btn btn-sm ${
                        r.pickupAgent ? "btn-outline-warning" : "btn-primary"
                      }`}
                      onClick={() => {
                        setSelectedRequest(r);
                        setSelectedAgent("");
                        setShowModal(true);
                      }}
                    >
                      {r.pickupAgent ? "Change Agent" : "Assign"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
  <div className="pagination-box">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="clean-modal-overlay">
          <div className="clean-modal">
            <h5 className="mb-3">
              {selectedRequest.pickupAgent ? "Change Agent" : "Assign Agent"}
              <br />
              <small className="text-muted">
                Request {selectedRequest.id}
              </small>
            </h5>

            <select
              className="form-select mb-4"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Select Pickup Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>

            <div className="text-end">
              <button
                className="btn btn-light me-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={assignAgent}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= LIMIT REACHED MODAL ================= */}
{showLimitModal && (
  <div className="clean-modal-overlay">
    <div className="clean-modal text-center">
      <h5 className="mb-3 text-danger">
        ⚠️ Assignment Not Allowed
      </h5>

      <p className="mb-4">{limitMessage}</p>

      <button
        className="btn btn-primary"
        onClick={() => setShowLimitModal(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

    </div>
  );
}
