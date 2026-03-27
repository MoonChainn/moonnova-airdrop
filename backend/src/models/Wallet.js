import mongoose from 'mongoose'; 

// Định nghĩa Schema cho người dùng/ví (Wallet)
const WalletSchema = new mongoose.Schema({
  // Địa chỉ ví (Duy nhất, dùng để định danh user)
  walletAddress: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true 
  },
  // Tổng điểm MP của user (Tích lũy từ Local và Tasks)
  balance: { 
    type: Number, 
    default: 0 
  },
  // Mã giới thiệu của user
  referralCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('Wallet', WalletSchema); // ✅ Vẫn dùng export default
