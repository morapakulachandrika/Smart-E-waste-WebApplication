import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReschedulePickupModal from "../components/ReschedulePickupModal";
import "./UserDashboard.css";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    rescheduled: 0,
  });

  const [activeView, setActiveView] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalRequest, setModalRequest] = useState(null);
  // ALL | PENDING | RESCHEDULED

  const ITEMS_PER_PAGE = 5;
  

  /* ---------------- FETCH USER + REQUESTS ---------------- */
  useEffect(() => {
    api.get("/api/auth/currentUser").then((res) => {
      setUserName(res.data.fullName);
      fetchRequests(res.data.id);
    });
  }, []);

  const fetchRequests = async (userId) => {
    const res = await api.get(`/api/requests/user/${userId}`);
    const data = Array.isArray(res.data) ? res.data : [];

    data.sort(
      (a, b) =>
        new Date(b.pickupScheduledAt || b.createdAt) -
        new Date(a.pickupScheduledAt || a.createdAt)
    );

    setRequests(data);
    setLoading(false);

    const pending = data.filter((r) => r.status === "PENDING").length;
    const rejected = data.filter((r) => r.status === "REJECTED").length;

    const rescheduled = data.filter(
      (r) =>
        r.status === "RESCHEDULE_REQUESTED" ||
        r.status === "RESCHEDULE_APPROVED" ||
        r.status === "RESCHEDULE_REJECTED"
    ).length;

    const accepted = data.filter(
      (r) =>
        r.status === "ACCEPTED" ||
        r.status === "RESCHEDULE_REQUESTED" ||
        r.status === "RESCHEDULE_APPROVED" ||
        r.status === "RESCHEDULE_REJECTED"
    ).length;

    setCounts({
  total: data.length,
  pending,
  accepted,
  rejected,
  rescheduled,
});

  };

   /* ---------------- RESET PAGE ON FILTER ---------------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeView]);

/* ---------------- DEVICE BAR CHART DATA ---------------- */
  const deviceBarData = useMemo(() => {
    const map = {};
    requests.forEach((r) => {
      const device = r.deviceType || "Unknown";
      map[device] = (map[device] || 0) + (r.quantity || 1);
    });
    return Object.entries(map).map(([device, count]) => ({
      device,
      count,
    }));
  }, [requests]);

  if (loading) return <p className="loading-text">⏳ Loading...</p>;

/* ---------------- TABLE FILTER DATA ---------------- */
  const viewData =
    activeView === "PENDING"
      ? requests.filter((r) => r.status === "PENDING")
      : activeView === "RESCHEDULED"
      ? requests.filter(
          (r) =>
            r.status === "RESCHEDULE_REQUESTED" ||
            r.status === "RESCHEDULE_APPROVED" ||
            r.status === "RESCHEDULE_REJECTED"
        )
      : [];

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(viewData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = viewData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );


 /* ---------------- HELPERS ---------------- */
  const openRescheduleModal = (req) => setModalRequest(req);
  const closeModal = () => setModalRequest(null);

  const handleRescheduleSuccess = () => {
    toast.success("Reschedule request submitted successfully");
    api.get("/api/auth/currentUser").then((res) => {
      fetchRequests(res.data.id);
    });
  };

  const getAgentDisplay = (r) => {
    // Only for ACCEPTED requests
    if (r.status === "ACCEPTED") {
      return r.assignedAgentName ? r.assignedAgentName : "Pending";
    }

    // All other statuses
    return "-";
  };

  const COLORS = {
  Pending: "#f59e0b",     // Orange
  Accepted: "#22c55e",    // Green
  Rejected: "#ef4444",    // Red
  Rescheduled: "#8b5cf6"  // Purple
};


  return (
    <div className="ud-page">
      <div className="ud-container">
        {/* HEADER */}
        <div className="ud-header">
          <div>
            <h1>
              👋 Welcome, <span>{userName}</span>
            </h1>
            <p>Track and manage your e-waste pickup requests</p>
          </div>
          <div className="ud-header-buttons">
            <button className="ud-new-btn" onClick={() => navigate("/new-request")}>
              ➕ New Request
            </button>
            <button className="ud-history-btn" onClick={() => navigate("/user-history")}>
              📜 My History
            </button>
          </div>
        </div>

           {/* STATS */}
        <div className="ud-stats">
          <div className="stat-card" onClick={() => setActiveView("ALL")}>
            <h4>Total</h4>
            <p>{counts.total}</p>
          </div>
          <div className="stat-card accepted" onClick={() => setActiveView("ALL")}>
            <h4>Accepted</h4>
            <p>{counts.accepted}</p>
          </div>
          <div className="stat-card rejected" onClick={() => setActiveView("ALL")}>
            <h4>Rejected</h4>
            <p>{counts.rejected}</p>
          </div>
          <div
            className={`stat-card pending ${activeView === "PENDING" ? "active" : ""}`}
            onClick={() => setActiveView("PENDING")}
          >
            <h4>Pending</h4>
            <p>{counts.pending}</p>
          </div>
          <div
            className={`stat-card rescheduled ${
              activeView === "RESCHEDULED" ? "active" : ""
            }`}
            onClick={() => setActiveView("RESCHEDULED")}
          >
            <h4>Rescheduled</h4>
            <p>{counts.rescheduled}</p>
          </div>
        </div>

        {/* CHARTS (ALWAYS VISIBLE) */}
        <div className="ud-charts">
          <div className="chart-card">
            <h3>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
  data={[
    { name: "Pending", value: counts.pending },
    { name: "Accepted", value: counts.accepted },
    { name: "Rejected", value: counts.rejected },
    { name: "Rescheduled", value: counts.rescheduled },
  ]}
  dataKey="value"
  outerRadius={100}
  label
>
  {[
    { name: "Pending", value: counts.pending },
    { name: "Accepted", value: counts.accepted },
    { name: "Rejected", value: counts.rejected },
    { name: "Rescheduled", value: counts.rescheduled },
  ].map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
  ))}
