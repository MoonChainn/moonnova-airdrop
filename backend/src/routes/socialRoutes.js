// src/routes/socialRoutes.js
import express from "express";
import { verifyTelegram } from "../controllers/socialController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Telegram verification
router.post("/verify/telegram", protect, verifyTelegram);

// Nếu muốn thêm Discord sau này, chỉ cần tạo verifyDiscord trong socialController.js
// và thêm route tương ứng, hiện tại xóa để tránh lỗi

export default router;
