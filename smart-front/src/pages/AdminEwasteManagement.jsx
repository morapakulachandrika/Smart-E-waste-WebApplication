import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RejectModal from "../components/RejectModal";

import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { updateRequestStatus } from "../services/requestService";
import { isAdmin, getToken } from "../utils/auth";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

import "./AdminEwasteManagement.css";

export default function AdminEwasteManagement() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [filter, setFilter] = useState(""); // no table visible initially
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [authorized, setAuthorized] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectType, setRejectType] = useState("");
  // "REQUEST" | "RESCHEDULE"


  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterApplied, setDateFilterApplied] = useState(false);

  /* ---------------- RESCHEDULE STATES ---------------- */
  const [reschedules, setReschedules] = useState([]);
  const [showReschedule, setShowReschedule] = useState(false);

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  
  const navigate = useNavigate();
  const COLORS = ["#f39c12", "#2ecc71", "#e74c3c", "#9b59b6"];


  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    if (!isAdmin()) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    fetchPendingRequests();
    fetchAdminStats();
    fetchRescheduleRequests();
  }, []);

  // ---------------- FETCH PENDING REQUESTS ----------------
  const fetchPendingRequests = async () => {
    try {
      const token = getToken();
      const res = await api.get("/api/requests/admin/requests/new", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      data.sort((a, b) => new Date(b.pickupScheduledAt) - new Date(a.pickupScheduledAt));
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch pending requests", err);
      if (err.response?.status === 403) setAuthorized(false);
    }
  };

  // ---------------- FETCH RESCHEDULE REQUESTS ----------------
  const fetchRescheduleRequests = async () => {
    try {
      const token = getToken();
      const res = await api.get("/api/ewaste/reschedule/admin/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReschedules(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reschedule requests", err);
    }
  };

  // ---------------- APPROVE / REJECT RESCHEDULE ----------------
  const handleRescheduleAction = async (id, action) => {
  if (action === "reject") {
    setRejectTarget(id);
    setRejectType("RESCHEDULE");
    setShowRejectModal(true);
    return;
  }

  try {
    const token = getToken();
    await api.post(
      `/api/ewaste/reschedule/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Reschedule approved ✅");
    await fetchRescheduleRequests();
    await fetchAdminStats(startDate, endDate);
    await fetchPendingRequests();
  } catch (err) {
    toast.error("Reschedule approval failed ❌");
  }
};



  // ---------------- FETCH ADMIN STATS ----------------
  const fetchAdminStats = async (start, end) => {
    setLoading(true);
    try {
      const token = getToken();
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      // Primary counts
      const countsRes = await api.get("/api/requests/admin/counts", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const countsData = countsRes.data || {};

      // Reschedule counts
      const resRes = await api.get("/api/ewaste/reschedule/admin/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = resRes.data || [];
      setReschedules(resData);

      // Accepted = primary accepted + all reschedules
      const acceptedCount = (Number(countsData.accepted) || 0) + resData.length;

      setCounts({
        total: Number(countsData.total) || 0,
        pending: Number(countsData.pending) || 0,
        accepted: acceptedCount,
        rejected: Number(countsData.rejected) || 0,
      });

      // PIE DATA
      setPieData([
        { name: "Pending", value: Number(countsData.pending) || 0 },
        { name: "Accepted", value: acceptedCount },
        { name: "Rejected", value: Number(countsData.rejected) || 0 },
        { name: "Reschedule", value: resData.length },
      ]);

      // LINE DATA
      const trendsRes = await api.get("/api/requests/admin/trends", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const trends = trendsRes.data || [];
      setLineData(
        trends.map(item => ({
          date: item.date?.split("T")[0] || "",
          count: Number(item.count) || 0,
        }))
      );

      // DEVICE DATA
      const deviceRes = await api.get("/api/requests/admin/device-stats", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      // DEVICE DATA NORMALIZATION
      const devices = deviceRes.data || [];
      const normalizedDeviceData = devices.map(d => ({
        device: d.device || "Unknown",
        accepted: (Number(d.accepted) || 0)
          + (Number(d.rescheduleRequested) || 0)
          + (Number(d.rescheduleApproved) || 0), // All approved/reschedule counts
        rejected: Number(d.rejected) || 0,
        pending: Number(d.pending) || 0,
      }));
      setDeviceData(normalizedDeviceData);

    } catch (err) {
      console.error("Failed to fetch admin stats", err);
      alert("Unable to fetch admin statistics. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HANDLE STATUS CHANGE ----------------
  const handleStatusChange = async (id, status) => {
  if (status === "REJECTED") {
    setRejectTarget(id);
    setRejectType("REQUEST");
    setShowRejectModal(true);
    return;
  }

  setActionId(id);
  try {
    const token = getToken();
    await updateRequestStatus(id, status, token);
    toast.success("Request approved successfully ✅");

    await fetchPendingRequests();
    await fetchRescheduleRequests();
    await fetchAdminStats(startDate, endDate);
  } catch (err) {
    toast.error("Failed to approve request ❌");
  } finally {
    setActionId(null);
  }
};

const submitRejection = async (reason) => {
  try {
    const token = getToken();

    if (rejectType === "REQUEST") {
      await updateRequestStatus(rejectTarget, "REJECTED", token, reason);
      toast.success("Request rejected ❌");
    }

    if (rejectType === "RESCHEDULE") {
      await api.post(
        `/api/ewaste/reschedule/${rejectTarget}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Reschedule rejected ❌");
    }

    await fetchPendingRequests();
    await fetchRescheduleRequests();
    await fetchAdminStats(startDate, endDate);
  } catch (err) {
    toast.error("Rejection failed");
  } finally {
    setShowRejectModal(false);
    setRejectTarget(null);
    setRejectType("");
  }
};

  // ---------------- DATE FILTER ----------------
  const handleApplyDateFilter = () => {
    fetchAdminStats(startDate, endDate);
    setDateFilterApplied(true);
  };

  const handleResetDates = () => {
    setStartDate("");
    setEndDate("");
    setDateFilterApplied(false);
    fetchAdminStats();
  };



  // ---------------- FILTERED REQUESTS ----------------
  const filtered = filter === "PENDING"
    ? requests.filter(r => r.status?.toUpperCase() === "PENDING")
    : [];

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);


  // ---------------- RENDER ----------------
  if (loading) return <Loader />;

  if (!authorized) {
    return (
      <div className="text-center mt-5">
        <h3>🚫 Not authorized to view this page!</h3>
        <p>Please login as an admin to access E-Waste Management.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/admin")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-ew-wrapper">
      <div className="header-row">
        <h1>♻️ E-Waste Management</h1>
        <div className="d-flex justify-content-end align-items-center mb-4 gap-3">
  {/* Agents Button */}
  <button
    className="btn btn-success fw-bold d-flex align-items-center gap-2"
    onClick={() => navigate("/admin/assign-agents")}
  >
    <span>👷</span> Assign Agents
  </button>

  {/* History Button */}
  <button
    className="btn btn-outline-primary fw-bold d-flex align-items-center gap-2"
    onClick={() => navigate("/admin/user-request-history")}
  >
    <span>📜</span> EWaste History
  </button>
</div>



      </div>

      {/* DATE FILTER */}
      <div className="date-filter-bar">
        <div>
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button className="btn-set" onClick={handleApplyDateFilter}>Set</button>
        <button className="btn-reset" onClick={handleResetDates}>Reset</button>
      </div>

      {/* COUNT CARDS */}
      <div className="cards">
        {["ALL", "PENDING", "ACCEPTED", "REJECTED", "RESCHEDULE"].map(k => (
          <div
            key={k}
            className={`card-box ${k.toLowerCase()} ${filter === k ? "active" : ""}`}
            onClick={() => setFilter(k)}
          >
            <h4>{k}</h4>
            <p>
              {k === "ALL" && counts.total}
              {k === "PENDING" && counts.pending}
              {k === "ACCEPTED" && counts.accepted}
              {k === "REJECTED" && counts.rejected}
              {k === "RESCHEDULE" && reschedules.length}
            </p>
          </div>
        ))}
      </div>

      {/* PENDING TABLE */}
      {filter === "PENDING" && filtered.length > 0 && (
    <>
        <div className="table-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Device</th>
                  <th>Condition</th>
                  <th> Address</th>
                  <th>Pickup Date</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Images</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div className="user-cell">
                        <strong>User-{r.userId}</strong>
                        <span>{r.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{r.deviceType}</strong><br />
                      <small>{r.brand} {r.model}</small><br />
                      <small className="text-muted">Qty: {r.quantity}</small>
                    </td>
                    <td>{r.conditionStatus}</td>
                    <td>
                      <div className="address-cell">
                        <div>{r.address}</div>
                        {r.landmark && <span>{r.landmark}</span>}
                      </div>
                    </td>
                    <td>
  {new Date(r.pickupScheduledAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

                    <td>
                      <span >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "PENDING" ? (
                        <div className="action-buttons">
                          <button disabled={actionId === r.id} className="btn-approve" onClick={() => handleStatusChange(r.id, "ACCEPTED")}>✓</button>
                          <button disabled={actionId === r.id} className="btn-reject" onClick={() => handleStatusChange(r.id, "REJECTED")}>✕</button>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {r.images?.length > 0 ? (
                        r.images.map((img, i) => (
                          <img key={i} src={`http://localhost:9091/${img.replace("\\", "/")}`} alt="ewaste" width="45" className="rounded me-1" style={{ cursor: "pointer" }} onClick={() => setPreviewImg(`http://localhost:9091/${img.replace("\\", "/")}`)} />
                        ))
                      ) : <small>No image</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* ✅ PAGINATION (FIXED LOCATION) */}
          {totalPages > 1 && (
            <div className="ud-pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                ◀ Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    

      {/* RESCHEDULE TABLE */}
      {filter === "RESCHEDULE" && (
        <div className="table-card">
          <h4 className="mb-3">🔁 Pickup Reschedule Requests</h4>
          {reschedules.length === 0 ? (
            <p className="text-muted text-center">No pending reschedule requests 🎉</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-secondary">
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Old Date</th>
                    <th>New Date</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reschedules.map(r => (
                    <tr key={r.id}>
                      {/* RESCHEDULE ID */}
                      <td>{r.id}</td>

                      {/* USER */}
                      <td>{`User-${r.userId}`}</td>

                      {/* OLD DATE */}
                      <td>
                        {r.oldPickupDate
                          ? new Date(r.oldPickupDate).toLocaleString()
                          : "—"}
                      </td>

                      {/* NEW DATE */}
                      <td>
                        {r.newPickupDate
                          ? new Date(r.newPickupDate).toLocaleString()
                          : "—"}
                      </td>

                      {/* REASON */}
                      <td>{r.reason || "—"}</td>

                      {/* ACTION */}
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleRescheduleAction(r.requestId, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRescheduleAction(r.requestId, "reject")}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>


              </table>
            </div>
          )}
        </div>
      )}

      {/* CHARTS */}
      <div className="charts-grid">
        <div className="chart-card">
          <h5>Request Status Distribution</h5>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={55} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h5>Requests over selected range</h5>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h5>Device-wise Status</h5>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={deviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accepted" fill="#2ecc71" />
              <Bar dataKey="rejected" fill="#e74c3c" />
              <Bar dataKey="pending" fill="#f39c12" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {previewImg && (
        <div className="modal-backdrop" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="full" className="modal-img" />
        </div>
      )}

      <RejectModal
  show={showRejectModal}
  onClose={() => setShowRejectModal(false)}
  onSubmit={submitRejection}
/>

    </div>
  );
}
