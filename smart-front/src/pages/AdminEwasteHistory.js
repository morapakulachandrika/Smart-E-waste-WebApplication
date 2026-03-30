import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import api from "../services/api";
import { getRequestHistory } from "../services/requestService";
import { getToken, isAdmin } from "../utils/auth";
import "./AdminEwasteHistory.css";

export default function AdminEwasteHistory() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [authorized, setAuthorized] = useState(true);

  const [monthOptions, setMonthOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");

  // ✅ PAGINATION
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = getToken();
      const res = await getRequestHistory(token);
      const data = Array.isArray(res.data) ? res.data : [];

      // SORT BY pickupScheduledAt DESC
      data.sort(
        (a, b) =>
          new Date(b.pickupScheduledAt) - new Date(a.pickupScheduledAt)
      );

      setRequests(data);
      setFilteredRequests(data);

      // MONTH OPTIONS
      const months = Array.from(
        new Set(
          data.map((r) =>
            new Date(r.pickupScheduledAt).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })
          )
        )
      );
      setMonthOptions(["ALL", ...months]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedMonth("ALL");
    setSelectedStatus("ALL");
    setStartDate("");
    setEndDate("");
    setSearchText("");
  };

  const exportToCSV = () => {
    if (!filteredRequests.length) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Request ID",
      "User ID",
      "Device Type",
      "Brand",
      "Model",
      "Quantity",
      "Condition",
      "Pickup Address",
      "Pickup Date",
      "Status",
    ];

    const rows = filteredRequests.map((r) => [
      r.id,
      r.userId,
      r.deviceType,
      r.brand,
      r.model,
      r.quantity,
      r.conditionStatus,
      r.address,
      new Date(r.pickupScheduledAt).toLocaleString("en-IN"),
      r.status,
    ]);

    let csvContent =
      headers.join(",") +
      "\n" +
      rows.map((e) => e.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ewaste_request_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ FILTER LOGIC
  useEffect(() => {
    let filtered = [...requests];

    if (selectedMonth !== "ALL") {
      filtered = filtered.filter(
        (r) =>
          new Date(r.pickupScheduledAt).toLocaleString("default", {
            month: "short",
            year: "numeric",
          }) === selectedMonth
      );
    }

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    if (startDate) {
      filtered = filtered.filter(
        (r) => new Date(r.pickupScheduledAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (r) => new Date(r.pickupScheduledAt) <= end
      );
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.userId.toString().includes(q) ||
          r.deviceType.toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.id.toString().includes(q)
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // ✅ RESET PAGE
  }, [
    selectedMonth,
    selectedStatus,
    startDate,
    endDate,
    searchText,
    requests,
  ]);

  // ✅ PAGINATED DATA
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) return <Loader />;

  if (!authorized)
    return (
      <div className="text-center mt-5">
        <h3>🚫 Not authorized</h3>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </button>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar mb-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthOptions.map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">PENDING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={resetFilters}
        >
          Reset Filters
        </button>

        <button
          className="btn btn-sm btn-success"
          onClick={exportToCSV}
        >
          Export CSV
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-muted">No request history found</p>
      ) : (
        <>
          <div className="admin-ewaste-history">
  <div className="table-responsive">
    <table className="table align-middle">

              <thead className="table-secondary">
                <tr>
                  <th>REQ ID</th>
                  <th>USER</th>
                  <th>Device</th>
                  <th>Condition</th>
                  <th>Pickup Address</th>
                  <th>Pickup Date</th>
                  <th>Req Status</th>
                  <th>Agent</th>
                  <th>Pickup Status</th>
                  <th>Images</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRequests.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.id}</strong></td>
                    <td>User-{r.userId}</td>
                    <td>
                      <div>
                        {r.deviceType}
                        <div className="text-muted">
                          {r.brand} {r.model}
                        </div>
                      </div>
                    </td>
                    <td>{r.conditionStatus}</td>
                   <td className="address-cell">{r.address}</td>
                    <td>
  {new Date(r.pickupScheduledAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

                    <td>
                      <span
                        className={`badge ${
                          r.status === "ACCEPTED"
                            ? "bg-success"
                            : r.status === "REJECTED"
                            ? "bg-danger"
                            : "bg-warning"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
  {r.status === "ACCEPTED" && r.assignedAgentId ? (
    <span className="agent-assigned">
      {r.assignedAgentName}
    </span>
  ) : (
    <span className="text-muted">  -----</span>
  )}
</td>
<td>
                      {!r.assignedAgentName ? (
                        <span className="pickup-status pending">Pending</span>
                      ) : r.pickupStatus === "IN_PROGRESS" ? (
                        <span className="pickup-status in-progress">In Progress</span>
                      ) : r.pickupStatus === "COMPLETED" ? (
                        <span className="pickup-status completed">Completed</span>
                      ) : (
                        <span className="pickup-status assigned">Assigned</span>
                      )}
                    </td>
                    <td>
                      {r.images?.length ? (
                        r.images.map((img, i) => (
                          <img
                            key={i}
                            src={`http://localhost:9091/${img.replace(
                              "\\",
                              "/"
                            )}`}
                            alt=""
                            onClick={() =>
                              setPreviewImg(
                                `http://localhost:9091/${img.replace(
                                  "\\",
                                  "/"
                                )}`
                              )
                            }
                          />
                        ))
                      ) : (
                        <small className="text-muted">No image</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* PAGINATION */}
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


              <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next ▶
          </button>
            </div>
          )}
        </>
      )}

      {previewImg && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewImg(null)}
        >
          <img src={previewImg} alt="preview" className="modal-img" />
        </div>
      )}
    
    </div>
  );
}
