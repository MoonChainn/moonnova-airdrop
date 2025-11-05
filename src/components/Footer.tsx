import React from "react";
import { Home, Users, CreditCard, Wallet as WalletIcon } from "lucide-react";

interface FooterProps {
  active: "home" | "tasks" | "friends" | "wallet";
  onChange: (tab: FooterProps["active"]) => void;
}

export default function Footer({ active, onChange }: FooterProps) {
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

  const tabs: { key: FooterProps["active"]; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "Home", icon: <Home size={20} /> },
    { key: "tasks", label: "Tasks", icon: <CreditCard size={20} /> },
    { key: "friends", label: "Friends", icon: <Users size={20} /> },
    { key: "wallet", label: "Wallet", icon: <WalletIcon size={20} /> }, // sửa icon Wallet
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        padding: "8px 16px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#000",
        zIndex: 9999,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            ...pixelBox,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: active === tab.key ? "#fff" : "#aaa",
            fontWeight: 700,
            cursor: "pointer",
            minWidth: "60px",
          }}
        >
          {tab.icon}
          <span style={{ marginTop: "4px", fontSize: "12px" }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
