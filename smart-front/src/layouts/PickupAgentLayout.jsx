import { Outlet, Link } from "react-router-dom";

export default function PickupAgentLayout() {
  return (
    <div className="container py-4">
      <nav className="mb-4 d-flex gap-3">
        <Link to="/pickup-agent">Dashboard</Link>
        <Link to="/pickup-agent/tasks">My Tasks</Link>
      </nav>
      <Outlet />
    </div>
  );
}
