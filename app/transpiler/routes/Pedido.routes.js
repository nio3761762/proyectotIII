"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Pedido_Controllers_1 = require("../controllers/Pedido.Controllers");
const TipoPedido_controllers_1 = require("../controllers/TipoPedido.controllers");
const router = (0, express_1.Router)();
// router.use(authMiddleware)
router.get("/pedidos", Pedido_Controllers_1.getPedidos);
router.post("/Addpedidos", Pedido_Controllers_1.createPedido);
router.put("/anularPedido/:id", Pedido_Controllers_1.anularPedido);
router.put("/enviarPedido/:id", Pedido_Controllers_1.enviarPedido);
router.put("/PagarPedido/:id", Pedido_Controllers_1.PagarPedido);
router.put("/PonerProceso/:id", Pedido_Controllers_1.PonerEnProceso);
router.put("/updPedido/:id", Pedido_Controllers_1.updatePedido);
router.get('/getPedidoSucursal/:id/:fecha/:pago', Pedido_Controllers_1.getPedidoSucursal);
router.get("/getTipopedido", TipoPedido_controllers_1.getTipopedido);
exports.default = router;
