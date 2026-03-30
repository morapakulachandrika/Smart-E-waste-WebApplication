import React from "react";
import { FaEnvelope, FaPhone, FaRecycle } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="footer text-light"
      style={{
        background: "linear-gradient(135deg, #0d0d0f, #1b1b1e)",
        fontSize: "0.92rem",
        padding: "20px 0",
      }}
    >
      <div className="container">

        <div className="row align-items-center gy-3">

          {/* Branding */}
          <div className="col-md-4 d-flex flex-column align-items-center align-items-md-start">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-1">
              <FaRecycle size={20} color="#7deb71" />
              Smart E-Waste
            </h5>
            <small style={{ color: "#ffffff", textAlign: "center", textAlignLast: "left" }}>
              Responsible recycling & certified disposal for a greener tomorrow.
            </small>
          </div>

          {/* Contact Section */}
          <div className="col-md-4 d-flex flex-column align-items-center">
            <h6 className="fw-bold mb-1">Contact Us</h6>
            <small className="d-block" style={{ color: "#ffffff" }}>
              <FaEnvelope className="me-2" /> smartewaste.info@gmail.com
            </small>
            <small className="d-block" style={{ color: "#ffffff" }}>
              <FaPhone className="me-2" /> +91 96520 855xx
            </small>
          </div>

          {/* Copyright Section */}
          <div className="col-md-4 d-flex flex-column align-items-center align-items-md-end">
            <small style={{ color: "#ffffff", textAlign: "center", textAlignLast: "right" }}>
              © {new Date().getFullYear()} Smart E-Waste <br />
              All Rights Reserved.
            </small>
          </div>

        </div>

        {/* Optional Divider */}
        <hr style={{ borderColor: "rgba(255,255,255,0.2)", margin: "12px 0 0 0" }} />

      </div>
    </footer>
  );
}
