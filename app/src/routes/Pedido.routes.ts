import { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken";
import { anularPedido, createPedido, enviarPedido, getPedidos, getPedidoSucursal, PagarPedido, PonerEnProceso, updatePedido } from "../controllers/Pedido.Controllers";
import { getTipopedido } from "../controllers/TipoPedido.controllers";

const router = Router();


router.use(authMiddleware)
router.get("/pedidos",getPedidos);
router.post("/Addpedidos",createPedido);
router.put("/anularPedido/:id",anularPedido);
router.put("/enviarPedido/:id",enviarPedido);
router.put("/PagarPedido/:id",PagarPedido);
router.put("/PonerProceso/:id",PonerEnProceso);
router.put("/updPedido/:id",updatePedido);
router.get('/getPedidoSucursal/:id/:fecha/:pago', getPedidoSucursal);
router.get("/getTipopedido",getTipopedido);
export default router;