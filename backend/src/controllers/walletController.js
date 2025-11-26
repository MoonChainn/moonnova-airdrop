import * as WalletModule from '../models/Wallet.js'; 
const Wallet = WalletModule.default || WalletModule.Wallet; 

/**
 * [POST] /api/user/merge
 * Logic: Gộp điểm từ LocalStorage (guest_mp) vào DB, sau đó trả về tổng số dư.
 */
export const mergeAndSync = async (req, res) => {
    try {
        const { wallet, guest_mp } = req.body;

        if (!wallet) {
            return res.status(400).json({ success: false, error: "Wallet address is required" });
        }

        const pointsToMerge = (typeof guest_mp === 'number' && guest_mp > 0) ? Math.floor(guest_mp) : 0;
        const normalizedWallet = wallet.toUpperCase();

        let walletDoc = await Wallet.findOne({ walletAddress: normalizedWallet });

        if (!walletDoc) {
            const generatedRefCode = `INV-${wallet.slice(0, 5)}-${Math.floor(Math.random() * 9999) + 1000}`;

            walletDoc = new Wallet({
                walletAddress: normalizedWallet,
                balance: pointsToMerge,
                referralCode: generatedRefCode
            });
            await walletDoc.save();

            console.log(`[MERGE] New Wallet created: ${wallet} | Points: ${pointsToMerge}`);

        } else {
            if (pointsToMerge > 0) {
                walletDoc.balance += pointsToMerge;
                await walletDoc.save();
                console.log(`[MERGE] Wallet Synced: ${wallet} | Added: ${pointsToMerge}`);
            } else {
                console.log(`[LOGIN] Wallet Logged in: ${wallet} | No points merged`);
            }
        }

        return res.status(200).json({
            success: true,
            wallet: walletDoc.walletAddress,
            total_balance: walletDoc.balance,
            referral_code: walletDoc.referralCode
        });

    } catch (error) {
        console.error("Merge/Sync Error:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error during sync" });
    }
};

/**
 * [GET] /api/referral/code
 * Logic: Lấy mã giới thiệu của user
 */
export const getReferralCode = async (req, res) => {
    try {
        const { wallet } = req.query;
        if (!wallet) return res.status(400).json({ success: false, error: "Wallet query is required" });

        const walletDoc = await Wallet.findOne({ walletAddress: wallet.toUpperCase() });

        if (walletDoc) {
            return res.json({ success: true, code: walletDoc.referralCode });
        } else {
            return res.json({ success: true, code: null });
        }
    } catch (error) {
        console.error("Referral Code Error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * [POST] /api/user/add
 * Cộng điểm task
 */
export const addPoints = async (req, res) => {
    try {
        const { wallet, amount } = req.body;
        if (!wallet || !amount) return res.status(400).json({ success: false, error: "Invalid data" });
        if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ success: false, error: "Invalid point amount" });

        const walletDoc = await Wallet.findOneAndUpdate(
            { walletAddress: wallet.toUpperCase() },
            { $inc: { balance: amount } },
            { new: true }
        );

        if (!walletDoc) return res.status(404).json({ success: false, error: "Wallet not found" });

        return res.json({ success: true, new_balance: walletDoc.balance });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error during adding points" });
    }
};

/**
 * 🚀 EXPORT DEFAULT — để routes import không lỗi
 */
const walletController = {
    mergeAndSync,
    getReferralCode,
    addPoints
};

export default walletController;
