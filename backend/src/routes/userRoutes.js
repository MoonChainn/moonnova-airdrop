// src/routes/userRoutes.js
import express from "express";
import {
  createOrGetUser,
  authUser,
  getUserInfo,
  updateUserProfile,
  completeTask,
  getAllUsers, // ✅ thêm controller này
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Tạo user mới hoặc lấy user cũ (Wallet / Telegram / Email) + referral
router.post("/create-or-get", createOrGetUser);

// 🔹 Đăng nhập email/password
router.post("/login", authUser);

// 🔹 Lấy thông tin profile của chính user (middleware bảo vệ)
router.get("/me", protect, getUserInfo);

// 🔹 Cập nhật profile của chính user (middleware bảo vệ)
router.put("/update", protect, updateUserProfile);

// 🔹 Hoàn thành task + cộng moonPoints + referral bonus (middleware bảo vệ)
router.post("/complete-task", protect, completeTask);

// ✅ Thêm route GET /api/users (dùng để test list user)
router.get("/", getAllUsers);

export default router;
