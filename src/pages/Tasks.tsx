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

  // ✅ Reset hàng ngày/tuần cho daily & weekly tasks
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const week = getWeekNumber(new Date());

    const savedDaily = JSON.parse(localStorage.getItem("dailyTasksDate") || "{}");
    const savedWeekly = JSON.parse(localStorage.getItem("weeklyTasksWeek") || "{}");

    setTasks((prev) =>
      prev.map((t) => {
        if (t.category === "daily" && savedDaily[t.id] !== today) {
          savedDaily[t.id] = today;
          t.completed = false;
          t.claimable = false;
        }
        if (t.category === "weekly" && savedWeekly[t.id] !== week) {
          savedWeekly[t.id] = week;
          t.completed = false;
          t.claimable = false;
        }
        return t;
      })
    );

    localStorage.setItem("dailyTasksDate", JSON.stringify(savedDaily));
    localStorage.setItem("weeklyTasksWeek", JSON.stringify(savedWeekly));
  }, [setTasks]);

  // ✅ Load completed tasks cho các loại chỉ claim 1 lần
  useEffect(() => {
    const saved = localStorage.getItem("completedTasks");
    if (saved) {
      const completedIds: string[] = JSON.parse(saved);
      setTasks((prev) =>
        prev.map((t) => (completedIds.includes(t.id) ? { ...t, completed: true, claimable: false } : t))
      );
    }
  }, [setTasks]);

  const saveCompletedTasks = (updatedTasks: TaskType[]) => {
    const completedIds = updatedTasks
      .filter((t) => t.completed && t.category !== "daily" && t.category !== "weekly")
      .map((t) => t.id);
    localStorage.setItem("completedTasks", JSON.stringify(completedIds));
  };

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

  const handleComplete = (task: TaskType) => {
    if (task.link) window.open(task.link, "_blank");
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, claimable: true } : t)));
  };

  const handleClaim = (id: string) => {
    if (claiming[id]) return;
    setClaiming((s) => ({ ...s, [id]: true }));

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const requiredMP =
      task.category === "daily" ? 5000
      : task.category === "weekly" ? 20000
      : task.category === "milestone" ? parseInt(task.id.split("-")[1])
      : 0;

    if (balance < requiredMP) {
      setPopup(`Not enough MP to claim.`);
      setTimeout(() => setPopup(null), 1500);
      setClaiming((s) => ({ ...s, [id]: false }));
      return;
    }

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: true, claimable: false } : t));
      saveCompletedTasks(updated);
      return updated;
    });

    const newBalance = balance + task.reward;
    setBalance(newBalance);
    localStorage.setItem("currentMP", newBalance.toString());

    setPopup(`+${task.reward.toLocaleString()} MP`);
    setTimeout(() => {
      setPopup(null);
      setClaiming((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }, 2000);
  };

  useEffect(() => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.completed) return task;

        const requiredMP =
          task.category === "daily" ? 5000
          : task.category === "weekly" ? 20000
          : task.category === "milestone" ? parseInt(task.id.split("-")[1])
          : 0;

        if (!task.claimable && balance >= requiredMP) return { ...task, claimable: true };
        return task;
      })
    );
  }, [balance, setTasks]);

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
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "1px 1px 0 #000";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #000";
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

// ✅ Helper function để lấy số tuần trong năm
function getWeekNumber(d: Date) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  return Math.ceil((((d.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
}

export default Tasks;
