// src/temp/AdminEvents.jsx
import React, { useMemo, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

import CreateEventForm from "./CreateEventForm";
import EditEvent from "./EditEvent";
import AdminHeader from "../components/AdminHeader";

import { MapPin, Users, CalendarClock, Ticket } from "lucide-react";

// use shared axios instance from lib/api

const isValidObjectId = (id) => typeof id === "string" && /^[a-fA-F\d]{24}$/.test(id);
const niceDate = (d) =>
  new Date(d).toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const SeatsLeftPill = memo(function SeatsLeftPill({ eventId, capacity }) {
  const enabled = Boolean(isValidObjectId(eventId) && Number.isFinite(Number(capacity)));

  const { data } = useQuery({
    queryKey: ["admin-event-bookings-total", eventId],
    enabled,
    queryFn: async () => {
      const res = await api.get(`/api/events/${eventId}/bookings`);
      const bookings = Array.isArray(res.data) ? res.data : res.data?.bookings || [];
      const booked = bookings.reduce((sum, b) => sum + (b.seats ?? b.tickets ?? 1), 0);
      return { booked, seatsLeft: Math.max(Number(capacity) - booked, 0) };
    },
    staleTime: 0,
    retry: 1,
  });

  if (!enabled || !data) return null;

  const soldOut = data.seatsLeft === 0;
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border";
  const ok = "bg-emerald-50 text-emerald-700 border-emerald-200";
  const bad = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className={`${base} ${soldOut ? bad : ok}`}>
      <Ticket className="h-3.5 w-3.5" />
      {soldOut ? "Sold out" : `${data.seatsLeft} left`}
    </span>
  );
});

export default function AdminEvents() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => (await api.get(`/api/events`)).data,
    staleTime: 0,
    retry: false,
    onError: (error) => {
      console.error("Fetch error:", error);
      toast.error(error?.response?.data?.msg || "Failed to load events");
    },
  });

  const safeEvents = useMemo(
    () => (Array.isArray(data) ? data : []).filter((e) => isValidObjectId(e?._id)),
    [data]
  );

  const handleEventCreated = () => {
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    queryClient.invalidateQueries({ queryKey: ["admin-event-bookings-total"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (eventId) => api.delete(`/api/events/${eventId}`),
    onSuccess: () => {
      toast.success("Event deleted");
      setDeletingId(null);
      setEditingEvent(null);
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-event-bookings-total"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(err?.response?.data?.msg || "Failed to delete event");
      setDeletingId(null);
    },
  });

  const handleDelete = (event) => {
    if (!event?._id) return;
    const ok = window.confirm(`Delete "${event.title}"? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(event._id);
    deleteMutation.mutate(event._id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <div className="px-4 py-8 mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600 text-sm md:text-base">
            Manage events, bookings, and updates in one place.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <button
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close" : "+ Create Event"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-4 rounded shadow mb-6">
            <CreateEventForm
              onSuccess={handleEventCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {isLoading && <p>Loading events...</p>}
        {isError && (
          <p className="text-red-600 text-center mt-6">⚠️ Failed to load events.</p>
        )}
        {!isLoading && safeEvents.length === 0 && (
          <p className="text-gray-600 text-center mt-10">No events found. Create one!</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {safeEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow border hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <img
                src={event.image || "https://via.placeholder.com/400x200?text=No+Image"}
                alt={event.title}
                className="w-full h-56 object-cover"
              />

              <div className="p-4 flex flex-col flex-grow justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-gray-800">{event.title}</h2>

                  <p className="text-sm text-gray-500">
                    <CalendarClock className="inline-block w-4 h-4 mr-1" />
                    {niceDate(event.date)}
                  </p>

                  <p className="text-sm text-gray-600">
                    <MapPin className="inline-block w-4 h-4 mr-1" />
                    {event.location}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="inline-block w-4 h-4" />
                    <span>Capacity: {event.capacity}</span>
                    <SeatsLeftPill eventId={event._id} capacity={event.capacity} />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    onClick={() => navigate(`/admin/events/${event._id}/bookings`)}
                  >
                    View Bookings
                  </button>

                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    onClick={() => setEditingEvent(event)}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-60"
                    onClick={() => handleDelete(event)}
                    disabled={deletingId === event._id || deleteMutation.isLoading}
                  >
                    {deletingId === event._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>

              {editingEvent?._id === event._id && (
                <div className="px-4 pt-2 pb-4 border-t">
                  <EditEvent event={editingEvent} onClose={() => setEditingEvent(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
