// models/event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },

    // NEW: control whether tickets are on sale
    isPublished: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// (optional) helpful indexes
eventSchema.index({ date: 1 });
eventSchema.index({ isPublished: 1 });

module.exports = mongoose.model("Event", eventSchema);
