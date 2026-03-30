import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // your axios instance
import { toast } from "react-toastify";
import "./AgentDashboard.css"; // we'll create some attractive CSS

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
  total: 0,
  assigned: 0,
  inProgress: 0,
  completed: 0,
  today: 0, // NEW
});


  const [requests, setRequests] = useState([]);
  const [activeStatus, setActiveStatus] = useState(""); // currently selected card


  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_PICKUP_AGENT") {
      navigate("/login");
    } else {
      fetchCounts();
      fetchRequests(); // fetch all initially
    }
  }, [navigate]);

  const fetchCounts = async () => {
    try {
      const res = await api.get("/api/pickup-agent/dashboard/counts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCounts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch dashboard counts");
    }
  };

  const fetchRequests = async (status = "") => {
    try {
      let url = "/api/pickup-agent/dashboard/requests";
      if (status) url += `?status=${status}`;
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data);
setCounts((prev) => ({
  ...prev,
  today: calculateTodaysPickups(res.data),
}));
setActiveStatus(status);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch requests");
    }
  };

  const calculateTodaysPickups = (data) => {
  const today = new Date().toISOString().split("T")[0];
  return data.filter((req) => {
    const pickupDate =
      req.rescheduledPickupAt?.split("T")[0] ||
      req.pickupScheduledAt?.split("T")[0];
    return (
      pickupDate === today &&
      (req.status === "ASSIGNED" || req.status === "IN_PROGRESS")
    );
  }).length;
};



  const handleStatusUpdate = async (requestId, newStatus) => {
  try {
    await api.patch(
      `/api/pickup-agent/request/${requestId}/status`,
      { pickupStatus: newStatus },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    toast.success(`Request marked as ${newStatus.replace("_", " ")}`);

    // 1️⃣ Update local requests state immediately
    setRequests((prevRequests) =>
      prevRequests
        .map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
        // 2️⃣ If activeStatus is TODAY, remove completed requests
        .filter((req) =>
          activeStatus === "TODAY"
            ? req.status !== "COMPLETED" &&
              ((req.rescheduledPickupAt?.split("T")[0] ||
                req.pickupScheduledAt?.split("T")[0]) ===
                new Date().toISOString().split("T")[0])
            : true
        )
    );

    // 3️⃣ Refresh counts from backend
    fetchCounts();
  } catch (err) {
    console.error(err);
    toast.error("Failed to update status");
  }
};



  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(requests.length / itemsPerPage);

  return (
    <div className="agent-dashboard container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
  <h2>🚛 Pickup Agent Dashboard</h2>
  <button
    className="btn btn-outline-primary"
    onClick={() => navigate("/agent/history")}
  >
    View History
  </button>
</div>


      {/* ================= Cards ================= */}
      <div className="cards d-flex gap-3 mb-4 flex-wrap">
        {[
  { label: "Today’s Pickups", key: "today", color: "danger", status: "TODAY" },
  { label: "Total", key: "total", color: "primary" },
  { label: "Assigned", key: "assigned", color: "info", status: "ASSIGNED" },
  { label: "In Progress", key: "inProgress", color: "warning", status: "IN_PROGRESS" },
  { label: "Completed", key: "completed", color: "success", status: "COMPLETED" },
]
.map((card) => (
          <div
            key={card.key}
            className={`card text-white bg-${card.color} card-hover flex-fill cursor-pointer`}
            onClick={() => {
  if (card.status === "TODAY") {
  const today = new Date().toISOString().split("T")[0];
  const filtered = requests.filter((req) => {
    const pickupDate =
      req.rescheduledPickupAt?.split("T")[0] ||
      req.pickupScheduledAt?.split("T")[0];
    return pickupDate === today && req.status !== "COMPLETED";
  });
  setRequests(filtered);
  setActiveStatus("TODAY");
} else {
  fetchRequests(card.status); // only call backend for real statuses
}

}}

          >
            <div className="card-body text-center">
              <h5>{card.label}</h5>
              <h3>{counts[card.key]}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ================= Table ================= */}
      <div className="table-responsive shadow rounded-4">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Device</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Address</th>
              <th>Pickup date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
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
                  <td className="d-flex gap-2">
  {req.status === "ASSIGNED" && (
    <button
      className="action-btn btn-in-progress"
      onClick={() => handleStatusUpdate(req.id, "IN_PROGRESS")}
    >
      Mark In Progress
    </button>
  )}
  {req.status === "IN_PROGRESS" && (
    <button
      className="action-btn btn-completed"
      onClick={() => handleStatusUpdate(req.id, "COMPLETED")}
    >
      Mark Completed
    </button>
  )}
  {req.status === "COMPLETED" && (
    <button className="action-btn btn-disabled" disabled>
      Completed
    </button>
  )}
</td>

                </tr>
              ))
            )}
          </tbody>
        </table>
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