</Pie>

                <Tooltip />
                <Legend
  formatter={(value) => (
    <span style={{ color: COLORS[value], fontWeight: "bold" }}>
      {value}
    </span>
  )}
/>

              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Device Type Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* TABLE */}
        {(activeView === "PENDING" || activeView === "RESCHEDULED") && (
          <div className="ud-table-card">

            <h2 className="mb-3">
              {activeView === "PENDING"
                ? "📦 Pending Requests"
                : "📦 Rescheduled Requests"}
            </h2>

            {paginatedRequests.length === 0 ? (
              <p className="empty-text">No requests found</p>
            ) : (
              <>
                <div className="ud-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Device</th>
                        <th>Condition</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Assigned Agent</th>
                        <th>Pickup Status</th>
                        <th>Pickup Date</th>
                        <th>Reschedule</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedRequests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>
                            <strong>{r.deviceType}</strong>
                            <br />
                            <small>{r.brand} {r.model}</small>
                            <br />
                            <small className="muted">Qty: {r.quantity}</small>
                          </td>
                          <td>{r.conditionStatus}</td>
                          <td><small>{r.address}</small></td>
                          <td>
                            <span className={`ud-status ${r.status.toLowerCase()}`}>
                              {r.status}
                            </span>
                          </td>
                          {/* Assigned Agent */}
                          <td>
                            <span className="agent-status">
                              {getAgentDisplay(r)}
                            </span>
                          </td>

                          {/* Pickup Status */}
                          <td>
                            {r.pickupStatus === "ASSIGNED" && r.assignedAgentName ? (
                              <span className="pickup-status assigned">Assigned</span>
                            ) : r.pickupStatus === "IN_PROGRESS" ? (
                              <span className="pickup-status in-progress">In Progress</span>
                            ) : r.pickupStatus === "COMPLETED" ? (
                              <span className="pickup-status completed">Completed</span>
                            ) : !r.assignedAgentName ? (
                              <span className="pickup-status pending">Pending</span>
                            ) : (
                              <span className="pickup-status assigned">Assigned</span>
                            )}
                          </td>

                          {/* Pickup Date */}
                          <td>
                            {r.pickupScheduledAt
                              ? new Date(r.pickupScheduledAt).toLocaleString()
                              : "-"}
                          </td>

                          {/* Reschedule */}
                          <td>
                            {r.status === "PENDING" || r.status === "REJECTED" ? (
                              "--"
                            ) : r.status === "ACCEPTED" && r.assignedAgentName ? (
                              "--"   // 🔒 locked once agent assigned
                            ) : r.status === "ACCEPTED" && !r.assignedAgentName && !r.rescheduleRequestedAt ? (
                              <button
                                className="res-btn"
                                onClick={() => openRescheduleModal(r)}
                              >
                                Reschedule
                              </button>
                            ) : r.status === "RESCHEDULE_REQUESTED" ? (
                              "Requested"
                            ) : r.status === "RESCHEDULE_APPROVED" ? (
                              "Approved"
                            ) : r.status === "RESCHEDULE_REJECTED" ? (
                              "Rejected"
                            ) : (
                              "--"
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        
                {/* PAGINATION */}
                {totalPages > 1 && (
                  <ul className="pagination">
                    {/* PREV */}
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                    </li>

                    {/* PAGE NUMBERS */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    {/* NEXT */}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                )}

              </>
            )}
          </div>
        )}
        {modalRequest && (
          <ReschedulePickupModal
            request={modalRequest}
            onClose={closeModal}
            onSuccess={handleRescheduleSuccess}
          />
        )}
      </div>

    </div>
  );
}
