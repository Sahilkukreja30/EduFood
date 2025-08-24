import React from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("accessToken");

  const handleLogout = async () => {
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const response = await axios.post("http://localhost:3000/api/v1/user/logout");
      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <h1 className="logo">CampusCanteen</h1>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/queue">Queue</Link>

        {token ? (
          <>
            <span className="nav-username">Hi, {username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
