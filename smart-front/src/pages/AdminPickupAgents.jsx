import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import MiniToast from "../components/MiniToast";
import { getAllPickupAgents } from "../services/agentService";

export default function AdminPickupAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  function showToast(type, message) {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2000);
  }

  async function loadAgents() {
    setLoading(true);
    try {
      const res = await getAllPickupAgents();
      setAgents(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);
    } catch {
      showToast("error", "Failed to load agents");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAgents();
  }, []);

  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgents = agents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      {loading && <Loader />}

      <div className="container-xl px-4 px-md-5 py-5">

        {/* Back */}
        <button
          className="btn btn-outline-primary fw-bold mb-3"
          onClick={() => navigate("/admin")}
        >
          ⬅️ Back
        </button>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">👷 Pickup Agents</h3>
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/create-agent")}
          >
            ➕ New Agent
          </button>
        </div>

        {/* Table Card */}
        <div className="card p-4 shadow-sm rounded-4">
          {agents.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No pickup agents found
            </p>
          ) : (
            <>
              <div className="table-responsive">
                <table
                  className="table align-middle"
                  style={{
                    tableLayout: "fixed",
                    width: "100%",
                  }}
                >
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "8%" }}>ID</th>
                      <th style={{ width: "18%" }}>Name</th>
                      <th style={{ width: "30%" }}>Email</th>
                      <th style={{ width: "20%" }}>Phone</th>
                      <th style={{ width: "14%", textAlign: "center" }}>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedAgents.map((a) => (
                      <tr key={a.id}>
                        <td>{a.id}</td>

                        <td
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {a.name}
                        </td>

                        <td
                          style={{
                            wordBreak: "break-all",
                            whiteSpace: "normal",
                            fontSize: "0.9rem",
                          }}
                        >
                          {a.email}
                        </td>

                        <td
                          style={{
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                          }}
                        >
                          {a.phone}
                        </td>

                        <td className="text-center">
                          <span
                            className={`badge px-3 py-2 ${
                              a.status === "ACTIVE"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ◀
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${
                        currentPage === i + 1
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MiniToast {...toast} />
    </>
  );
}
