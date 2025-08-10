// routes/booking.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const Booking = require("../models/booking");
const Event = require("../models/event");

/**
 * POST /api/bookings
 * Book an event (auth required)
 * body: { eventId: string, seats?: number }
 */
router.post("/", auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    let { seats } = req.body;

    if (!eventId) {
      return res.status(400).json({ msg: "eventId is required" });
    }

    // normalize/validate seats
    seats = Number(seats ?? 1);
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({ msg: "seats must be a positive integer" });
    }

    // 1) find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    // 2) sum already-booked seats for this event (explicit ObjectId for $match)
    const eventObjectId = new mongoose.Types.ObjectId(event._id);
    const agg = await Booking.aggregate([
      { $match: { event: eventObjectId } },
      { $group: { _id: null, total: { $sum: "$seats" } } },
    ]);

    const totalBooked = agg[0]?.total || 0;
    const remaining = (event.capacity ?? 0) - totalBooked;

    // 3) capacity check
    if (seats > remaining) {
      return res.status(400).json({ msg: "Not enough seats available" });
    }

    // 4) create booking
    const booking = new Booking({
      event: event._id,
      user: req.user.id,
      seats,
    });

    const saved = await booking.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error booking event:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/bookings/me
 * Logged-in user's bookings
 */
router.get("/me", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate(
      "event",
    );
    res.json(bookings);
  } catch (err) {
    console.error("❌ Error fetching user bookings:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/bookings/event/:id
 * Admin: bookings for a specific event
 */
router.get("/event/:id", auth, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ event: req.params.id }).populate(
      "user",
      "-password",
    );
    res.json(bookings);
  } catch (err) {
    console.error("❌ Error fetching bookings for event:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
