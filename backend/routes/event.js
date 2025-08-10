// routes/events.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const Event = require("../models/event");
const Booking = require("../models/booking");

/* ---------------------------- helpers ---------------------------- */
async function getAvailability(eventId) {
  const event = await Event.findById(eventId);
  if (!event) return null;

  const eventObjectId = new mongoose.Types.ObjectId(eventId);
  const agg = await Booking.aggregate([
    { $match: { event: eventObjectId } },
    { $group: { _id: null, total: { $sum: "$seats" } } },
  ]);

  const totalBooked = agg[0]?.total || 0;
  const capacity = Number(event.capacity) || 0;
  const seatsLeft = Math.max(capacity - totalBooked, 0);

  return {
    capacity,
    totalBooked,
    seatsLeft,
    soldOut: seatsLeft <= 0,
  };
}

/* ---------------------------- routes ---------------------------- */

// ✅ Admin test route
router.get("/admin-test", auth, adminOnly, (_req, res) => {
  res.json({ msg: "✅ Admin access confirmed!" });
});

// ✅ POST /api/events/create - Admin: Create event
router.post("/create", auth, adminOnly, async (req, res) => {
  try {
    const { title, date, location, capacity, image } = req.body;

    const newEvent = new Event({
      title,
      date,
      location,
      capacity,
      image,
      createdBy: req.user.id,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET /api/events - Public: Get all events (sorted by date)
router.get("/", async (_req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ NEW: GET /api/events/:id/availability - Public: current ticket availability
router.get("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid event id" });
    }

    const availability = await getAvailability(id);
    if (!availability) return res.status(404).json({ msg: "Event not found" });

    res.json({ eventId: id, ...availability });
  } catch (err) {
    console.error("❌ Error fetching availability:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET /api/events/:id - Public: Get event by ID
// Add ?includeAvailability=1 to also include { seatsLeft, soldOut, totalBooked, capacity }
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid event id" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (String(req.query.includeAvailability) === "1") {
      const availability = await getAvailability(id);
      return res.json({ ...event.toObject(), ...availability });
    }

    res.json(event);
  } catch (err) {
    console.error("❌ Error fetching event by ID:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ PUT /api/events/:id - Admin: Update event (title/date/etc.)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid event id" });
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Event not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ DELETE /api/events/:id - Admin: Delete event
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid event id" });
    }

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Event not found" });
    res.json({ msg: "✅ Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
