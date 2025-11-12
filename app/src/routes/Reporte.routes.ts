import { Router } from "express";
import { getReporteProductos, getReportePedidos, getVentasReportes, getReporteProduccionInsumos} from "../controllers/Reporte.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.get("/reporte/productos", getReporteProductos);
router.get("/reporte/ventas", getVentasReportes);
router.get("/reporte/pedidos", getReportePedidos);
router.get("/reporte/produccion-insumos", getReporteProduccionInsumos);

export default router;