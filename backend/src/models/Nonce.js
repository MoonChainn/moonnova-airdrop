const mongoose = require("mongoose");

const NonceSchema = new mongoose.Schema({
  wallet: String,
  nonce: String,
  createdAt: { type: Date, default: Date.now, expires: 300 } // tự xoá sau 5 phút
});

module.exports = mongoose.model("Nonce", NonceSchema);
