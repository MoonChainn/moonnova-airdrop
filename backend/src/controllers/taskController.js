// src/controllers/taskController.js
import path from "path";
import * as taskService from "../services/taskService.js";
import * as twitterService from "../services/twitterService.js"; // service twitter
import upload from "../middleware/upload.js"; // middleware upload ảnh

/**
 * 🪐 Lấy danh sách task cho người dùng (chỉ task đang active)
 */
export const getTasks = async (req, res) => {
  try {
    const tasks = await taskService.listTasks({ onlyActive: true });
    return res.json({ ok: true, tasks });
  } catch (err) {
    console.error("[getTasks]", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * 🧩 Lấy toàn bộ task cho admin (bao gồm task ẩn)
 */
export const getAllTasksAdmin = async (req, res) => {
  try {
    const tasks = await taskService.listTasks({ onlyActive: false });
    return res.json({ ok: true, tasks });
  } catch (err) {
    console.error("[getAllTasksAdmin]", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * 🔁 Người dùng hoàn thành task
 */
export const postCompleteTask = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { taskKey, proof } = req.body;

    if (!userId)
      return res.status(400).json({ ok: false, error: "Thiếu userId" });
    if (!taskKey)
      return res.status(400).json({ ok: false, error: "Thiếu taskKey" });

    // Lấy thông tin task
    const task = await taskService.getTaskByKey(taskKey);
    if (!task)
      return res.status(404).json({ ok: false, error: "Task không tồn tại" });

    // Nếu task liên quan Twitter → xác minh qua twitterService
    if (task.platform === "twitter") {
      const { type, target } = task;
      const verified = await twitterService.verifyAction(userId, type, target);
      if (!verified) {
        return res.status(400).json({
          ok: false,
          error: "Xác minh Twitter thất bại hoặc chưa hoàn thành task",
        });
      }
    }

    // ✅ Ghi nhận hoàn thành
    const result = await taskService.completeTask({ userId, taskKey, proof });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[postCompleteTask]", err);
    return res.status(400).json({ ok: false, error: err.message });
  }
};

/**
 * 🧱 Admin tạo task mới (có upload ảnh)
 */
export const createTaskController = [
  upload.single("image"),
  async (req, res) => {
    try {
      const payload = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      if (imageUrl) payload.image = imageUrl;

      const task = await taskService.createTask(payload);
      return res.json({ ok: true, task });
    } catch (err) {
      console.error("[createTaskController]", err);
      return res.status(400).json({ ok: false, error: err.message });
    }
  },
];

/**
 * ✏️ Admin cập nhật task
 */
export const updateTaskController = async (req, res) => {
  try {
    const { key } = req.params;
    const updates = req.body;
    const task = await taskService.updateTask(key, updates);
    return res.json({ ok: true, task });
  } catch (err) {
    console.error("[updateTaskController]", err);
    return res.status(400).json({ ok: false, error: err.message });
  }
};

/**
 * ❌ Admin xóa task
 */
export const deleteTaskController = async (req, res) => {
  try {
    const { key } = req.params;
    const task = await taskService.deleteTask(key);
    return res.json({ ok: true, task });
  } catch (err) {
    console.error("[deleteTaskController]", err);
    return res.status(400).json({ ok: false, error: err.message });
  }
};

/**
 * 🧾 Admin xác minh thủ công
 */
export const manualVerifyTask = async (req, res) => {
  try {
    const { userId, taskKey } = req.body;
    const verified = await taskService.manualVerify({ userId, taskKey });
    return res.json({ ok: true, verified });
  } catch (err) {
    console.error("[manualVerifyTask]", err);
    return res.status(400).json({ ok: false, error: err.message });
  }
};
