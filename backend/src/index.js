// src/index.js
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB from "./db.js";

// 🔹 Import routes
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // ✅ Route admin mới

// ---------------------------------------------
// 🔧 Cấu hình môi trường & khởi tạo đường dẫn
// ---------------------------------------------
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------
// 🔗 Kết nối MongoDB
// ---------------------------------------------
connectDB();

// ---------------------------------------------
// ⚙️ Tạo ứng dụng Express
// ---------------------------------------------
const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 📁 Static folder cho uploads
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// 🧠 Gắn routes API
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/admin", adminRoutes);

// 🩺 Route kiểm tra server
app.get("/api", (req, res) => {
  res.send("🚀 Server is running and connected to MongoDB!");
});

// 💓 Route health check (dùng khi deploy)
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ---------------------------------------------
// 🌐 Serve frontend build (dist nằm ngoài backend)
// ---------------------------------------------
app.use(express.static(path.join(__dirname, "../../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist", "index.html"));
});

// ---------------------------------------------
// ❌ Middleware xử lý lỗi fallback
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ---------------------------------------------
// 🚀 Khởi động server
// ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
