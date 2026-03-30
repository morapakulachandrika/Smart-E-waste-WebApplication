import api from "./api";

// Admin creates pickup agent
export const createPickupAgent = (payload) =>
  api.post("/api/pickup-agent/admin/create", payload);

// Admin fetches all pickup agents (future)
export const getAllPickupAgents = () =>
  api.get("/api/pickup-agent/admin/all");

// Get assigned requests (logged-in agent)
export const getAssignedRequests = () =>
  api.get("/api/pickup-agent/requests");

// Update pickup status
export const updatePickupStatus = (requestId, payload) =>
  api.patch(`/api/pickup-agent/request/${requestId}/status`, payload);