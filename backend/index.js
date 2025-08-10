const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ✅✅ Fix CORS: Allow your frontend origin or allow all in dev
app.use(cors({
  origin: '*', // ⚠️ In production, use the exact domain (e.g., "https://yourfrontend.com")
  credentials: true,
}));

app.use(express.json());
app.use(helmet());

// Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const bookingRoutes = require("./routes/booking");

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// Root check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));






