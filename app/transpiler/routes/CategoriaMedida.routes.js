"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoriaMedida_controllers_1 = require("../controllers/CategoriaMedida.controllers");
const router = (0, express_1.Router)();
//router.use(authMiddleware)
router.post("/createCategoriaMedida", CategoriaMedida_controllers_1.createCategoriaMedida);
router.put('/updateCateriaMedida/:id', CategoriaMedida_controllers_1.updateCateriaMedida);
router.get('/getMedidas', CategoriaMedida_controllers_1.getMedidas);
router.get('/getCategoriaMedidas', CategoriaMedida_controllers_1.getCategoriaMedidas);
router.delete('/deleteCategoriaMedida/:id', CategoriaMedida_controllers_1.deleteCategoriaMedida);
router.get('/ObtenerMedidas/:id', CategoriaMedida_controllers_1.ObtenerMedidas);
router.get('/ObtenrCategoriaMedida/:id', CategoriaMedida_controllers_1.ObtenrCategoriaMedida);
exports.default = router;
