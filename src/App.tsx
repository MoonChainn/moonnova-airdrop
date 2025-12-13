
//app2 :
import { useState, useEffect } from "react";
import { TonConnectUIProvider, useTonWallet } from "@tonconnect/ui-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Friends from "./pages/Friends";
import Wallet from "./pages/Wallet";

const manifestUrl = "https://moonnova-airdrop.onrender.com/tonconnect-manifest.json";

export default function App() {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("user_balance");
    return saved ? Number(saved) : 0;
  });

  const [currentMP, setCurrentMP] = useState<number>(0);
  const [activeTab, setActiveTab] =
    useState<"home" | "tasks" | "friends" | "wallet">("home");
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
      return {
        id: `milestone-${mp}`,
        title: `Reach ${mp.toLocaleString()} MP milestone`,
        reward: 2000,
        iconType: "trophy",
        completed: false,
        category: "milestone",
      };
    });

    return [...base, ...milestones];
  });

  const [walletLoading, setWalletLoading] = useState(true);
  const [walletInitDone, setWalletInitDone] = useState(false);
  const [prevWallet, setPrevWallet] = useState<string | null>(null);


  const tonWallet = useTonWallet();

  // ⭐ TonConnect init
  useEffect(() => {
  if (tonWallet === undefined) return;

  setWalletLoading(false);

  // Khi connect ví
  if (tonWallet && tonWallet.account?.address) {
    setWalletAddress(tonWallet.account.address);
    return;
  }

  // Khi disconnect
  if (tonWallet === null) {
    setWalletAddress(null);
  }
}, [tonWallet]);


  // ⭐ Save guest balance ONLY when NOT connected
  useEffect(() => {
    if (walletLoading) return;
    if (walletAddress) return;
    localStorage.setItem("user_balance", String(balance));
  }, [balance, walletAddress, walletLoading]);

  // ⭐ Invite code
  useEffect(() => {
    if (walletAddress) fetchInviteCode(walletAddress);
  }, [walletAddress]);

  const fetchInviteCode = async (wallet: string) => {
    try {
      const res = await fetch(
        `https://moonnova-airdrop.onrender.com/api/referral/code?wallet=${encodeURIComponent(wallet)}`
      );
      const data = await res.json();
      setInviteCode(data.code ?? `INV-${wallet.slice(0, 5)}`);
    } catch {
      setInviteCode(`INV-${wallet.slice(0, 5)}`);
    }
  };

  // ⭐ Load wallet balance
  useEffect(() => {
    if (!walletAddress) return;

    const loadBalance = async () => {
      try {
        const res = await fetch(
  `https://moonnova-airdrop.onrender.com/api/wallet/${walletAddress}`
);
const data = await res.json();

        if (data?.total_balance !== undefined) {
          setBalance(data.total_balance);
        }
      } catch {}
    };

    loadBalance();
  }, [walletAddress]);

  // ⭐ FIX CHÍNH — reset balance khi DISCONNECT thật
  // ⭐ Detect connect / disconnect thực sự
useEffect(() => {
  if (walletLoading) return;

  // Lần đầu load thì lưu trạng thái ban đầu
  if (!walletInitDone) {
    setPrevWallet(walletAddress);
    setWalletInitDone(true);
    return;
  }

  // *** DISCONNECT THẬT ***
  if (prevWallet && !walletAddress) {
    console.log("🚪 Ví DISCONNECT — RESET VỀ GUEST");

    setBalance(0);
    setCurrentMP(0);
    localStorage.setItem("user_balance", "0");
    localStorage.removeItem("wallet_status");
  }

  // Khi connect ví
  if (walletAddress) {
    localStorage.setItem("wallet_status", "connected");
  }

  // Update prev wallet
  setPrevWallet(walletAddress);
}, [walletAddress, walletLoading]);


  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return (
          <Home
            balance={balance}
            setBalance={setBalance}
            currentMP={currentMP}
            setCurrentMP={setCurrentMP}
            walletAddress={walletAddress}
          />
        );
      case "tasks":
        return (
          <Tasks
            balance={balance}
            setBalance={setBalance}
            currentMP={currentMP}
            setCurrentMP={setCurrentMP}
            tasks={tasks}
            setTasks={setTasks}
          />
        );
      case "friends":
        return (
          <Friends
            balance={balance}
            setBalance={setBalance}
            walletAddress={walletAddress}
            inviteCode={inviteCode}
            currentMP={currentMP}
            setCurrentMP={setCurrentMP}
          />
        );
      case "wallet":
        return (
          <Wallet
            balance={balance}
            setBalance={setBalance}
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            currentMP={currentMP}
            setCurrentMP={setCurrentMP}
          />
        );
      default:
        return (
          <Home
            balance={balance}
            setBalance={setBalance}
            currentMP={currentMP}
            setCurrentMP={setCurrentMP}
            walletAddress={walletAddress}
          />
        );
    }
  };

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div className="flex flex-col min-h-screen bg-black text-white font-sans overflow-hidden">
        {activeTab === "home" && <Header balance={balance} />}
        <main className="flex-1 pb-24">{renderPage()}</main>
        <Footer active={activeTab} onChange={setActiveTab} />
      </div>
    </TonConnectUIProvider>
  );
}