// src/components/Header.tsx
import React from "react";

interface HeaderProps {
  balance: number;
}

const Header: React.FC<HeaderProps> = ({ balance }) => {
  const levelThresholds = [0, 7000, 50000, 350000, 2500000, 17500000, 120000000, 840000000, 5900000000, 41000000000];

  const getLevelFromBalance = (mp: number): number => {
    let level = 1;
    for (let i = 0; i < levelThresholds.length; i++) {
      if (mp >= levelThresholds[i]) level = i + 1;
      else break;
    }
    return level;
  };

  const level = getLevelFromBalance(balance);

  const pixelBox = {
    background: "linear-gradient(180deg, #b26cff 0%, #5032ff 100%)",
    border: "2px solid #000",
    boxShadow: "3px 3px 0 #000",
    imageRendering: "pixelated" as const,
    clipPath: `polygon(
      0px 14px, 4px 14px, 4px 10px, 8px 10px, 8px 6px, 12px 6px, 12px 0px,
      calc(100% - 12px) 0px, calc(100% - 12px) 6px, calc(100% - 8px) 6px,
      calc(100% - 8px) 10px, calc(100% - 4px) 10px, calc(100% - 4px) 14px,
      100% 14px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 14px),
      calc(100% - 4px) calc(100% - 10px), calc(100% - 8px) calc(100% - 10px),
      calc(100% - 8px) calc(100% - 6px), calc(100% - 12px) calc(100% - 6px),
      calc(100% - 12px) 100%, 12px 100%, 12px calc(100% - 6px), 8px calc(100% - 6px),
      8px calc(100% - 10px), 4px calc(100% - 10px), 4px calc(100% - 14px), 0px calc(100% - 14px)
    )`,
  };

  return (
    <header className="flex justify-between items-center w-full px-4 pt-4 gap-4" style={{ transform: "translateY(20px)" }}>
      <div className="flex items-center justify-center min-w-[90px] h-[45px] text-white font-bold text-sm select-none" style={pixelBox}>
        Lv {level}
      </div>
      <div className="flex items-center justify-center min-w-[100px] h-[45px] text-white font-bold text-sm select-none" style={pixelBox}>
        {balance.toLocaleString()} MP
      </div>
    </header>
  );
};

export default Header;
