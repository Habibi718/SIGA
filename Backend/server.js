const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");
const aiRoutes = require("./routes/ai");
const hodRoutes = require("./routes/hod");

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/hod", hodRoutes);

app.get("/", (req, res) => {
  res.send("🚀 SIGA MERN Backend is running...");
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/siga_db";
const PORT = process.env.PORT || 5001;

// Connect to MongoDB Atlas (Async)
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("📥 Connected to MongoDB Atlas successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start listening when not in a Vercel serverless environment (e.g., local development or Railway)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export app for Vercel Serverless Function wrapper
module.exports = app;