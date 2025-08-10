// models/booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // fast lookups per event
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // fast "my bookings"
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { timestamps: true },
);

// Optional: if you want to prevent multiple docs per user+event, make it unique
// bookingSchema.index({ event: 1, user: 1 }, { unique: false });

module.exports = mongoose.model("Booking", bookingSchema);
