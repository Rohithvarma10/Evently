import React from "react";
import { Navigate } from "react-router-dom";

// children: the page to protect
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If token is missing, redirect to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Else allow access to the page
  return children;
};

export default ProtectedRoute;
