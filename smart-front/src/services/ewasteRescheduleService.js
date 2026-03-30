import api from "./api";

// USER: Request reschedule
export const requestReschedule = (requestId, payload) =>
  api.post(`/api/ewaste/reschedule/${requestId}`, payload);

// ADMIN: Approve reschedule
export const approveReschedule = (requestId) =>
  api.post(`/api/ewaste/reschedule/${requestId}/approve`);

// ADMIN: Reject reschedule
export const rejectReschedule = (requestId, payload) =>
  api.post(`/api/ewaste/reschedule/${requestId}/reject`, payload);
