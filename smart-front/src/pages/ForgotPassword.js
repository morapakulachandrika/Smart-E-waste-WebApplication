import React, { useState, useEffect } from 'react';
import { forgotPassword } from '../services/authService';
import Loader from '../components/Loader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (value) => {
    setEmail(value);
    if (!value.trim()) setError('⚠️ Email is required');
    else if (!emailRegex.test(value.trim())) setError('⚠️ Enter a valid email');
    else setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email.trim())) {
      setToast({ show: true, message: '⚠️ Please enter a valid email', type: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setToast({ show: true, message: res.data || '✅ Reset instructions sent to your email.', type: 'success' });
      setEmail('');
    } catch (err) {
      setToast({ show: true, message: err?.response?.data || '❌ Error sending reset instructions', type: 'danger' });
    }
    setLoading(false);
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

      <div className="container py-3">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card p-4 p-md-5 shadow rounded-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 className="mb-3 text-center">🔑 Forgot Password</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">📧 Email</label>
                  <input
                    type="email"
                    className={`form-control ${error ? 'border-danger' : ''}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => handleChange(e.target.value)}
                    required
                  />
                  {error && <small className="text-danger">{error}</small>}
                </div>

                <button type="submit" className="btn btn-primary px-4 py-2 fw-bold">📩 Send Reset Link</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Floating Toast */}
      <div
        className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow text-white ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}
        style={{
          minWidth: '250px',
          zIndex: 9999,
          transform: toast.show ? 'translateX(0)' : 'translateX(300px)',
          transition: 'transform 0.5s ease-in-out',
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
    </>
  );
}
