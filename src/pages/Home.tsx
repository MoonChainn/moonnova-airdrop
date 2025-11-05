
import { useState, useEffect } from "react";
import { getAdminStats } from "../api";

 // ✅ import API thật từ backend

interface HomeProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  currentMP: number;
  setCurrentMP: React.Dispatch<React.SetStateAction<number>>;
}

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
}

export default function Home({ balance, setBalance, currentMP, setCurrentMP }: HomeProps) {
  const [isTapping, setIsTapping] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [isFarming, setIsFarming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // ✅ Dữ liệu từ backend
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // 📦 Lấy thống kê từ backend (kết nối thật)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data.stats);
      } catch (err) {
        console.error("Lỗi khi tải thống kê backend:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleTap = () => {
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 200);
    const earned = Math.floor(Math.random() * 5) + 1;
    setBalance(prev => prev + earned);
    setCurrentMP(prev => prev + earned);

    const angle = Math.random() * 2 * Math.PI;
    const radius = 150 + Math.random() * 50;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const id = Date.now() + Math.random();
    setFloatingPoints(prev => [...prev, { id, value: earned, x, y }]);
    setTimeout(() => setFloatingPoints(prev => prev.filter(p => p.id !== id)), 1200);
  };

  const startFarming = () => {
    setIsFarming(true);
    setTimeLeft(3 * 60 * 60);
  };

  useEffect(() => {
    if (!isFarming || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFarming, timeLeft]);

  const claimReward = () => {
    const reward = 777;
    setBalance(prev => prev + reward);
    setCurrentMP(prev => prev + reward);
    setIsFarming(false);
    setTimeLeft(0);
  };

  return (
    <main className="fixed top-0 left-0 w-full h-screen flex flex-col justify-center items-center bg-black text-white overflow-hidden z-0">
      {/* Hiệu ứng ánh sáng */}
      <div className="absolute w-[280px] h-[280px] rounded-full bg-purple-500 blur-[120px] opacity-40 animate-pulse"></div>

      {/* Nút TAP */}
      <div className="relative flex flex-col items-center justify-center mt-20 mb-[20px] z-20">
        <button
          onClick={handleTap}
          className={`relative w-[200px] h-[200px] rounded-full flex items-center justify-center text-[2.4rem] font-bold text-[#3B2F1C] bg-gradient-to-br from-[#FFFDF7] via-[#F5F0D0] to-[#EDE6B8] shadow-[0_0_60px_15px_rgba(255,245,200,0.25)] transition-all duration-200 ease-out ${
            isTapping ? "scale-95 shadow-[0_0_100px_25px_rgba(255,230,180,0.35)]" : "hover:scale-105"
          }`}
        >
          <span className="relative z-10 text-[2.4rem] drop-shadow-[0_0_10px_rgba(255,255,230,0.6)]">
            TAP
          </span>
        </button>

        {/* Hiển thị +point khi tap */}
        {floatingPoints.map(point => (
          <span
            key={point.id}
            className="absolute text-purple-300 font-semibold text-xl animate-fadeUp select-none pointer-events-none"
            style={{ left: `calc(50% + ${point.x}px)`, top: `calc(50% + ${point.y}px)` }}
          >
            +{point.value}
          </span>
        ))}
      </div>

      {/* Khu vực FARMING */}
      <div className="flex flex-col items-center mt-[20px] mb-12 z-10 pointer-events-auto w-full">
        {!isFarming ? (
          <button
            onClick={startFarming}
            className="w-2/3 h-[70px] rounded-full bg-gradient-to-b from-[#2b2b2b] via-[#1a1a1a] to-[#000000] text-[#ffffff] text-xl font-semibold tracking-wide shadow-[0_6px_18px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:brightness-125 hover:shadow-[0_8px_25px_rgba(255,255,255,0.15)] active:scale-95 active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.25)] transition-all duration-300"
          >
            FARMING
          </button>
        ) : (
          <button
            onClick={timeLeft === 0 ? claimReward : undefined}
            className="w-2/3 h-[70px] rounded-full bg-gradient-to-b from-[#3a3a3a] via-[#1f1f1f] to-[#0b0b0b] flex flex-col items-center justify-center text-[#ffffff] text-xl font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:brightness-110 active:scale-95 transition-all duration-300"
          >
            <span>{timeLeft > 0 ? "FARMING..." : "CLAIM REWARD"}</span>
            {timeLeft > 0 && <span className="text-sm mt-1 font-mono">{formatTime(timeLeft)}</span>}
          </button>
        )}
      </div>

      {/* ✅ Hiển thị thống kê từ backend */}
      {!loadingStats && stats && (
        <div className="absolute bottom-6 text-sm text-gray-400 text-center">
          <p>{stats.totalUsers}  {stats.totalTasks}</p>
          <p>{stats.totalReferrals}  {stats.totalPoints}</p>
        </div>
      )}
    </main>
  );
}

