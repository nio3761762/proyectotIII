import multer from "multer";
import path from "path";
import fs from "fs";

// Crear carpeta si no existe
const uploadDir = path.resolve(__dirname, "..", "..", "uploads", "files");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const uploadFile = multer({ storage });
