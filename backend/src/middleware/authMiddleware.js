import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🛡️ Middleware xác thực người dùng qua JWT hoặc Wallet/Telegram
export const protect = async (req, res, next) => {
  try {
    let user = null;

    // 1️⃣ Kiểm tra JWT
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select("-password");
    }

    // 2️⃣ Nếu không có JWT, kiểm tra theo wallet hoặc telegramId
    if (!user && (req.body.wallet || req.body.telegramId)) {
      user = await User.findOne({
        $or: [{ wallet: req.body.wallet }, { telegramId: req.body.telegramId }],
      }).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// 👑 Middleware chỉ cho phép admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
