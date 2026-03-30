import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/auth";
import { isPickupAgent } from "../utils/auth";

export default function PickupAgentRoute() {
  const token = getToken();

  if (!token) return <Navigate to="/pickup-agent/login" replace />;
  if (!isPickupAgent()) return <Navigate to="/" replace />;

  return <Outlet />;
}
