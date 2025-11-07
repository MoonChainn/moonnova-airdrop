// src/pages/Wallet.tsx
import React, { useState, useEffect } from "react";
import { TonConnectUI, useTonWallet } from "@tonconnect/ui-react";

interface WalletProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  walletAddress: string | null;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Wallet({ balance, setBalance, walletAddress, setWalletAddress }: WalletProps) {
  const wallet = useTonWallet();
  const tonConnectUI = new TonConnectUI({
  manifestUrl: "https://moonnova-airdrop.onrender.com/tonconnect-manifest.json",
});
  const [connecting, setConnecting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

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

  const shortenAddress = (address: string) => address.slice(0, 6) + "..." + address.slice(-4);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const w = await tonConnectUI.connectWallet();
      setWalletAddress(w.account.address); // đồng bộ lên App
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Unable to connect wallet. Make sure you have Tonkeeper or Tonhub installed!");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setWalletAddress(null);
    setBalance(0);
  };

  const fetchBalance = async (walletAddr: string) => {
    try {
      setLoadingBalance(true);
      const res = await fetch(`https://moonnova-airdrop.onrender.com/api/user/balance?wallet=${walletAddr}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (err) {
      console.error("Fetch balance failed:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  }, [walletAddress]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <div style={{ ...pixelBox, padding: "24px 20px", textAlign: "center", width: "100%", maxWidth: "400px" }}>
        <h2 className="text-white font-bold text-lg mb-4">
          💰 Total Balance:{" "}
          <span className="ml-1 text-yellow-300">
            {loadingBalance ? "Loading..." : balance.toLocaleString("en-US")} MP
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
            Your wallet: <span className="text-blue-300 font-semibold">{shortenAddress(walletAddress)}</span>
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
