import axios from "axios";

// 🔧 Định nghĩa base URL, fallback khi chưa có .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ⚙️ Tạo instance axios
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 Lấy danh sách tasks
export const getTasks = async () => {
  const res = await API.get("/tasks");
  return res.data;
};

// 🧠 Lấy danh sách users
export const getUsers = async () => {
  const res = await API.get("/users");
  return res.data;
};

// 🧠 Lấy thống kê admin
export const getAdminStats = async () => {
  const res = await API.get("/admin/stats");
  return res.data;
};

// 🧠 Đăng ký user (nếu cần)
export const registerUser = async (data: any) => {
  const res = await API.post("/users/register", data);
  return res.data;
};

export default API;
