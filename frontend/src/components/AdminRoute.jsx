// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * AdminRoute:
 * Protects a route so only authenticated users
 * with the role "admin" can access it.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The component to render if access is allowed.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  // If not logged in, send to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not an admin, send to normal events page
  if (role !== "admin") {
    return <Navigate to="/events" replace />;
  }

  // If admin, allow access
  return children;
};

export default AdminRoute;
