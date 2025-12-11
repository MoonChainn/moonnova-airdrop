
// wallet1 : 
import React, { useState, useEffect, useRef } from "react";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";

interface WalletProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  walletAddress: string | null;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
  currentMP: number;
  setCurrentMP: React.Dispatch<React.SetStateAction<number>>;
}

export default function Wallet({ balance, setBalance, walletAddress, setWalletAddress }: WalletProps) {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [connecting, setConnecting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const isMerging = useRef(false);

  // ⭐ Merge local guest MP vào ví
  const syncAndMergeBalance = async (walletAddr: string) => {
    if (isMerging.current) return;
    isMerging.current = true;

    try {
      setLoadingBalance(true);
      const guestMp = Number(localStorage.getItem("user_balance") || "0");
      console.log(`🔄 Sync Wallet: ${walletAddr} | Guest MP: ${guestMp}`);

      const res = await fetch(`https://moonnova-airdrop.onrender.com/api/wallet/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddr,  guest_mp: guestMp })
      });

      if (!res.ok) throw new Error(`Merge failed: ${res.status}`);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Merge API did not return JSON:", text);
        return;
      }

      const data = await res.json();
      if (typeof data.total_balance === "number") {
        setWalletAddress(walletAddr);
        setBalance(data.total_balance);

        if (guestMp > 0) {
          localStorage.setItem("user_balance", "0");
          console.log("✅ Local guest MP reset.");
        }
      }
    } catch (err) {
      console.error("Sync error:", err);
      setWalletAddress(walletAddr);
    } finally {
      isMerging.current = false;
      setLoadingBalance(false);
    }
  };

  // ⭐ Khi ví thay đổi (connect hoặc đổi ví)
useEffect(() => {

  // Khi kết nối ví mới hoàn toàn
  if (wallet && wallet.account.address !== walletAddress) {
    syncAndMergeBalance(wallet.account.address);
    return;
  }

  // ⭐ Khi connect lại cùng ví → vẫn phải merge nếu guest > 0
  if (wallet && wallet.account.address === walletAddress) {
    const guestMp = Number(localStorage.getItem("user_balance") || "0");
    if (guestMp > 0) {
      console.log("⭐ Reconnect same wallet → merging local MP...");
      syncAndMergeBalance(wallet.account.address);
    }
    return;
  }
  
}, [wallet]);

  // ⭐ Fetch balance từ server khi đã có ví
  useEffect(() => {
    if (!walletAddress) return;

    const fetchBalance = async () => {
      try {
        setLoadingBalance(true);

        const res = await fetch(
          `https://moonnova-airdrop.onrender.com/api/wallet/balance?wallet=${walletAddress}`
        );

        if (!res.headers.get("content-type")?.includes("application/json")) {
  const text = await res.text();
  console.error("Balance API did not return JSON:", text);
  return;
}


        if (!res.ok) throw new Error("Fetch wallet balance failed");

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Balance API did not return JSON:", text);
          return;
        }

        const data = await res.json();

        if (typeof data.total_balance === "number") {
          setBalance(data.total_balance);
        }
      } catch (err) {
        console.error("Balance fetch error:", err);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [walletAddress]);

  // ⭐ UI helpers
  const pixelBox = {
    background: "linear-gradient(180deg, #b26cff 0%, #5032ff 100%)",
    border: "2px solid #000",
    boxShadow: "3px 3px 0 #000",
    imageRendering: "pixelated" as const,
    clipPath: `polygon(
      0px 14px,4px 14px,4px 10px,8px 10px,8px 6px,12px 6px,12px 0px,
      calc(100% - 12px) 0px,calc(100% - 12px) 6px,calc(100% - 8px) 6px,
      calc(100% - 8px) 10px,calc(100% - 4px) 10px,calc(100% - 4px) 14px,
      100% 14px,100% calc(100% - 14px),calc(100% - 4px) calc(100% - 14px),
      calc(100% - 4px) calc(100% - 10px),calc(100% - 8px) calc(100% - 10px),
      calc(100% - 8px) calc(100% - 6px),calc(100% - 12px) calc(100% - 6px),
      calc(100% - 12px) 100%,12px 100%,12px calc(100% - 6px),
      8px calc(100% - 6px),8px calc(100% - 10px),4px calc(100% - 10px),
      4px calc(100% - 14px),0px calc(100% - 14px)
    )`,
  };

  const shortenAddress = (address: string) =>
    address.slice(0, 6) + "..." + address.slice(-4);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await tonConnectUI.openModal();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();

    // 🔥 Reset clean cho guest mode
    localStorage.setItem("force_disconnect", "1");

    setWalletAddress(null);

    const guest = Number(localStorage.getItem("user_balance") || "0");
    setBalance(guest);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <div
        style={{
          ...pixelBox,
          padding: "24px 20px",
          textAlign: "center",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 className="text-white font-bold text-lg mb-4">
          💰 Total Balance:{" "}
          <span className="ml-1 text-yellow-300">
            {loadingBalance ? "Syncing..." : balance.toLocaleString("en-US")} MP
          </span>
        </h2>

        {!walletAddress ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              ...pixelBox,
              width: "100%",
              padding: "12px 0",
              fontWeight: 700,
              color: "#000",
              background: connecting
                ? "linear-gradient(180deg, #ffe57f 0%, #d9b300 100%)"
                : "linear-gradient(180deg, #FFD93D 0%, #E3B100 100%)",
              cursor: "pointer",
              opacity: connecting ? 0.8 : 1,
            }}
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            style={{
              ...pixelBox,
              width: "100%",
              padding: "12px 0",
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(180deg, #ff4e4e 0%, #a80000 100%)",
              cursor: "pointer",
            }}
          >
            Log Out ({shortenAddress(walletAddress)})
          </button>
        )}

        {walletAddress && (
          <p className="text-gray-200 text-sm mt-4">
            Your wallet:{" "}
            <span className="text-blue-300 font-semibold">
              {shortenAddress(walletAddress)}
            </span>
          </p>
        )}

        <p className="text-gray-300 text-xs mt-4 leading-snug">
          MOONNOVA currently represents reward points in the system.
          <br />
          Tokens will be convertible when the mainnet launches.
        </p>
      </div>
    </div>
  );
}