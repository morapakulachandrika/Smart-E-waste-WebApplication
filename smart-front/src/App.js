import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import WasteRequestForm from "./components/WasteRequestForm";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserDashboard from "./pages/UserDashboard";
import UserSettings from "./pages/UserSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminEwasteRequests from "./pages/AdminEwasteRequests";
import AdminEwasteHistory from "./pages/AdminEwasteHistory";
import AdminEwasteManagement from "./pages/AdminEwasteManagement";
import NotFound from "./pages/NotFound";
import UserEwasteHistory from "./pages/UserEwasteHistory";
import AdminAssignmentHistory from "./pages/AdminAssignmentHistory";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import PickupAgentRoute from "./routes/PickupAgentRoute";
import AgentHistory from "./pages/AgentHistory";


import AdminPickupAgents from "./pages/AdminPickupAgents";
import CreateAgent from "./pages/CreateAgent";
import AssignAgents from "./pages/AssignAgents";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* HEADER ALWAYS */}
      <Header />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      <main className="flex-grow-1">
        <Routes>
          {/* ================= PUBLIC ROUTES (FOOTER ENABLED) ================= */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Login />
                <Footer />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Register />
                <Footer />
              </>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <>
                <ForgotPassword />
                <Footer />
              </>
            }
          />
          <Route
            path="/reset-password"
            element={
              <>
                <ResetPassword />
                <Footer />
              </>
            }
          />

          {/* ================= USER ROUTES (NO FOOTER) ================= */}
          <Route
            path="/new-request"
            element={
              <ProtectedRoute>
                <WasteRequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-history"
            element={
              <ProtectedRoute>
                <UserEwasteHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:id"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/settings"
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ROUTES (NO FOOTER) ================= */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pickup-agents" element={<AdminPickupAgents />} />
            <Route path="/admin/create-agent" element={<CreateAgent />} />
            <Route path="/admin/user-requests" element={<AdminEwasteRequests />} />
            <Route path="/admin/assign-agents" element={<AssignAgents />} />
            <Route path="/admin/user-request-history" element={<AdminEwasteHistory />} />
            <Route path="/admin/ewaste-management" element={<AdminEwasteManagement />} />
            <Route path="/admin/assignment-history" element={<AdminAssignmentHistory />} />
          </Route>

          {/* ================= PICKUP AGENT ROUTES ================= */}
          <Route element={<PickupAgentRoute />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/history" element={<AgentHistory />} />
            {/* Add more agent routes here in the future */}
          </Route>

          {/* ================= 404 ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
