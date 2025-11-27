import * as WalletModule from '../models/Wallet.js';
const Wallet = WalletModule.default || WalletModule.Wallet;

// ---------------------------
// MERGE & SYNC
// ---------------------------
async function mergeAndSync(req, res) {
    try {
        const { wallet, guest_mp } = req.body;

        if (!wallet) {
            return res.status(400).json({ success: false, error: "Wallet address is required" });
        }

        const pointsToMerge =
            typeof guest_mp === "number" && guest_mp > 0
                ? Math.floor(guest_mp)
                : 0;

        const normalizedWallet = wallet.toUpperCase();

        let walletDoc = await Wallet.findOne({ walletAddress: normalizedWallet });

        if (!walletDoc) {
            const generatedRefCode = `INV-${wallet.slice(0, 5)}-${Math.floor(Math.random() * 9000 + 1000)}`;

            walletDoc = new Wallet({
                walletAddress: normalizedWallet,
                balance: pointsToMerge,
                referralCode: generatedRefCode
            });

            await walletDoc.save();
            console.log(`[MERGE] New Wallet: ${wallet} | Points: ${pointsToMerge}`);
        } else {
            if (pointsToMerge > 0) {
                walletDoc.balance += pointsToMerge;
                await walletDoc.save();
                console.log(`[MERGE] Synced Wallet: ${wallet} | +${pointsToMerge}`);
            } else {
                console.log(`[LOGIN] Wallet logged in: ${wallet} (no merge)`);
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
}

// ---------------------------
// GET REFERRAL CODE
// ---------------------------
async function getReferralCode(req, res) {
    try {
        const { wallet } = req.query;

        if (!wallet) {
            return res.status(400).json({ success: false, error: "Wallet query is required" });
        }

        const walletDoc = await Wallet.findOne({ walletAddress: wallet.toUpperCase() });

        return res.json({
            success: true,
            code: walletDoc ? walletDoc.referralCode : null
        });

    } catch (error) {
        console.error("Referral Code Error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

// ---------------------------
// GET BALANCE (HÀM BỊ THIẾU)
// ---------------------------
async function getBalance(req, res) {
    try {
        const { wallet } = req.query;

        if (!wallet) {
            return res.status(400).json({ success: false, error: "Wallet query is required" });
        }

        const walletDoc = await Wallet.findOne({
            walletAddress: wallet.toUpperCase()
        });

        if (!walletDoc) {
            return res.status(404).json({ success: false, error: "Wallet not found" });
        }

        return res.json({
            success: true,
            balance: walletDoc.balance
        });

    } catch (error) {
        console.error("Get Balance Error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

// ---------------------------
// ADD POINTS
// ---------------------------
async function addPoints(req, res) {
    try {
        const { wallet, amount } = req.body;

        if (!wallet || typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ success: false, error: "Invalid input data" });
        }

        const walletDoc = await Wallet.findOneAndUpdate(
            { walletAddress: wallet.toUpperCase() },
            { $inc: { balance: amount } },
            { new: true }
        );

        if (!walletDoc) {
            return res.status(404).json({ success: false, error: "Wallet not found" });
        }

        return res.json({
            success: true,
            new_balance: walletDoc.balance
        });

    } catch (error) {
        console.error("Add Points Error:", error);
        return res.status(500).json({ success: false, error: "Server error during adding points" });
    }
}

// ---------------------------
// EXPORT DEFAULT
// ---------------------------
export default {
    mergeAndSync,
    getReferralCode,
    getBalance,
    addPoints
};
