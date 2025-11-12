"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Complemento_controllers_1 = require("../controllers/Complemento.controllers");
const Email_controllers_1 = require("../controllers/Email.controllers");
const Celular_controllers_1 = require("../controllers/Celular.controllers");
const router = (0, express_1.Router)();
// router.use(authMiddleware)
router.get("/Complemento", Complemento_controllers_1.getComplemento);
router.get("/getDocumento", Complemento_controllers_1.getDocumento);
router.get("/getEmail", Email_controllers_1.getEmail);
router.get("/getCelular", Celular_controllers_1.getCelular);
exports.default = router;
