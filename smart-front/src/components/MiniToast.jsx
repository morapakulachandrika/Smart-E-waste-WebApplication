import React from "react";
import "./miniToast.css";

export default function MiniToast({ show, type, message }) {
  if (!show) return null;

  return (
    <div className={`mini-toast ${type}`}>
      <div className="toast-icon">
        {type === "success" && "✅"}
        {type === "error" && "❌"}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
}
