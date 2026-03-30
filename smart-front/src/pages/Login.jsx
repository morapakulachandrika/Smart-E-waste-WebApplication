import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { saveToken } from '../utils/auth';
import Loader from "../components/Loader";

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'danger' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    if (field === 'email') {
      if (!value.trim()) setErrors(prev => ({ ...prev, email: '⚠️ Email is required' }));
      else if (!emailRegex.test(value.trim())) setErrors(prev => ({ ...prev, email: '⚠️ Enter a valid email' }));
      else setErrors(prev => ({ ...prev, email: '' }));
    }

    if (field === 'password') {
      if (!value.trim()) setErrors(prev => ({ ...prev, password: '⚠️ Password is required' }));
      else setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    if (!emailRegex.test(form.email.trim())) valid = false;
    if (!form.password.trim()) valid = false;
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('⚠️ Please fix the errors before submitting', 'danger');
      return;
    }

    setLoading(true);
    try {
      const res = await login(form);

      const { token, role, userId, profileCompleted } = res.data;
      saveToken(token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("profileCompleted", profileCompleted);

      showToast('✅ Login successful!', 'success');

      setTimeout(() => {
  switch (role) {
    case "ROLE_ADMIN":
      navigate("/admin"); // admin dashboard route
      break;
    case "ROLE_USER":
      navigate(`/user/${userId}`);   // existing user dashboard route
      break;
    case "ROLE_PICKUP_AGENT":
      navigate("/agent/dashboard");  // pickup agent dashboard route
      break;
    default:
      navigate("/"); // fallback
  }
}, 1000);

    } catch (error) {
      let backendError = "❌ Login failed";

      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === "string") backendError = data;
        else if (data.error) backendError = data.error;
        else if (data.message) backendError = data.message;
      } else if (error?.message) {
        backendError = error.message;
      }

      showToast(backendError, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'danger') => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <>
      {loading && <Loader />}

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-5 shadow rounded-4">
              <h3 className="mb-4 text-center">🔐 Login</h3>

              <form onSubmit={handleSubmit}>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center gap-2 mb-1">
                    <span>📧</span> Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`form-control ${errors.email ? 'border-danger' : ''}`}
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    required
                  />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>

                {/* Password */}
<div className="mb-3">
  <label className="form-label fw-bold d-flex align-items-center gap-2 mb-1">
    <span>🔑</span> Password
  </label>

  <div style={{ position: "relative" }}>
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      className={`form-control ${errors.password ? "border-danger" : ""}`}
      style={{ paddingRight: "42px" }}   // space for eye icon
      value={form.password}
      onChange={e => handleChange("password", e.target.value)}
      required
    />

    <span
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "18px",
        color: "#6b7280",
        userSelect: "none"
      }}
    >
      {showPassword ? "👁️" : "👁️‍🗨️"}
    </span>
  </div>

  {errors.password && (
    <small className="text-danger">{errors.password}</small>
  )}
</div>


                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button type="submit" className="btn btn-primary fw-bold">✅ Login</button>
                  <a href="/forgot-password" className="text-decoration-none">Forgot password?</a>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/")}
                  >
                    ⬅️ Back to Home
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      {toast.show && (
        <div
          className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow text-white ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}
          style={{
            minWidth: '250px',
            zIndex: 9999,
            transition: 'transform 0.5s ease-in-out',
            transform: toast.show ? 'translateX(0)' : 'translateX(300px)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>{toast.message}</div>
            <button
              className="btn-close btn-close-white ms-2"
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
            ></button>
          </div>
        </div>
      )}
    </>
  );
}
