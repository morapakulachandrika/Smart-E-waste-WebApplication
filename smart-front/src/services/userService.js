import api from "./api";

// --------------------
// ADMIN
// --------------------
export const getPendingUsers = () => api.get("/admin/pending-users");

export const approveUser = (userId) =>
  api.post(`/admin/approve-user/${userId}`);

// --------------------
// USER PROFILE
// --------------------
export const getProfile = (userId) =>
  api.get(`/api/user/${userId}`);

export const updateProfile = (userId, profileData) => {
  const payload = {
    email: profileData.email || "",
    fullName: profileData.fullName || "",
    address: profileData.address || "",
    city: profileData.city || "",
    state: profileData.state || "",
    pincode: profileData.pincode || "",
    phone: profileData.phone || "",
  };

  return api.put(`/api/user/update/${userId}`, payload);
};


// --------------------
// PROFILE PHOTO UPLOAD
// --------------------
export const uploadProfilePhoto = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // Must match @RequestParam("file")

    const response = await api.post(
      `/api/user/${userId}/upload-photo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error;
  }
};

// --------------------
// CHANGE PASSWORD
// --------------------
// Forgot password (request temporary password link)
export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", null, { params: { email } });
};

// Reset password (use temporary password received via email)
export const resetPassword = ({ email, temporaryPassword, newPassword, confirmPassword }) => {
  return api.post("/auth/reset-password", null, {
    params: { email, temporaryPassword, newPassword, confirmPassword },
  });
};