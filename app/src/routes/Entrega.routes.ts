import { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken";
import { actualizarlaDireccion, DevolucionEntrega, getEntregaSucursal, getTipoEntrega, obteneralCliente, obtenerDetalle, ObtenerDIreccionEntrega, ObtenerEntrega } from "../controllers/Entrega,controllers";

const router = Router();


router.use(authMiddleware)
router.get("/getTipoEntrega",getTipoEntrega);
router.get("/ObtenerEntrega/:id",ObtenerEntrega);
router.get('/getEntregaSucursal/:id/:fecha', getEntregaSucursal);
router.get('/obteneralCliente/:id', obteneralCliente);
router.put('/actualizarlaDireccion/:id', actualizarlaDireccion);
router.put('/DevolucionEntrega/:id', DevolucionEntrega);
router.get('/obtenerDetalles/:id', obtenerDetalle);
export default router;