// src/routes/telegramRoutes.js
import express from "express";
import axios from "axios";
import User from "../models/User.js";

const router = express.Router();

// 🔒 SECRET để xác thực request từ bot (nên đặt trong .env)
const BOT_SECRET = process.env.BOT_SECRET || "dev_secret";

/**
 * 📩 POST /api/telegram/webhook
 * Body: { secret, telegramId, telegramUsername?, wallet?, startParam? }
 * -> Tạo hoặc cập nhật user tương ứng
 */
router.post("/webhook", async (req, res) => {
  try {
    const { secret, telegramId, telegramUsername, wallet, startParam } = req.body;

    // ✅ Kiểm tra secret nếu có
    if (process.env.BOT_SECRET && secret !== process.env.BOT_SECRET) {
      return res.status(401).json({ ok: false, error: "Invalid secret" });
    }

    // 🔍 Tìm user theo wallet / telegramId / referralCode
    let user = null;
    if (wallet) user = await User.findOne({ wallet });
    if (!user && telegramId) user = await User.findOne({ telegramId });
    if (!user && startParam) user = await User.findOne({ referralCode: startParam });

    // 🧾 Nếu chưa có user → tạo mới
    if (!user) {
      user = await User.create({
        wallet: wallet || null,
        telegramId: telegramId || null,
        telegramUsername: telegramUsername || null,
        moonPoints: 0,
        tasks: [],
        referralCode: startParam || null,
      });
    } else {
      // 🔁 Cập nhật telegramId hoặc telegramUsername nếu cần
      let updated = false;
      if (telegramId && !user.telegramId) {
        user.telegramId = telegramId;
        updated = true;
      }
      if (telegramUsername && user.telegramUsername !== telegramUsername) {
        user.telegramUsername = telegramUsername;
        updated = true;
      }
      if (updated) await user.save();
    }

    // ✅ Trả kết quả
    return res.json({ ok: true, userId: user._id, user });
  } catch (err) {
    console.error("[telegram/webhook]", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
