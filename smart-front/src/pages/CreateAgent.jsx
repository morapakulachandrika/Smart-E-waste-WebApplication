import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { createPickupAgent } from "../services/agentService";

export default function CreateAgent() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  function showToast(type, message) {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      showToast("danger", "⚠️ All fields are required");
      return;
    }

    setLoading(true);
    try {
      await createPickupAgent(form);
showToast("success", "✅ Pickup Agent created & credentials emailed");

setTimeout(() => {
  navigate("/admin/pickup-agents");
}, 1500);

    } catch (err) {
      showToast("danger", err.response?.data?.message || "❌ Creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <Loader />}

      <div className="container py-5">

        {/* 🔙 Back Button */}
        <div className="mb-4">
          <button
            className="btn btn-outline-primary fw-bold"
            onClick={() => navigate("/admin/pickup-agents")}
          >
            ⬅️ Back
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-5 shadow rounded-4 create-agent-card">
              <h3 className="mb-4 text-center">👷 Create Pickup Agent</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center gap-2 mb-1">
                    <span>👤</span> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Agent Name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center gap-2 mb-1">
                    <span>📧</span> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="agent@email.com"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold d-flex align-items-center gap-2 mb-1">
                    <span>📱</span> Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="10-digit mobile number"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn btn-success fw-bold w-100 mt-3">
                  ➕ Create Agent & Send Credentials
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <div
          className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow text-white ${
            toast.type === "success" ? "bg-success" : "bg-danger"
          }`}
          style={{ minWidth: "250px", zIndex: 9999 }}
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
