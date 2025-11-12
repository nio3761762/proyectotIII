"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Configuración de almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // carpeta donde se guardan las imágenes
    },
    filename: (req, File, cb) => {
        cb(null, Date.now() + path_1.default.extname(File.originalname)); // nombre único
    },
});
const upload = (0, multer_1.default)({ storage });
// Ruta para subir imagen
router.post('/upload', upload.single('imagen'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
});
exports.default = router;
