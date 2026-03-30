import React, { useState, useEffect } from 'react';
import { register } from '../services/authService';
import Loader from '../components/Loader';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  // Regex patterns
  const regex = {
    name: /^[A-Za-z\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{10}$/
  };

  // Real-time validation
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    if (value.trim() === '') {
      setErrors(prev => ({ ...prev, [field]: '⚠️ This field is required' }));
    } else if (!regex[field].test(value.trim())) {
      let msg = '';
      if (field === 'name') msg = '⚠️ Name must be at least 3 letters and alphabets only';
      if (field === 'email') msg = '⚠️ Enter a valid email';
      if (field === 'phone') msg = '⚠️ Phone must be 10 digits';
      setErrors(prev => ({ ...prev, [field]: msg }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    Object.keys(form).forEach(field => {
      if (!regex[field].test(form[field].trim())) {
        valid = false;
        handleChange(field, form[field]);
      }
    });
    return valid;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ show: true, message: '⚠️ Please fix the errors before submitting', type: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);
      setToast({
        show: true,
        message: res.data?.message || '✅ Registration submitted. Wait for admin approval.',
        type: 'success'
      });
      setForm({ name: '', email: '', phone: '' });
      setErrors({ name: '', email: '', phone: '' });
    } catch (error) {
      const backendError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        '❌ Registration failed';
      setToast({ show: true, message: backendError, type: 'danger' });
    }
    setLoading(false);
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
  if (!toast.show) return;

  const timer = setTimeout(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, 3000);

  return () => clearTimeout(timer);
}, [toast.show]);


  return (
    <>
      {loading && <Loader />}

      <div className="container py-3"> {/* Reduced from py-5 to py-3 */}
  <div className="row justify-content-center">
    <div className="col-md-7 col-lg-6">
      <div className="card p-3 p-md-4 shadow rounded-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 className="mb-3 text-center">📝 Register</h3> {/* Reduced mb-4 → mb-3 */}

        <form onSubmit={submit}>
          {/* Name */}
          <div className="mb-2"> {/* Reduced mb-3 → mb-2 */}
            <label className="form-label fw-bold">👤 Full Name</label>
            <input
              className={`form-control ${errors.name ? 'border-danger' : ''}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
            {errors.name && <small className="text-danger">{errors.name}</small>}
          </div>

          {/* Email */}
          <div className="mb-2">
            <label className="form-label fw-bold">📧 Email</label>
            <input
              className={`form-control ${errors.email ? 'border-danger' : ''}`}
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              required
            />
            {errors.email && <small className="text-danger">{errors.email}</small>}
          </div>

          {/* Phone */}
          <div className="mb-3"> {/* Keep a bit more space for phone */}
            <label className="form-label fw-bold">📞 Phone</label>
            <input
              className={`form-control ${errors.phone ? 'border-danger' : ''}`}
              placeholder="Enter your 10-digit phone number"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              required
            />
            {errors.phone && <small className="text-danger">{errors.phone}</small>}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3"> {/* Reduced mt-4 → mt-3 */}
            <button type="submit" className="btn btn-primary px-4 py-2 fw-bold">✅ Register</button>
            <a className="btn btn-outline-secondary px-4 py-2" href="/">🔙 Back to Home</a>
          </div>
        </form>

        <div className="text-center mt-3"> {/* Reduced mt-4 → mt-3 */}
          Already have an account?{" "}
          <a href="/login" className="text-primary fw-bold">Login 🔑</a>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Animated Floating Toast */}
      {toast.show && (
  <div
    className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow text-white ${
      toast.type === 'success' ? 'bg-success' : 'bg-danger'
    }`}
    style={{
      minWidth: '260px',
      zIndex: 9999,
      opacity: toast.show ? 1 : 0,
      transform: toast.show ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'all 0.4s ease-in-out',
    }}
  >
    <div className="d-flex justify-content-between align-items-center">
      <div>{toast.message}</div>
      <button
        className="btn-close btn-close-white ms-2"
        onClick={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  </div>
)}
{toast.show && (
  <div
    className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow text-white ${
      toast.type === 'success' ? 'bg-success' : 'bg-danger'
    }`}
    style={{
      minWidth: '260px',
      zIndex: 9999,
      opacity: toast.show ? 1 : 0,
      transform: toast.show ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'all 0.4s ease-in-out',
    }}
  >
    <div className="d-flex justify-content-between align-items-center">
      <div>{toast.message}</div>
      <button
        className="btn-close btn-close-white ms-2"
        onClick={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  </div>
)}

    </>
  );
}
