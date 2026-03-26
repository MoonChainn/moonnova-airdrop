import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/adminController.js";

const router = express.Router();

// 📊 Dashboard tổng quan
router.get("/stats", getDashboardStats);

// 👤 Users
router.get("/users", getAllUsers);

// 🧾 Tasks CRUD
router.get("/tasks", getAllTasks);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

export default router;
