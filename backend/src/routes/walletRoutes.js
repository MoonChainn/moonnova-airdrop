import express from 'express';
import * as walletController from '../controllers/walletController.js'; // ✅ FIX: Dùng 'import * as' để lấy toàn bộ các hàm đã export

const router = express.Router();

// Route chính cho việc đăng nhập/kết nối ví và gộp điểm (Merge & Sync)
router.post('/merge', walletController.mergeAndSync);

// Route để lấy mã giới thiệu
router.get('/code', walletController.getReferralCode);

// Route placeholder cho việc cộng điểm task sau này
router.post('/add-points', walletController.addPoints);

export default router;