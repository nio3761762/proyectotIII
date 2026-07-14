import { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken";
import { registrarPedido, anularpedido, enviarPedido, finalizarPedido, devolverProductoPedido, getPedidos, actualizarPedido, registrarPedidoRapido } from "../controllers/Pedido.controllers"
import { getTipopedido } from "../controllers/TipoPedido.controllers";

 const router = Router();


 router.use(authMiddleware)
 router.get("/pedidos",getPedidos);
 router.post("/Addpedidos",registrarPedido);
 router.post("/AddpedidosRapido",registrarPedidoRapido);
 router.put("/anularPedido/:id",anularpedido);
 router.put("/enviarPedido/:id", enviarPedido);
 router.put("/finalizarPedido/:id", finalizarPedido);
 router.put("/devolverProducto/:id", devolverProductoPedido);
 router.put("/actualizarPedido/:id", actualizarPedido);

router.get("/getTipopedido",getTipopedido);
 export default router;