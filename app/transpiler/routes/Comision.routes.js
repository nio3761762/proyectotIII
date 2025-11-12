"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Comision_controllers_1 = require("../controllers/Comision.controllers");
const router = (0, express_1.Router)();
//router.use(authMiddleware)
router.post("/AddComision", Comision_controllers_1.createComision);
router.put('/uptComision/:id', Comision_controllers_1.updateComision);
router.delete('/DelComision/:id', Comision_controllers_1.deleteComision);
router.get('/Comisiones', Comision_controllers_1.getComision);
exports.default = router;
