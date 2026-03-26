// src/models/PointsHistory.js
import mongoose from "mongoose";

const PointsHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  source: { type: String, enum: ["task", "referral", "admin"], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PointsHistory", PointsHistorySchema);

