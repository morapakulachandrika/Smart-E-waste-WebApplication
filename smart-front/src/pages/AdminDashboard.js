import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import MiniToast from "../components/MiniToast";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
} from "../services/authService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  function showMiniToast(type, message) {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2000);
  }

  async function loadPending() {
    setLoading(true);
    const res = await getPendingUsers();
    setPending(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }

  async function loadAll() {
    setLoading(true);
    const res = await getAllUsers();
    setAll(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadPending();
    loadAll();
  }, []);

  async function handleApprove(id) {
    await approveUser(id);
    showMiniToast("success", "User approved");
    loadPending();
    loadAll();
  }

  async function handleReject(id) {
    await rejectUser(id);
    showMiniToast("error", "User rejected");
    loadPending();
    loadAll();
  }

  const totalPages = Math.ceil(all.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = all.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      {loading && <Loader />}

      <div className="container py-5">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">🚀 Admin Dashboard</h2>

          <div className="d-flex gap-3">
            <button
              className="btn btn-success admin-action-btn"
              onClick={() => navigate("/admin/pickup-agents")}
            >
              👷 Pickup Agents
            </button>

            <button
              className="btn btn-success admin-action-btn"
              onClick={() => navigate("/admin/ewaste-management")}
            >
              ♻️ E-Waste Management
            </button>
          </div>
        </div>

        {/* Pending Users */}
        <div className="card mb-4 p-4">
          <h4>⏳ Pending Users</h4>
          {pending.length === 0 ? (
            <p>No pending users</p>
          ) : (
            pending.map((u) => (
              <div key={u.id} className="pending-user">
                <div>
                  <b>{u.fullName}</b>
                  <div className="text-muted">{u.email}</div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleApprove(u.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(u.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* All Users Table */}
        <div className="card p-4">
          <h4>👥 All Users</h4>

          <div className="table-responsive mt-3">
            <table
              className="table admin-users-table"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>User ID</th>
                  <th style={{ width: "20%" }}>Name</th>
                  <th style={{ width: "35%" }}>Email</th>
                  <th style={{ width: "15%" }}>Role</th>
                  <th style={{ width: "20%" }}>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.fullName}</td>

                    <td
                      style={{
                        wordBreak: "break-all",
                        whiteSpace: "normal",
                        fontSize: "0.9rem",
                      }}
                    >
                      {u.email}
                    </td>

                    <td>{u.role}</td>

                    <td>
                      <span className={`status ${u.status}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper mt-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ◀
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

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>

      <MiniToast {...toast} />
    </>
  );
}
