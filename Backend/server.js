const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder imports (we will write these files next)
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
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("📥 Connected to MongoDB Atlas successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });