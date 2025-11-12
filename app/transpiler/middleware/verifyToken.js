"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicAccessMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'your_secret_key');
        console.log("Token decodificado en authMiddleware:", decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(400).json({ message: "Invalid token." });
    }
};
exports.authMiddleware = authMiddleware;
const publicAccessMiddleware = (req, res, next) => {
    // Aquí puedes agregar lógica adicional para permitir acceso público a rutas específicas
    next();
};
exports.publicAccessMiddleware = publicAccessMiddleware;
