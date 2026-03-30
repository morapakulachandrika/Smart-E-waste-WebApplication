import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import "./AdminAssignmentHistory.css";

export default function AdminAssignmentHistory() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [search, setSearch] = useState("");

  // pagination for agents
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // pagination for requests
  const [requestPage, setRequestPage] = useState(1);
  const REQUESTS_PER_PAGE = 5;

  const statusMap = {
    ASSIGNED: { text: "Assigned", className: "assigned" },
    IN_PROGRESS: { text: "In Progress", className: "progress" },
    COMPLETED: { text: "Completed", className: "completed" },
    PENDING: { text: "Pending", className: "pending" },
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/api/pickup-agent/admin/assigned");
      setAgents(res.data || []);
    } catch (e) {
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  /* 🔍 SEARCH */
  const filteredAgents = agents.filter((a) =>
    a.agent.name.toLowerCase().includes(search.toLowerCase())
  );

  /* 📄 AGENT PAGINATION */
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAgents = filteredAgents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* 📄 REQUEST PAGINATION */
  const totalRequestPages =
    Math.ceil(selectedAgent?.requests.length / REQUESTS_PER_PAGE) || 1;
  const startReqIndex = (requestPage - 1) * REQUESTS_PER_PAGE;
  const paginatedRequests =
    selectedAgent?.requests.slice(
      startReqIndex,
      startReqIndex + REQUESTS_PER_PAGE
    ) || [];

  return (
    <div className="admin-history-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>Pickup Assignment History</h2>

      {/* 🔍 Search */}
      {!selectedAgent && (
        <input
          className="search-input"
          placeholder="Search agent name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      )}

      {/* ================= AGENT LIST ================= */}
      {!selectedAgent && (
        <>
          <div className="agent-grid">
            {paginatedAgents.map((a) => (
              <div
                key={a.agent.id}
                className="agent-card"
                onClick={() => {
                  setSelectedAgent(a);
                  setRequestPage(1); // reset request pagination
                }}
              >
                <h3>{a.agent.name}</h3>
                <p>{a.agent.email}</p>
                <span>Total Requests: {a.requests.length}</span>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ================= REQUEST TABLE ================= */}
      {selectedAgent && (
        <>
          <button className="btn-back" onClick={() => setSelectedAgent(null)}>
            ← Back to Agents
          </button>

          <h3>Agent: {selectedAgent.agent.name}</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Device</th>
                  <th>Address</th>
                  <th>Pickup Date</th>
                  <th>Pickup Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((r, i) => (
                  <tr key={r.id}>
                    <td>{startReqIndex + i + 1}</td>
                    <td>
                      {r.deviceType} - {r.brand} {r.model}
                    </td>
                    <td>{r.address}</td>

                    {/* 📅 Pickup Date */}
                    <td>
                      {r.pickupScheduledAt
                        ? new Date(r.pickupScheduledAt).toLocaleString("en-IN")
                        : "-"}
                    </td>

                    {/* 🚚 Pickup Status */}
                    <td>
                      <span
                        className={`pickup ${
                          statusMap[r.pickupStatus || "PENDING"].className
                        }`}
                      >
                        {statusMap[r.pickupStatus || "PENDING"].text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Request pagination */}
          {totalRequestPages > 1 && (
            <div className="pagination">
              <button
                disabled={requestPage === 1}
                onClick={() => setRequestPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>
                Page {requestPage} of {totalRequestPages}
              </span>
              <button
                disabled={requestPage === totalRequestPages}
                onClick={() => setRequestPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
