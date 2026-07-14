"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notificacion_controllers_1 = require("../controllers/Notificacion.controllers");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
router.use(verifyToken_1.authMiddleware);
router.post("/send-notifications", Notificacion_controllers_1.sendNotifications);
exports.default = router;
