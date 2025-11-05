// src/routes/taskRoutes.js
import express from "express";
import {
  getTasks,
  getAllTasksAdmin,
  postCompleteTask,
  createTaskController,
  updateTaskController,
  deleteTaskController,
  manualVerifyTask,
} from "../controllers/taskController.js";

const router = express.Router();

// 🪐 Public: danh sách task đang active
router.get("/", getTasks);

// 🧩 Admin: xem toàn bộ task (bao gồm ẩn)
router.get("/admin", getAllTasksAdmin);

// ✅ API tạo task mới (dành cho admin, có thể upload ảnh)
router.post("/create", createTaskController);

// 🔁 Người dùng hoàn thành task (frontend/bot gọi)
router.post("/complete", postCompleteTask);

// ✏️ Admin: cập nhật / xóa / xác minh thủ công
router.put("/admin/:key", updateTaskController);
router.delete("/admin/:key", deleteTaskController);
router.post("/manual-verify", manualVerifyTask);

export default router;
