import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isAdmin, clearToken, getUserIdFromToken } from "../utils/auth";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = isAdmin();
  const userId = getUserIdFromToken();
  const role = localStorage.getItem("role"); // "ROLE_ADMIN", "ROLE_USER", "PICKUP_AGENT"


  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  // LOGOUT (USER + ADMIN)
  const logout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  const isDashboard = location.pathname === `/user/${userId}`;
  const isProfile =
    location.pathname === `/user/settings` ||
    location.pathname === `/profile/${userId}`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown") && openUserMenu) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openUserMenu]);

  return (
    <header className="custom-header shadow-sm">
      <div className="header-container">
        {/* LOGO */}
        <div
          className="logo-section"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="header-logo">E</div>
          <div>
            <h5 className="mb-0 brand-title">Smart E-Waste</h5>
            <small className="brand-sub">Recycle smartly</small>
          </div>
        </div>

        {/* HAMBURGER */}
        <button
          className="hamburger-btn"
          onClick={() => setOpenMenu(!openMenu)}
        >
          ☰
        </button>

        <nav className={`nav-links ${openMenu ? "open" : ""}`}>



          {/* HOME — ONLY FOR PUBLIC USERS */}
          {!userId && (
            <Link
              to="/"
              className="btn btn-outline-custom nav-btn"
              onClick={() => setOpenMenu(false)}
            >
              Home
            </Link>
          )}

          {/* PUBLIC */}
          {!userId && (
            <>
              <Link
                to="/login"
                className="btn btn-outline-custom nav-btn"
                onClick={() => setOpenMenu(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-solid-custom nav-btn"
                onClick={() => setOpenMenu(false)}
              >
                Register
              </Link>
            </>
          )}

          {/* ADMIN */}
          {userId && admin && (
            <>
              <Link
                to="/admin"
                className="btn btn-solid-custom nav-btn"
                onClick={() => setOpenMenu(false)}
              >
                Dashboard
              </Link>

              <button
                className="btn btn-danger nav-btn"
                onClick={() => {
                  logout();
                  setOpenMenu(false);
                }}
              >
                Logout
              </button>
            </>
          )}

          {/* PICKUP AGENT: Only show Logout */}
{userId && role === "ROLE_PICKUP_AGENT" && (
  <button
    className="btn btn-danger nav-btn"
    onClick={() => {
      logout();
      setOpenMenu(false);
    }}
  >
    Logout
  </button>
)}


          {/* USER (UNCHANGED LOGIC) */}
          {userId && !admin && role !=="ROLE_PICKUP_AGENT"&&(
            <div className="dropdown d-inline-block">
              <button
                className="emoji-avatar-btn"
                onClick={() => setOpenUserMenu(!openUserMenu)}
              >
                👤
              </button>

              {openUserMenu && (
                <ul className="dropdown-menu dropdown-menu-end custom-dropdown show">
                  <li>
                    <button
                      className={`dropdown-item ${
                        isDashboard ? "active" : ""
                      }`}
                      onClick={() => {
                        navigate(`/user/${userId}`);
                        setOpenMenu(false);
                        setOpenUserMenu(false);
                      }}
                    >
                      My Dashboard
                    </button>
                  </li>

                  <li>
                    <button
                      className={`dropdown-item ${isProfile ? "active" : ""}`}
                      onClick={() => {
                        navigate(`/user/settings`);
                        setOpenMenu(false);
                        setOpenUserMenu(false);
                      }}
                    >
                      Settings
                    </button>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button
                      className="dropdown-item text-danger fw-bold"
                      onClick={() => {
                        logout();
                        setOpenMenu(false);
                        setOpenUserMenu(false);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
