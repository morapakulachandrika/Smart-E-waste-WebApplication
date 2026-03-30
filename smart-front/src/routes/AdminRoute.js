import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken, isAdmin } from "../utils/auth";

export default function AdminRoute() {
  const token = getToken();

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;

  return <Outlet />; // 🔥 REQUIRED
}
