// src/temp/MyBookings.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import Header from "../components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Image as ImageIcon } from "lucide-react";

const API_BASE = "http://localhost:3000";

export default function MyBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return [];
      }
      try {
        // 1) try /api/bookings/me
        const res = await axios.get(`${API_BASE}/api/bookings/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = res.data;
        return Array.isArray(j?.bookings) ? j.bookings : Array.isArray(j) ? j : [];
      } catch (err) {
        const status = err?.response?.status;

        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login", { replace: true });
          throw err;
        }
        if (status === 404 || status === 400) {
          // 2) some backends don’t prefix /api
          const res2 = await axios.get(`${API_BASE}/bookings/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const j2 = res2.data;
          return Array.isArray(j2?.bookings) ? j2.bookings : Array.isArray(j2) ? j2 : [];
        }
        throw err;
      }
    },
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <Header />

      <main className="mx-auto max-w-6xl p-6">
        <Button
          variant="link"
          className="px-0 mb-6 text-indigo-600"
          onClick={() => navigate("/events")}
        >
          ← Back to Events
        </Button>

        <h1 className="mb-8 text-center text-3xl font-bold text-indigo-700">My Bookings</h1>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 w-full animate-pulse bg-gray-200" />
                <CardContent className="space-y-3 p-4">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-red-600 font-medium">Failed to load bookings.</p>
            <p className="text-sm text-gray-500">
              {error?.response?.data?.message || error?.response?.data?.msg || error?.message}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && Array.isArray(data) && data.length === 0 && (
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle>No bookings yet</CardTitle>
              <CardDescription>
                When you book an event, it will appear here.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Bookings grid */}
        {!isLoading && !isError && Array.isArray(data) && data.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((b) => {
              const ev = b?.event || {};
              const title = ev.title || "Untitled Event";
              const dateStr = ev.date
                ? new Date(ev.date).toLocaleString()
                : "Date TBA";
              const location = ev.location || "Location TBA";
              const img =
                ev.image || "https://via.placeholder.com/800x450.png?text=Event+Image";

              return (
                <Card key={b._id || `${title}-${dateStr}`} className="overflow-hidden p-0">
                  {/* Image flush to top */}
                  {img ? (
                    <img
                      src={img}
                      alt={title}
                      className="block h-48 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/800x450.png?text=Event+Image";
                      }}
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  <CardContent className="p-4">
                    <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {location}
                      </span>
                    </div>

                    <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                      You booked this event 🎟️
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
