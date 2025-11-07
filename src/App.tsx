// src/App.tsx
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Friends from "./pages/Friends";
import Wallet from "./pages/Wallet";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [currentMP, setCurrentMP] = useState(0);
  const [activeTab, setActiveTab] = useState<"home" | "tasks" | "friends" | "wallet">("home");

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string>("");

  const [tasks, setTasks] = useState(() => {
    const base = [
      { id: "follow-x", title: "Follow MoonNova on X", reward: 2000, iconType: "x", completed: false, category: "standard", link: "https://x.com/MoonChainn?t=KXLQTp9k3bA-TG9UGrUp8Q&s=09" },
      { id: "join-telegram", title: "Join MoonNova Telegram channel", reward: 2000, iconType: "send", completed: false, category: "standard", link: "https://t.me/MoonNovadefi" },
      { id: "join-discussion", title: "Join community chat group", reward: 2500, iconType: "message", completed: false, category: "standard", link: "https://t.me/MoonTokenCommunity" },
      { id: "share-x", title: "Share post on X", reward: 10000, iconType: "x", completed: false, category: "special" },
      { id: "daily-5000", title: "Reach 5,000 MP today", reward: 2000, iconType: "calendar", completed: false, category: "daily" },
      { id: "weekly-20000", title: "Reach 20,000 MP this week", reward: 5000, iconType: "clock", completed: false, category: "weekly" },
    ];

    const milestones = Array.from({ length: 20 }, (_, i) => {
      const mp = (i + 1) * 5000;
      return { id: `milestone-${mp}`, title: `Reach ${mp.toLocaleString()} MP milestone`, reward: 2000, iconType: "trophy", completed: false, category: "milestone" };
    });

    return [...base, ...milestones];
  });

  useEffect(() => {
    if (walletAddress) fetchInviteCode(walletAddress);
  }, [walletAddress]);

  const fetchInviteCode = async (wallet: string) => {
    try {
      // ✅ Đổi sang backend thật
      const res = await fetch(`https://moonnova-airdrop.onrender.com/api/referral/code?wallet=${encodeURIComponent(wallet)}`);
      const data = await res.json();
      setInviteCode(data.code ?? "Initializing...");
    } catch (err) {
      console.error("Error fetching referral code:", err);
      setInviteCode("INV-" + wallet.slice(0, 5));
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <Home balance={balance} setBalance={setBalance} currentMP={currentMP} setCurrentMP={setCurrentMP} />;
      case "tasks":
        return <Tasks balance={balance} setBalance={setBalance} tasks={tasks} setTasks={setTasks} />;
      case "friends":
        return <Friends balance={balance} setBalance={setBalance} walletAddress={walletAddress} inviteCode={inviteCode} />;
      case "wallet":
        return <Wallet balance={balance} setBalance={setBalance} walletAddress={walletAddress} setWalletAddress={setWalletAddress} />;
      default:
        return <Home balance={balance} setBalance={setBalance} currentMP={currentMP} setCurrentMP={setCurrentMP} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans overflow-hidden">
      {activeTab === "home" && <Header balance={balance} />}
      <main className="flex-1 pb-24">{renderPage()}</main>
      <Footer active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
