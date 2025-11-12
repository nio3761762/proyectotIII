"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Entrega_controllers_1 = require("../controllers/Entrega,controllers");
const router = (0, express_1.Router)();
// router.use(authMiddleware)
router.get("/getTipoEntrega", Entrega_controllers_1.getTipoEntrega);
router.get("/ObtenerEntrega/:id", Entrega_controllers_1.ObtenerEntrega);
router.get('/getEntregaSucursal/:id/:fecha', Entrega_controllers_1.getEntregaSucursal);
router.get('/obteneralCliente/:id', Entrega_controllers_1.obteneralCliente);
router.put('/actualizarlaDireccion/:id', Entrega_controllers_1.actualizarlaDireccion);
router.put('/DevolucionEntrega/:id', Entrega_controllers_1.DevolucionEntrega);
router.get('/obtenerDetalles/:id', Entrega_controllers_1.obtenerDetalle);
exports.default = router;
