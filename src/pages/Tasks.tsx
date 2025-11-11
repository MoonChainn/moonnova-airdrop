import React, { useState, useEffect } from "react";
import { Calendar, Clock, Trophy, Send, MessageCircle } from "lucide-react";

const XIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18.36 5.64L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5.64 5.64L18.36 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export interface TaskType {
  id: string;
  title: string;
  reward: number;
  iconType?: "x" | "send" | "message" | "trophy" | "calendar" | "clock";
  completed: boolean;
  claimable?: boolean;
  link?: string;
  category: "daily" | "weekly" | "milestone" | "special" | "standard";
}

interface TasksProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  walletAddress?: string | null;
}

const Tasks: React.FC<TasksProps> = ({ balance, setBalance, tasks, setTasks }) => {
  const [popup, setPopup] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<Record<string, boolean>>({});

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
      calc(100% - 12px) 100%, 12px 100%, 12px calc(100% - 6px),
      8px calc(100% - 6px), 8px calc(100% - 10px), 4px calc(100% - 10px),
      4px calc(100% - 14px), 0px calc(100% - 14px)
    )`,
  };

  const renderIcon = (task: TaskType) => {
    switch (task.iconType) {
      case "send": return <Send className="text-sky-400" size={20} />;
      case "message": return <MessageCircle className="text-green-400" size={20} />;
      case "trophy": return <Trophy className="text-purple-400" size={20} />;
      case "calendar": return <Calendar className="text-yellow-400" size={20} />;
      case "clock": return <Clock className="text-blue-400" size={20} />;
      case "x":
      default: return <XIcon className="text-white" />;
    }
  };

  // ✅ Handle complete với Social / Special tasks: Start -> mở link -> bật Claim
  const handleComplete = (task: TaskType) => {
    if (task.category === "standard") {
      if (task.id === "social-x") window.open("https://x.com/MoonChainn?t=vYg24BqgbIBRdXQVRvoQdg&s=09", "_blank");
      else if (task.id === "social-tele-channel") window.open("https://t.me/MoonNovadefi", "_blank");
      else if (task.id === "social-community") window.open("https://t.me/MoonTokenCommunity", "_blank");
    } else if (task.link) {
      window.open(task.link, "_blank");
    }

    // bật claimable sau khi mở link cho Social/Special tasks
    if (task.category === "special" || task.category === "standard") {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, claimable: true } : t)));
    }
  };

  const handleClaim = (id: string) => {
    if (claiming[id]) return;
    setClaiming((s) => ({ ...s, [id]: true }));

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const requiredMP = task.category === "daily" ? 5000
      : task.category === "weekly" ? 20000
      : task.category === "milestone" ? parseInt(task.id.split("-")[1])
      : 0;

    if (balance < requiredMP) {
      setPopup(`Not enough MP to claim.`);
      setTimeout(() => setPopup(null), 1500);
      setClaiming((s) => ({ ...s, [id]: false }));
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true, claimable: false } : t)));
    const newBalance = balance + task.reward;
    setBalance(newBalance);
    localStorage.setItem("user_balance", newBalance.toString());
    setPopup(`+${task.reward.toLocaleString()} MP`);

    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: true, claimable: false } : t);
    localStorage.setItem("user_tasks", JSON.stringify(updatedTasks));

    setTimeout(() => {
      setPopup(null);
      setClaiming((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }, 2000);
  };

  // Auto cập nhật claimable chỉ cho Daily/Weekly/Milestone
  useEffect(() => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.completed) return task;
        const requiredMP = task.category === "daily" ? 5000
          : task.category === "weekly" ? 20000
          : task.category === "milestone" ? parseInt(task.id.split("-")[1])
          : 0;

        if (!task.claimable && requiredMP > 0 && balance >= requiredMP) return { ...task, claimable: true };
        return task;
      })
    );
  }, [balance, setTasks]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("user_tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, [setTasks]);

  const renderTasksGroup = (category: TaskType["category"], title?: React.ReactNode) => {
    const filtered = tasks.filter((t) => t.category === category);
    if (filtered.length === 0) return null;

    return (
      <div className="mt-6 px-3">
        {title && (
          <h2 className="text-white font-bold text-base flex items-center gap-1 mb-2 px-1">{title}</h2>
        )}
        <div
          style={{
            backgroundColor: "#0f1114",
            borderRadius: "18px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
          }}
        >
          {filtered.map((task, idx) => {
            const isLast = idx === filtered.length - 1;
            const isFirst = idx === 0;
            const isProcessing = !!claiming[task.id];
            const isDone = task.completed;

            return (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: isFirst ? "18px 18px 0 0" : isLast ? "0 0 18px 18px" : "0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {renderIcon(task)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{task.title}</p>
                    <p className="text-xs text-gray-400">+{task.reward.toLocaleString()} MP</p>
                  </div>
                </div>
                <button
                  onClick={() => (task.claimable ? handleClaim(task.id) : handleComplete(task))}
                  disabled={isDone || isProcessing}
                  style={{
                    ...pixelBox,
                    minWidth: "90px",
                    height: "38px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    opacity: isDone ? 0.4 : 1,
                    cursor: isDone ? "default" : "pointer",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease",
                    transform: "translateY(0)",
                    animation: task.claimable && !isDone ? "pulse 1.2s infinite" : "none",
                  }}
                >
                  {isDone ? "Done" : isProcessing ? "..." : task.claimable ? "Claim" : "Start"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black flex flex-col">
      <style>
        {`
        @keyframes pulse {
          0% { box-shadow: 3px 3px 0 #000; transform: translateY(0); }
          50% { box-shadow: 4px 4px 0 #fff; transform: translateY(-2px); }
          100% { box-shadow: 3px 3px 0 #000; transform: translateY(0); }
        }
        `}
      </style>

      {popup && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg animate-bounce">
            {popup}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-[10px] pb-[100px]">
        {renderTasksGroup("standard", <> <span className="text-yellow-400 text-lg">•</span>{" "} <span className="ml-2">Social Tasks</span> </>)}
        {renderTasksGroup("special", <> <span className="text-yellow-400 text-lg">•</span>{" "} <span className="ml-2">Special Tasks</span> </>)}
        {renderTasksGroup("daily", <> <Calendar className="text-yellow-400" size={18} />{" "} <span className="ml-2">Daily Tasks</span> </>)}
        {renderTasksGroup("weekly", <> <Clock className="text-blue-400" size={18} />{" "} <span className="ml-2">Weekly Tasks</span> </>)}
        {renderTasksGroup("milestone", <> <Trophy className="text-purple-400" size={18} />{" "} <span className="ml-2">MP Milestones</span> </>)}
      </div>
    </div>
  );
};

export default Tasks;
