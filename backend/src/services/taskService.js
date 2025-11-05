// src/services/taskService.js
import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js"; // path theo project của anh

/**
 * completeTask:
 * - kiểm tra task tồn tại và active
 * - kiểm tra user chưa hoàn thành task (idempotency)
 * - validate proof đơn giản (theo task.meta)
 * - thêm record vào user.tasksCompleted
 * - cộng điểm cho user (atomic)
 */
export async function completeTask({ userId, taskKey, proof = null }) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const task = await Task.findOne({ key: taskKey }).session(session);
    if (!task || !task.active) {
      throw new Error("Task không tồn tại hoặc chưa active");
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User không tồn tại");

    const already =
      user.tasksCompleted &&
      user.tasksCompleted.some((t) => t.taskKey === taskKey);

    if (already) {
      await session.commitTransaction();
      session.endSession();
      return { alreadyCompleted: true, pointsAwarded: 0, user };
    }

    // ✅ Validate proof đơn giản (có thể mở rộng thêm)
    if (task.meta && task.meta.requireTelegram && (!proof || !proof.telegramId)) {
      throw new Error("Proof thiếu telegramId");
    }

    // ✅ Cập nhật user: thêm completed + cộng điểm
    const completionRecord = {
      taskKey: task.key,
      taskId: task._id,
      completedAt: new Date(),
      proof,
    };

    user.tasksCompleted = user.tasksCompleted || [];
    user.tasksCompleted.push(completionRecord);
    user.points = (user.points || 0) + (task.points || 0);
    await user.save({ session });

    // ✅ Cập nhật thống kê của task
    task.completionsCount = (task.completionsCount || 0) + 1;
    await task.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { alreadyCompleted: false, pointsAwarded: task.points, user };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

export async function listTasks({ onlyActive = true } = {}) {
  const q = onlyActive ? { active: true } : {};
  return Task.find(q).sort({ createdAt: 1 }).lean();
}

export async function getTaskByKey(key) {
  return Task.findOne({ key }).lean();
}

export async function createTask(payload) {
  const t = new Task(payload);
  return t.save();
}

export async function updateTask(key, updates) {
  updates.updatedAt = new Date();
  return Task.findOneAndUpdate({ key }, updates, { new: true });
}

export async function deleteTask(key) {
  return Task.findOneAndDelete({ key });
}
