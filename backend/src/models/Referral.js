// src/models/Referral.js
import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    // 🧑 Người giới thiệu
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👥 Người được giới thiệu
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // đảm bảo 1 user chỉ có thể được giới thiệu 1 lần
    },

    // 💎 Điểm thưởng cho người giới thiệu
    bonusPoints: {
      type: Number,
      default: 50,
      min: 0,
    },

    // 📅 Thời gian tạo referral
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Middleware: Khi tạo referral, tự cộng điểm thưởng cho người giới thiệu
referralSchema.post("save", async function (doc, next) {
  try {
    const User = mongoose.model("User");
    const referrerUser = await User.findById(doc.referrer);

    if (referrerUser) {
      // nếu user có field moonPoints thì cộng điểm
      if (typeof referrerUser.moonPoints === "number") {
        referrerUser.moonPoints += doc.bonusPoints;
      } else {
        referrerUser.moonPoints = doc.bonusPoints;
      }
      await referrerUser.save();
    }

    next();
  } catch (err) {
    console.error("Error updating referrer bonus:", err);
    next(err);
  }
});

export default mongoose.model("Referral", referralSchema);
