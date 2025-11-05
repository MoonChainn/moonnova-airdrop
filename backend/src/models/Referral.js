// src/models/Referral.js
import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // người giới thiệu
  referred: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // người được giới thiệu
  bonusPoints: { type: Number, default: 50 }, // điểm thưởng cho referrer
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Referral", referralSchema);
