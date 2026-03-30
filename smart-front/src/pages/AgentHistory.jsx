import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "./AgentHistory.css"; // reuse dashboard styles

export default function AgentHistory() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4; // MAX 4 per page as requested

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_PICKUP_AGENT") {
      navigate("/login");
    } else {
      fetchRequests();
    }
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      let url = "/api/pickup-agent/dashboard/requests";
      if (statusFilter && statusFilter !== "ALL") {
        url += `?status=${statusFilter}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setRequests(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch pickup history");
    }
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchTerm("");
    setCurrentPage(1);
    fetchRequests();
  };

  /* ================= FILTER + SEARCH ================= */
  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.deviceType?.toLowerCase().includes(term) ||
      req.brand?.toLowerCase().includes(term) ||
      req.model?.toLowerCase().includes(term)
    );
  });

  /* ================= PAGINATION ================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="agent-dashboard container py-5">
      {/* ================= HEADER ================= */}
      <div className="agent-history-header mb-3">
  <button
    className="btn btn-light back-btn"
    onClick={() => navigate(-1)}
  >
    ← Back
  </button>
</div>


      {/* ================= TABLE ================= */}
      <div className="table-responsive shadow rounded-4">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Device</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Address</th>
              <th>Pickup Scheduled</th>
              
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No requests found
                </td>
              </tr>
            ) : (
              currentRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.deviceType}</td>
                  <td>{req.brand}</td>
                  <td>{req.model}</td>
                  <td>{req.address}</td>
                  <td>{req.pickupScheduledAt || "-"}</td>
                  
                  <td>
                    <span
                      className={`status-badge ${req.status.toLowerCase()}`}
                    >
                      {req.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
