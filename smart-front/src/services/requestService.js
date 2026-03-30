import api from "./api";

// ================= ADMIN APIs =================
export const getPendingRequests = () =>
  api.get("/api/requests/admin/requests/new");

export const getRequestHistory = () =>
  api.get("/api/requests/admin/requests/history");

// Approve / Reject request (ADMIN ONLY)
export const updateRequestStatus = (requestId, status, token, reason = "") =>
  api.put(
    `/api/requests/${requestId}/status`,
    { status, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );


// ================= USER APIs =================
export const getUserRequestHistory = (userId) =>
  api.get(`/api/requests/user/${userId}`);
