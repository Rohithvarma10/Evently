import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import AdminHeader from "../components/AdminHeader";
import { CalendarClock, MapPin, Users } from "lucide-react";

const API_BASE =
  "https://5bec41ab-8071-4f15-8f8e-863807d07b11-00-2a0a15julymht.janeway.replit.dev";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

const isValidObjectId = (id) => typeof id === "string" && /^[a-fA-F\d]{24}$/.test(id);
const niceDate = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function AdminEventBookings() {
  const { id } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isValidObjectId(id)) {
      toast.error("Invalid event id");
      navigate("/admin/events", { replace: true });
    }
  }, [id, navigate]);

  // Event summary
  const {
    data: event,
    isLoading: loadingEvent,
    isError: eventErr,
  } = useQuery({
    queryKey: ["admin-event", id],
    enabled: isValidObjectId(id),
    queryFn: async () => (await api.get(`/api/events/${id}`)).data,
    retry: 1,
  });

  // ✅ Use your existing ADMIN endpoint: /api/bookings/event/:id
  const {
    data: bookings = [],
    isLoading: loadingBks,
    isError: bksErr,
    error,
  } = useQuery({
    queryKey: ["admin-event-bookings", id],
    enabled: isValidObjectId(id),
    queryFn: async () => {
      const res = await api.get(`/api/bookings/event/${id}`);
      return Array.isArray(res.data) ? res.data : res.data?.bookings || [];
    },
    retry: (count, err) => {
      const s = err?.response?.status;
      if (s === 401 || s === 403) return false;
      return count < 2;
    },
  });

  const capacity = Number(event?.capacity ?? 0);
  const booked = bookings.reduce((sum, b) => sum + (b.seats ?? b.tickets ?? 1), 0);
  const seatsLeft = Math.max(capacity - booked, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Event bookings</h1>
          <Link
            to="/admin/events"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Event summary */}
        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          {loadingEvent ? (
            <p>Loading event…</p>
          ) : eventErr ? (
            <p className="text-red-600">Couldn’t load event.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  <CalendarClock className="mr-1 inline-block h-4 w-4" />
                  {niceDate(event.date)} <span className="mx-2">•</span>
                  <MapPin className="mr-1 inline-block h-4 w-4" />
                  {event.location}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1">
                  <Users className="h-4 w-4" />
                  Capacity: {capacity}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  Booked: {booked}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 border ${
                    seatsLeft === 0
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Left: {seatsLeft}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bookings list */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-slate-800">All bookings</h3>

          {loadingBks && <p>Loading bookings…</p>}

          {bksErr && (
            <p className="text-red-600">
              Error loading bookings{" "}
              <span className="text-xs text-slate-500">
                {error?.response?.data?.msg || error?.message || ""}
              </span>
            </p>
          )}

          {!loadingBks && !bksErr && bookings.length === 0 && (
            <p className="text-slate-600">No bookings yet.</p>
          )}

          {!loadingBks && !bksErr && bookings.length > 0 && (
            <div className="divide-y">
              {bookings.map((b, i) => {
                const u = b.user || {};
                const userName = u.name || u.username || "Unknown User";
                const email = u.email || "Unknown Email";
                const seats = b.seats ?? b.tickets ?? 1;
                const when = b.createdAt || b.bookedAt || b.updatedAt;

                return (
                  <div
                    key={b._id || i}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{userName}</div>
                      <div className="text-xs text-slate-600">{email}</div>
                    </div>
                    <div className="text-sm text-slate-700">Seats: {seats}</div>
                    <div className="text-xs text-slate-500">{niceDate(when)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

