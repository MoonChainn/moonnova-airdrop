// src/pages/Friends.tsx
import React, { useEffect, useState } from "react";
import { Copy } from "lucide-react";

export default function Friends() {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      setMessage("");
      setMessageType("info");
    }, 3000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
      (async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `http://localhost:5000/api/referral/code?wallet=${encodeURIComponent(storedWallet)}`
          );
          if (!res.ok) {
            let text = "";
            try {
              const json = await res.json();
              text = json?.message || JSON.stringify(json);
            } catch {
              text = await res.text().catch(() => `Status ${res.status}`);
            }
            throw new Error(text || `Server returned ${res.status}`);
          }
          const data = await res.json();
          setRefCode(data.code ?? null);
        } catch (err: any) {
          console.error("Fetch ref code failed:", err);
          setRefCode(null);
          setMessage("Failed to fetch referral code.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const showNeedWallet = () => {
    setMessage("You need to connect a wallet to get a referral code.");
    setMessageType("error");
  };

  const handleInvite = () => {
    if (!walletAddress) {
      showNeedWallet();
      return;
    }
    if (!refCode) {
      setMessage("Unable to get referral code, try again later.");
      setMessageType("error");
      return;
    }
    window.open(`https://moonnova.io/airdrop?ref=${refCode}`, "_blank");
    setMessage("Invite link opened!");
    setMessageType("success");
  };

  const handleCopy = async () => {
    if (!walletAddress) {
      showNeedWallet();
      return;
    }
    if (!refCode) {
      setMessage("Unable to get referral code, try again later.");
      setMessageType("error");
      return;
    }
    try {
      await navigator.clipboard.writeText(`https://moonnova.io/airdrop?ref=${refCode}`);
      setMessage("Referral link copied!");
      setMessageType("success");
    } catch (err) {
      console.error("Copy failed", err);
      setMessage("Failed to copy, try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 bg-gradient-to-b from-gray-900 to-black text-white">
      <div
        style={{
          ...pixelBox,
          padding: "20px",
          textAlign: "center",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
        }}
      >
        <h3 className="text-white font-bold text-lg mb-3">Referral Rewards</h3>
        <p className="text-white font-semibold text-base mb-2">
          Invite a friend and earn 7000 MP
        </p>
        <p className="text-gray-300 text-sm">
          Additional rewards will be added as the project expands
        </p>
      </div>

      <div
        className="flex justify-center items-center"
        style={{ marginTop: "20px", width: "100%", maxWidth: "400px", gap: "23px" }}
      >
        <button
          style={{ ...pixelBox, flex: 1, padding: "12px 0", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          onClick={handleInvite}
        >
          Invite a friend
        </button>
        <button
          style={{
            ...pixelBox,
            width: "60px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handleCopy}
        >
          <Copy size={20} className="text-white" />
        </button>
      </div>

      <div style={{ height: 28, marginTop: 20 }}>
        {loading && (
          <p className="text-gray-400 text-xs mt-2 animate-pulse">Loading referral code...</p>
        )}
        {!loading && message && (
          <p
            className="text-xs mt-3 transition-all duration-300"
            style={{ color: messageType === "success" ? "#4ade80" : "#f87171" }}
          >
            {message}
          </p>
        )}
      </div>

      <style>{`
        .animate-pulse { animation: pulse 1.2s infinite; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
