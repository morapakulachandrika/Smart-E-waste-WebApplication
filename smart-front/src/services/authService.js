import api from './api';

export const register = (payload) => api.post('/api/auth/register', payload);
export const login = (payload) => api.post('/api/auth/login', payload);
export const forgotPassword = (payload) => api.post('/api/auth/forgot-password', payload);
export const resetPassword = (payload) => api.post('/api/auth/reset-password', payload);


// admin APIs
export const getPendingUsers = () => api.get('/api/admin/pending-users');
export const approveUser = (userId) => api.post('/api/admin/approve-user', { userId });
export const resendTemp = (userId) => api.post(`/api/admin/resend-temp/${userId}`);
export const rejectUser = (userId) => api.post(`/api/admin/reject/${userId}`);
export const getAllUsers = () => api.get('/api/admin/all-users');

// user APIs
export const getProfile = (id) => api.get(`/api/user/${id}`);
export const getUserRequests = (userId) => api.get(`/api/user/requests/${userId}`);
// admin APIs
export const getAllUserRequests = () => api.get('/api/admin/user-requests');
