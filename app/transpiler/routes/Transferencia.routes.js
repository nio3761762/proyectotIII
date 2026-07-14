"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Transferencia_controllers_1 = require("../controllers/Transferencia.controllers");
const router = (0, express_1.Router)();
router.post("/transferencia", Transferencia_controllers_1.registrarTransferencia);
router.get("/gettransferencia", Transferencia_controllers_1.getTransferencias);
router.put("/anulartransferencia/:id", Transferencia_controllers_1.anularTransferencia);
exports.default = router;
