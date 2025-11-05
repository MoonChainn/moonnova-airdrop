import User from "../models/User.js";
import Task from "../models/Task.js";
import Referral from "../models/Referral.js";
import Point from "../models/PointsHistory.js";

// 📊 Dashboard thống kê tổng quan
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalReferrals = await Referral.countDocuments();
    const totalPoints = await Point.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPointsSum = totalPoints.length > 0 ? totalPoints[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        totalReferrals,
        totalPoints: totalPointsSum,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 👤 Lấy toàn bộ danh sách users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// 🧾 Lấy toàn bộ danh sách tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
};

// ➕ Tạo task mới
export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✏️ Cập nhật task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ❌ Xóa task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
