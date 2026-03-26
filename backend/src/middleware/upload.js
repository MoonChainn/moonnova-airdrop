// src/middleware/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Xử lý __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình nơi lưu file upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// Kiểm tra loại file hợp lệ
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Chỉ chấp nhận file ảnh (jpeg, png, webp)"), false);
};

const upload = multer({ storage, fileFilter });

// ✅ Export default để ESM nhận đúng
export default upload;
