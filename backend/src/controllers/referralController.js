// src/controllers/referralController.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Referral from "../models/Referral.js";

const DEFAULT_REWARD = 7000; // điểm thưởng mặc định cho 1 lượt giới thiệu

/**
 * 🟢 POST /api/referrals/create
 * body: { inviterCode, inviteeId, rewardPoints? }
 * 👉 Được gọi sau khi user mới đã được tạo (đã có _id)
 */
export const createReferral = async (req, res) => {
  try {
    const { inviterCode, inviteeId, rewardPoints } = req.body;
    if (!inviterCode || !inviteeId) {
      return res
        .status(400)
        .json({ ok: false, msg: "inviterCode và inviteeId là bắt buộc" });
    }

    const inviter = await User.findOne({ referralCode: inviterCode });
    if (!inviter) {
      return res
        .status(404)
        .json({ ok: false, msg: "Referral code không hợp lệ" });
    }

    if (inviter._id.equals(inviteeId)) {
      return res
        .status(400)
        .json({ ok: false, msg: "Không thể tự giới thiệu chính mình" });
    }

    // kiểm tra xem user mới đã được giới thiệu chưa
    const existing = await Referral.findOne({ referred: inviteeId });
    if (existing) {
      return res.status(409).json({
        ok: false,
        msg: "Người dùng này đã được giới thiệu trước đó",
        referral: existing,
      });
    }

    const pointsToGive = Number(rewardPoints ?? DEFAULT_REWARD);

    // tạo referral
    const referral = await Referral.create({
      referrer: inviter._id,
      referred: inviteeId,
      bonusPoints: pointsToGive,
    });

    // cộng điểm cho người giới thiệu
    const updatedInviter = await User.findByIdAndUpdate(
      inviter._id,
      {
        $inc: { moonPoints: pointsToGive, referralCount: 1 },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    // cập nhật field referredBy cho người được mời
    await User.findByIdAndUpdate(inviteeId, {
      $set: { referredBy: inviter.referralCode },
    });

    return res.json({
      ok: true,
      msg: "Referral created successfully",
      referral,
      inviter: {
        id: updatedInviter._id,
        moonPoints: updatedInviter.moonPoints,
        referralCount: updatedInviter.referralCount,
      },
    });
  } catch (err) {
    console.error("createReferral error:", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ ok: false, msg: "Referral đã tồn tại cho người này" });
    }
    return res
      .status(500)
      .json({ ok: false, msg: "Lỗi server", error: err.message });
  }
};

/**
 * 🟡 GET /api/referrals/:userId
 * 👉 Lấy danh sách người mà user đã giới thiệu
 */
export const getReferralsByUser = async (userId) => {
  try {
    const referrals = await Referral.find({ referrer: userId })
      .sort({ createdAt: -1 })
      .populate("referred", "username email wallet telegramId createdAt");

    return referrals;
  } catch (err) {
    console.error("getReferralsByUser error:", err);
    throw new Error("Server error");
  }
};

/**
 * 🧾 GET /api/referrals/stats/:userId
 * 👉 Lấy tổng số lượt giới thiệu và tổng điểm thưởng
 */
export const getReferralStats = async (userId) => {
  try {
    const agg = await Referral.aggregate([
      { $match: { referrer: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$referrer",
          totalInvited: { $sum: 1 },
          totalBonus: { $sum: "$bonusPoints" },
        },
      },
    ]);

    if (!agg || agg.length === 0) {
      return { totalInvited: 0, totalBonus: 0 };
    }

    const { totalInvited, totalBonus } = agg[0];
    return { totalInvited, totalBonus };
  } catch (err) {
    console.error("getReferralStats error:", err);
    throw new Error("Server error");
  }
};

/**
 * 🧠 GET /api/referrals/top
 * 👉 Lấy top 20 người giới thiệu nhiều nhất
 */
export const getTopReferrers = async () => {
  try {
    const top = await User.aggregate([
      { $match: { referralCount: { $gt: 0 } } },
      {
        $project: {
          username: 1,
          referralCode: 1,
          referralCount: 1,
          moonPoints: 1,
        },
      },
      { $sort: { referralCount: -1, moonPoints: -1 } },
      { $limit: 20 },
    ]);
    return top;
  } catch (err) {
    console.error("getTopReferrers error:", err);
    throw new Error("Server error");
  }
};

/**
 * 🔁 Đồng bộ lại số lượng referrals cho từng user (dành cho admin)
 */
export const syncReferralCounts = async (req, res) => {
  try {
    const users = await User.find();
    for (const user of users) {
      const count = await Referral.countDocuments({ referrer: user._id });
      user.referralCount = count;
      await user.save();
    }
    res.json({ ok: true, msg: "Referral counts synced" });
  } catch (err) {
    console.error("syncReferralCounts error:", err);
    res.status(500).json({ ok: false, msg: "Lỗi server" });
  }
};
