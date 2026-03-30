import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import Loader from '../components/Loader';
import MiniToast from '../components/MiniToast';

export default function ResetPassword() {
  const [form, setForm] = useState({
    email: '',
    temporaryPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 2500);
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    const newErrors = {};
    if (form.newPassword && !passwordRegex.test(form.newPassword)) {
      newErrors.newPassword =
        'Password must be 8+ chars, with uppercase, lowercase, digit, and special char.';
    }
    if (form.confirmPassword && form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
  }, [form.newPassword, form.confirmPassword]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.email || !form.temporaryPassword || !form.newPassword || !form.confirmPassword) {
      showToast('error', 'All fields are required');
      setLoading(false);
      return;
    }

    if (Object.keys(errors).length > 0) {
      showToast('error', 'Please fix validation errors');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(form);
      showToast('success', 'Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showToast('error', error?.response?.data || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      {loading && <Loader />}
      <MiniToast show={toast.show} type={toast.type} message={toast.message} />

      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7">
          <div className="card p-4 shadow">
            <h3 className="mb-4 text-center">Reset Password 🔒</h3>
            <form onSubmit={submit}>

              {/* Email */}
              <div className="mb-3">
                <label className="fw-bold">📧 Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* Temporary Password */}
              <div className="mb-3">
                <label className="fw-bold">🔑 Temporary Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.temporaryPassword}
                  onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })}
                  required
                />
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="fw-bold">🆕 New Password</label>
                <div className="position-relative">
                  <input
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    type={showNew ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                    style={{ paddingRight: '45px' }}
                  />
                  {errors.newPassword && (
                    <div className="invalid-feedback">{errors.newPassword}</div>
                  )}
                  <span
                    onClick={() => setShowNew(!showNew)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      userSelect: 'none'
                    }}
                  >
                    {showNew ? '👁️' : '👁️‍🗨️'}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="fw-bold">✅ Confirm Password</label>
                <div className="position-relative">
                  <input
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    style={{ paddingRight: '45px' }}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                  <span
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      userSelect: 'none'
                    }}
                  >
                    {showConfirm ? '👁️' : '👁️‍🗨️'}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-2">
                <button
                  type="button"
                  className="btn btn-secondary w-100 w-md-auto"
                  onClick={() => navigate('/')}
                >
                  🔙 Back to Home
                </button>
                <button
                  className="btn btn-primary w-100 w-md-auto"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Set New Password 🔒'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
