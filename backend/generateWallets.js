// generateWallets.js
import fs from "fs";

// Cấu hình
const NUM_WALLETS = 100000; // 100k ví

// ID cố định cho tất cả ví (ObjectId hợp lệ)
const FIXED_USER_ID = "650000000000000000000001"; // 24 ký tự hex hợp lệ

// Lấy thời gian hiện tại
const now = new Date().toISOString();

// Tạo ví
const wallets = Array.from({ length: NUM_WALLETS }, (_, i) => ({
  walletAddress: `0xWALLET${(i + 1).toString().padStart(6, "0")}`,
  chainType: "EVM",
  userId: { "$oid": FIXED_USER_ID },
  createdAt: { "$date": now },
  updatedAt: { "$date": now }
}));

// Xuất ra file JSON
fs.writeFileSync("wallets_100k.json", JSON.stringify(wallets, null, 2));

console.log(
  `Generated ${NUM_WALLETS} wallets ✅ Ready to import into MongoDB Compass`
);
