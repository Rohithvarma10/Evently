// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./temp/register";
import Login from "./temp/login";
import Events from "./temp/events";
import EventDetail from "./temp/eventdetails";
import BookEvent from "./temp/BookEvent";
import MyBookings from "./temp/MyBookings";
import AdminEvents from "./temp/AdminEvents";
import AdminEventBookings from "./temp/AdminEventBookings"; // ✅ NEW

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Routes>
        {/* Default -> Register (keep as you had) */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Public */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User (protected) */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Admin-only */}
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events/:id/bookings"          // ✅ NEW admin bookings page
          element={
            <AdminRoute>
              <AdminEventBookings />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  );
}
