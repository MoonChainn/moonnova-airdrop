import express from 'express';
import walletController from '../controllers/walletController.js'; // ✅ ĐÚNG NHẤT

const router = express.Router();

// Route chính cho việc đăng nhập/kết nối ví và gộp điểm (Merge & Sync)
router.post('/merge', walletController.mergeAndSync);

// Route để lấy mã giới thiệu
router.get('/code', walletController.getReferralCode);

// Route để lấy số dư ví
router.get('/balance', walletController.getBalance);

// Route để cộng điểm task
router.post('/add-points', walletController.addPoints);

export default router;
