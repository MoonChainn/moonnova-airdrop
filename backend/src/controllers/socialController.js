// src/controllers/socialController.js
import User from "../models/User.js";
import { isUserInGroup } from "../utils/telegram.js";

// 🟢 Telegram verification
export const verifyTelegram = async (req, res) => {
  try {
    const userId = req.user.id; // từ authMiddleware
    const { chatId } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.telegramId) {
      return res.status(400).json({ ok: false, message: "User chưa đăng ký telegramId" });
    }

    const joined = await isUserInGroup(user.telegramId, chatId);

    if (joined) {
      user.telegramVerified = true;
      await user.save();
      return res.json({ ok: true, message: "Telegram verified thành công" });
    } else {
      return res.status(400).json({ ok: false, message: "User chưa join group/channel" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};
