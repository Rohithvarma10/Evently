// src/temp/events.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "@/lib/api";
import Header from "../components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Events() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/events`);
        return Array.isArray(res.data?.events) ? res.data.events : res.data;
      } catch (err) {
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          const res2 = await api.get(`/events`);
          return Array.isArray(res2.data?.events) ? res2.data.events : res2.data;
        }
        throw err;
      }
    },
    retry: 1,
    staleTime: 60 * 1000,
  });

  if (isError && error?.response?.status === 401) {
    toast.error("Session expired. Please log in again.");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fef9f4]">
      <Header />

      <main className="p-6">
        <section className="mx-auto mb-8 flex max-w-6xl flex-col items-center text-center">
          <p className="text-3xl sm:text-4xl font-bold text-purple-700">
            Discover &amp; Book Exciting Events
          </p>
        </section>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden p-0">
                <div className="block h-48 w-full animate-pulse bg-gray-200" />
                <div className="px-4 pb-4 pt-1">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200 -mt-1" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 mt-2" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 mt-1" />
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200 mt-3" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error (non-401) */}
        {isError && !isLoading && error?.response?.status !== 401 && (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
            <p className="text-lg text-red-600">
              {error?.response?.data?.message ||
                error?.response?.data?.msg ||
                error?.message ||
                "Failed to load events."}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        )}

        {/* Events grid */}
        {!isLoading && !isError && Array.isArray(data) && data.length > 0 && (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((event) => {
              const dateStr = event.date
                ? new Date(event.date).toDateString()
                : "To be announced";
              const locationStr = event.location || "To be announced";

              return (
                <Card
                  key={event._id}
                  className="overflow-hidden p-0 transition hover:shadow-lg"
                >
                  {/* Image */}
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="block h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200" />
                  )}

                  {/* CONTENT — no top padding, tiny negative margin on title */}
                  <div className="px-4 pb-4 pt-1">
                    <h3 className="-mt-1 text-center text-3xl sm:text-4xl font-extrabold font-sans text-black leading-tight">
                      {event.title}
                    </h3>

                    <div className="mt-2 text-center text-base">
                      <span className="font-semibold text-indigo-700">📅 Date:</span>{" "}
                      <span className="text-gray-800">{dateStr}</span>
                    </div>

                    <div className="mt-1 text-center text-base">
                      <span className="font-semibold text-indigo-700">📍 Location:</span>{" "}
                      <span className="text-gray-800">{locationStr}</span>
                    </div>

                    <Button
                      className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && Array.isArray(data) && data.length === 0 && (
          <div className="flex h-[50vh] flex-col items-center justify-center">
            <p className="text-gray-600">No events available right now.</p>
          </div>
        )}
      </main>
    </div>
  );
}
