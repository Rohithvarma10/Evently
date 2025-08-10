// src/temp/eventdetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import Header from "@/components/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  Tag,
  User as UserIcon,
  Share2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// use shared axios instance from lib/api

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await api.get(`/api/events/${id}`);
      return res.data;
    },
    retry: 1,
  });

  if (isError) {
    const status = error?.response?.status;
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.message ||
      "Failed to load event";

    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
      return null;
    }

    return (
      <div className="min-h-screen bg-[#fef9f4]">
        <Header />
        <div className="mx-auto grid place-items-center px-6 py-16">
          <div className="text-center">
            <p className="mb-3 text-red-600">{msg}</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fef9f4]">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Card className="overflow-hidden">
            <div className="h-72 w-full animate-pulse bg-gray-200" />
            <CardContent className="space-y-4 p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const event = data || {};
  const dateObj = event.date ? new Date(event.date) : null;

  const capacity = typeof event.capacity === "number" ? event.capacity : undefined;
  const booked = typeof event.booked === "number" ? event.booked : undefined;
  const seatsLeft =
    typeof capacity === "number" && typeof booked === "number"
      ? Math.max(capacity - booked, 0)
      : typeof event.seatsAvailable === "number"
      ? event.seatsAvailable
      : undefined;

  const soldOut = typeof seatsLeft === "number" && seatsLeft <= 0;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title || "Event", text: "Check out this event", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  const category = event.category || event.type;
  const tags = Array.isArray(event.tags) ? event.tags : [];

  const pill = (children, variant = "secondary") => {
    const base =
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium";
    const styles =
      variant === "secondary"
        ? "bg-gray-100 text-gray-800 border border-gray-200"
        : "bg-indigo-600 text-white";
    return <span className={`${base} ${styles}`}>{children}</span>;
  };

  return (
    <div className="min-h-screen bg-[#fef9f4]">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-6">
        <Card className="overflow-hidden">
          <div className="relative">
            {event.image ? (
              <img src={event.image} alt={event.title} className="h-72 w-full object-cover" />
            ) : (
              <div className="h-72 w-full bg-gray-200" />
            )}

            {/* SOLD OUT ribbon on image */}
            {soldOut && (
              <div className="absolute left-3 top-3 rounded-md bg-rose-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
                Sold Out
              </div>
            )}
          </div>

          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {event.title || "Untitled Event"}
                </CardTitle>
                {dateObj && (
                  <CardDescription className="mt-1 flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {dateObj.toLocaleDateString()} <span className="mx-1">•</span>
                    <Clock className="h-4 w-4" />
                    {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </CardDescription>
                )}
              </div>

              <div className="flex items-center gap-2">
                {category && pill(<><Tag className="h-3.5 w-3.5" />{category}</>, "secondary")}
                {typeof seatsLeft === "number" &&
                  (soldOut
                    ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-rose-600 text-white">
                        <Ticket className="h-3.5 w-3.5" />
                        Sold out
                      </span>
                    )
                    : pill(<><Ticket className="h-3.5 w-3.5" />{seatsLeft} left</>, "primary"))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Tickets unavailable alert */}
            {soldOut && (
              <div className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Tickets unavailable</p>
                  <p>All seats for this event have been booked.</p>
                </div>
              </div>
            )}

            {/* Quick Facts */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {event.location && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
              )}
              {typeof capacity === "number" && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Users className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p>
                      {capacity.toLocaleString()}
                      {typeof booked === "number" ? ` (booked ${booked})` : ""}
                    </p>
                  </div>
                </div>
              )}
              {event.organizer && (
                <div className="flex items-start gap-2 text-gray-700">
                  <UserIcon className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p>{event.organizer}</p>
                  </div>
                </div>
              )}
              {event.price != null && (
                <div className="flex items-start gap-2 text-gray-700">
                  <DollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p>
                      {Number(event.price).toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {event.description && (
              <p className="leading-relaxed text-gray-800 whitespace-pre-line">
                {event.description}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-3">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              onClick={() => navigate(`/book/${event._id}`)}
              disabled={soldOut}
            >
              {soldOut ? "Sold Out" : "Book this Event"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/events")}>
              Back to Events
            </Button>
            <Button variant="outline" onClick={share}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
