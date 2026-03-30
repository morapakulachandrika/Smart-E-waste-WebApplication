import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/userService";
import "./UserSettings.css";

export default function UserSettings() {
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile(userId);
        setProfile(res.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      await updateProfile(userId, profile);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="settings-page">
      {/* ================= HEADER ================= */}
      <div className="settings-header">
        <div className="avatar">
          {profile.fullName ? profile.fullName.charAt(0) : "U"}
        </div>

        <div className="header-info">
          <h2>{profile.fullName}</h2>
          <p>{profile.email}</p>
        </div>
      </div>

      {/* ================= CARD ================= */}
      <div className="settings-card">
        <form onSubmit={handleUpdate}>
          <h3 className="section-title">Personal Information</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                value={profile.city || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                name="state"
                value={profile.state || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                name="pincode"
                value={profile.pincode || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Active Since</label>
              <input
                value={
                  profile.activeSince
                    ? new Date(profile.activeSince).toLocaleDateString()
                    : ""
                }
                disabled
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>

        {success && <p className="success-msg">{success}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
