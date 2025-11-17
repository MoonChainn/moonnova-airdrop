const Nonce = require("../models/Nonce");
const crypto = require("crypto");

// Lấy nonce
exports.getNonce = async (req, res) => {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ message: "Wallet required" });

  const nonce = crypto.randomBytes(16).toString("hex");
  await Nonce.create({ wallet, nonce });
  res.json({ nonce });
};
