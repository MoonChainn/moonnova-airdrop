// src/controllers/pointsController.js
import User from "../models/User.js";
import PointsHistory from "../models/PointsHistory.js";

/**
 * @desc Cộng điểm cho user
 * @route POST /api/points/add
 */
export const addPoints = async (req, res) => {
  try {
    const { userId, amount, source, description } = req.body;
    if (!userId || !amount || !source) {
      return res.status(400).json({ ok: false, message: "Thiếu dữ liệu cần thiết" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, message: "Không tìm thấy user" });

    // Cộng điểm
    user.points = (user.points || 0) + amount;
    await user.save();

    // Lưu lịch sử
    await PointsHistory.create({ userId, source, amount, description });

    res.json({ ok: true, message: "Cộng điểm thành công", newPoints: user.points });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

/**
 * @desc Lấy tổng điểm của user
 * @route GET /api/points/summary/:userId
 */
export const getPointsSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("points");
    if (!user) return res.status(404).json({ ok: false, message: "Không tìm thấy user" });

    res.json({ ok: true, points: user.points || 0 });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

/**
 * @desc Lịch sử điểm
 * @route GET /api/points/history/:userId
 */
export const getPointsHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await PointsHistory.find({ userId }).sort({ createdAt: -1 });
    res.json({ ok: true, history });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};
