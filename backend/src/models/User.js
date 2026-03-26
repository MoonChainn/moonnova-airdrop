// src/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ⚙️ Hàm sinh referral code ngẫu nhiên
function generateReferralCode(prefix = process.env.APP_PREFIX || "MOON") {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
}

const userSchema = new mongoose.Schema(
  {
    // 🔐 Login via wallet or Telegram
    wallet: { type: String, unique: true, sparse: true },
    telegramId: { type: String, unique: true, sparse: true },
    telegramVerified: { type: Boolean, default: false },

    // 🎁 Referral system
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null }, // lưu mã referral inviter
    referralCount: { type: Number, default: 0 },
    referralBonus: { type: Number, default: 0 },

    // 💰 Points & balance
    balance: { type: Number, default: 0 },
    moonPoints: { type: Number, default: 0 },

    // ✅ Tasks (những task đã làm)
    tasks: [
      {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
        taskKey: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        proof: { type: mongoose.Schema.Types.Mixed },
      },
    ],

    // 🧑‍💻 Thông tin cơ bản
    username: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },

    // ⏱️ Thời gian tạo & cập nhật
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🧩 Auto-generate referralCode nếu chưa có
userSchema.pre("save", async function (next) {
  try {
    if (!this.referralCode) {
      let tries = 0;
      let code;

      // sinh code duy nhất (thử 5 lần tránh trùng)
      do {
        code = generateReferralCode();
        const exists = await mongoose.models.User.findOne({ referralCode: code }).lean();
        if (!exists) break;
        tries += 1;
      } while (tries < 5);

      this.referralCode = code;
    }

    this.updatedAt = new Date();
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Tạo JWT token cho user
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 🔐 So sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🧂 Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
