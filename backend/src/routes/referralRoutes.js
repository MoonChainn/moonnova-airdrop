// src/routes/referralRoutes.js
import express from "express";
import Referral from "../models/Referral.js"; // quan trọng: phải import model
import {
  createReferral,
  getReferralsByUser,
  getReferralStats,
  getTopReferrers,
  syncReferralCounts,
} from "../controllers/referralController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạo referral mới
router.post("/create", protect, createReferral);

// Danh sách referral của user hiện tại
router.get("/mine", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const referrals = await getReferralsByUser(userId);
    res.json({ ok: true, referrals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, referrals: [] });
  }
});

// Thống kê referral user hiện tại
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await getReferralStats(userId);
    res.json({ ok: true, ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, totalInvited: 0, totalBonus: 0 });
  }
});

// Top referrers
router.get("/top", async (req, res) => {
  try {
    const top = await getTopReferrers();
    res.json({ ok: true, top });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, top: [] });
  }
});

// Admin sync referralCounts
router.post("/sync", protect, adminOnly, async (req, res) => {
  try {
    await syncReferralCounts(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

// 🔹 Route mặc định GET /api/referrals → trả về mảng rỗng nếu chưa có
router.get("/", async (req, res) => {
  try {
    const referrals = await Referral.find()
      .limit(50)
      .populate("referred", "username wallet telegramId createdAt");
    res.json({ ok: true, referrals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: true, referrals: [] });
  }
});

export default router;
