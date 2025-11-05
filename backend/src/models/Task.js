// src/models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "join_telegram", "follow_twitter", "share_link_v1"
  title: { type: String, required: true },
  description: { type: String, default: "" },
  // type: enum để frontend biết form proof / validation
  type: { type: String, enum: ["auto", "manual", "link", "action"], default: "action" },
  // điểm thưởng khi hoàn thành
  points: { type: Number, required: true, default: 0 },
  // metadata tùy biến (kênh telegram id, twitter handle, url pattern...)
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // logs of completions (keeps minimal record)
  completionsCount: { type: Number, default: 0 },
});

// index để tìm nhanh theo key
taskSchema.index({ key: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task; // <-- chuyển sang ES6 export
