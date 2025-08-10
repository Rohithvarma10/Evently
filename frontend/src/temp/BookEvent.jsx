// src/temp/BookEvent.jsx
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import api from "@/lib/api";
import Header from "@/components/header";

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowLeft, Ticket, AlertTriangle } from "lucide-react";

const schema = z.object({
  tickets: z
    .string()
    .min(1, "Enter ticket count")
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= 1, "Tickets must be 1 or more"),
});

export default function BookEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // require auth
  React.useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) navigate("/login", { replace: true });
  }, [navigate]);

  // 1) Event details (title, banner, date)
  const {
    data: event,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => (await api.get(`/api/events/${id}`)).data,
    retry: 1,
  });

  // 2) Live availability (server truth) — ALWAYS OPEN; only care if sold out
  const {
    data: availability,
    isLoading: loadingAvail,
    refetch: refetchAvail,
  } = useQuery({
    queryKey: ["availability", id],
    queryFn: async () => (await api.get(`/api/events/${id}/availability`)).data,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // derive values
  const seatsLeft =
    Number.isFinite(availability?.seatsLeft) ? availability.seatsLeft : null; // null => unknown
  const soldOut = seatsLeft === 0; // only treat as sold out when explicitly 0

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { tickets: "1" },
  });

  const { mutate, isLoading: isBooking } = useMutation({
    mutationFn: async ({ seats }) =>
      (await api.post("/api/bookings", { eventId: id, seats })).data,
    onSuccess: () => {
      toast.success("Booking confirmed!");
      refetchAvail(); // update badge if user navigates back
      navigate("/my-bookings", { replace: true });
    },
    onError: (err) => {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Booking failed";

      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
        return;
      }

      // capacity error or other
      form.setError("tickets", { message: "Not enough tickets available" });
      toast.error(msg);
      refetchAvail();
    },
  });

  const onSubmit = (values) => {
    const requested = Number(values.tickets);
    if (seatsLeft !== null && requested > seatsLeft) {
      form.setError("tickets", { message: `Only ${seatsLeft} ticket(s) left` });
      return;
    }
    if (soldOut) return;
    mutate({ seats: requested });
  };

  const pill = (node, variant = "ok") => {
    const base =
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border";
    const styles =
      variant === "ok"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-rose-50 text-rose-700 border-rose-200";
    return <span className={`${base} ${styles}`}>{node}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="grid place-items-center p-6">
          <Card className="w-full max-w-md overflow-hidden">
            <div className="block h-56 w-full animate-pulse bg-gray-200" />
            <CardContent className="space-y-3 p-6">
              <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.message ||
      "Event not found";
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="grid place-items-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Couldn’t load event</CardTitle>
              <CardDescription className="text-red-600">{msg}</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/events")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
              <Button onClick={() => refetch()}>Try again</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const date = event?.date ? new Date(event.date) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="grid place-items-center p-6">
        <Card className="w-full max-w-md overflow-hidden">
          {/* banner */}
          {event?.image ? (
            <img src={event.image} alt={event.title} className="block h-56 w-full object-cover" />
          ) : (
            <div className="h-56 w-full bg-gray-200" />
          )}

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">Book tickets for</CardTitle>
                <p className="mt-1 text-2xl font-semibold text-indigo-700">
                  {event?.title || "Untitled"}
                </p>
                {date && (
                  <div className="mt-2 flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{date.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* availability pill */}
              <div className="mt-1">
                {loadingAvail
                  ? null
                  : soldOut
                  ? pill(
                      <>
                        <Ticket className="h-3.5 w-3.5" />
                        Tickets unavailable
                      </>,
                      "err"
                    )
                  : seatsLeft !== null
                  ? pill(
                      <>
                        <Ticket className="h-3.5 w-3.5" />
                        {seatsLeft} left
                      </>
                    )
                  : null}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* sold out alert */}
            {soldOut && (
              <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div className="text-sm">
                  <p className="font-medium">Tickets unavailable</p>
                  <p>All seats have been booked for this event.</p>
                </div>
              </div>
            )}

            {/* booking form */}
            <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-1.5">
                <Label htmlFor="tickets">Number of Tickets</Label>
                <Input
                  id="tickets"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  {...form.register("tickets")}
                  aria-invalid={!!form.formState.errors.tickets}
                  disabled={soldOut}
                />
                {seatsLeft !== null && !soldOut && (
                  <p className="text-xs text-slate-500">Up to {seatsLeft} available.</p>
                )}
                {form.formState.errors.tickets && (
                  <p className="text-xs text-red-600">{form.formState.errors.tickets.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-1 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                disabled={isBooking || soldOut}
              >
                {soldOut ? "Sold Out" : isBooking ? "Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(`/events/${event._id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/events">Browse more</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
