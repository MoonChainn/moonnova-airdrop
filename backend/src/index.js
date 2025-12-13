
// src/index.js
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB from "./db.js";

// 🔹 Import ALL routes
import userRoutes from "./routes/userRoutes.js";          // Các API user cũ
import walletRoutes from "./routes/walletRoutes.js";      // Wallet login / merge / referral / add-points
import taskRoutes from "./routes/taskRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ---------------------------------------------
// 🔧 Config environment & dirname
// ---------------------------------------------
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------
// 🔗 MongoDB Connection
// ---------------------------------------------
connectDB();

// ---------------------------------------------
// ⚙️ Create Express App
// ---------------------------------------------
const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 📁 Static folder for uploads
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ---------------------------------------------
// 🧠 ALL API Routes
// ---------------------------------------------
app.use("/api/users", userRoutes);       // User routes cũ
app.use("/api/wallet", walletRoutes);    // Wallet routes riêng
app.use("/api/tasks", taskRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/admin", adminRoutes);

// ---------------------------------------------
// 🩺 Server check routes
// ---------------------------------------------
app.get("/api", (req, res) => {
  res.send("🚀 Server is running and connected to MongoDB!");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ---------------------------------------------
// 🌐 FRONTEND SERVE (Vite build inside backend/src/dist)
// ---------------------------------------------
app.use(express.static(path.join(__dirname, "./dist")));

// TonConnect manifest special route
app.get('/tonconnect-manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "tonconnect-manifest.json"), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Fallback for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist", "index.html"));
});

// ---------------------------------------------
// ❌ Global Error Handler
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ---------------------------------------------
// 🚀 Start Server
// ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});









app.use(express.json()); // middleware parse JSON
app.use((req, res, next) => {
  console.log("Incoming body:", req.body); // log body gửi lên
  next();
});