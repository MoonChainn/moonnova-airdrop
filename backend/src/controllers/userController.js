// src/controllers/userController.js
import User from "../models/User.js";
import Task from "../models/Task.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createReferral } from "./referralController.js"; // tích hợp referral

// 🔑 Tạo JWT
const generateToken = (user) => user.generateToken();

// 🟢 Tạo hoặc lấy user (wallet / Telegram / email) + referral bonus
export const createOrGetUser = async (req, res) => {
  try {
    const { wallet, telegramId, refCode, username, email, password } = req.body;
    if (!wallet && !telegramId && !email)
      return res.status(400).json({ message: "Missing identifier" });

    let user = await User.findOne({
      $or: [{ wallet }, { telegramId }, { email }],
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const newRefCode =
        "INV-" + crypto.randomBytes(3).toString("hex").toUpperCase();

      let hashedPassword;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      user = await User.create({
        wallet,
        telegramId,
        username,
        email,
        password: hashedPassword,
        referralCode: newRefCode,
        referredBy: refCode || null,
      });
    }

    // 🌟 Nếu có người giới thiệu, tạo record referral + cộng bonus
    if (isNewUser && user.referredBy) {
      await createReferral(user.referredBy, user._id);
    }

    res.json({ user, token: generateToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔵 Login email/password
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && password && (await user.matchPassword(password))) {
      res.json({ user, token: generateToken(user) });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔵 Lấy thông tin user (middleware protect)
export const getUserInfo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔵 Cập nhật thông tin user (middleware protect)
export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email, avatar, password } = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json({ user: updatedUser, token: generateToken(updatedUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟣 Thêm điểm + hoàn thành task + referral bonus
export const completeTask = async (req, res) => {
  try {
    const { taskKey, proof } = req.body;
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    // Tìm task trong DB theo taskKey
    const task = await Task.findOne({ key: taskKey });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Kiểm tra user đã làm task chưa
    const existingTask = user.tasks.find((t) => t.taskKey === taskKey);
    if (existingTask && existingTask.completed)
      return res.status(400).json({ message: "Task already completed" });

    // Nếu chưa làm, thêm vào tasks
    if (!existingTask) {
      user.tasks.push({
        taskId: task._id,
        taskKey,
        completed: true,
        completedAt: new Date(),
        proof,
      });
    } else {
      existingTask.completed = true;
      existingTask.completedAt = new Date();
      existingTask.proof = proof;
    }

    // Cộng moonPoints từ task
    user.moonPoints += task.points;

    await user.save();

    // 🌟 Referral bonus: cộng 10% điểm task cho người giới thiệu
    if (user.referredBy) {
      const refUser = await User.findOne({ referralCode: user.referredBy });
      if (refUser) {
        const referralBonus = Math.floor(task.points * 0.1);
        refUser.moonPoints += referralBonus;
        await refUser.save();
      }
    }

    res.json({ success: true, newMoonPoints: user.moonPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Lấy toàn bộ danh sách user (cho admin/test)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json({ ok: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
