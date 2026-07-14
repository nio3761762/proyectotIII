import { Router } from "express";
import { 
    getReportePedidosDetallado,
    getReportePedidosConsolidado,
    getReporteVentasDetallado,
    getReporteVentasConsolidado 
} from "../controllers/reportes/VentasReporte.controllers";
import { 
    getReporteProduccionDetallado,
    getReporteProduccionConsolidado 
} from "../controllers/reportes/ProduccionReporte.controllers";
import { 
    getReporteTransferenciasDetallado,
    getReporteTransferenciasConsolidado 
} from "../controllers/reportes/TransferenciaReporte.controllers";
import { 
    getReporteInventarioConsolidado,
    getReporteKardex 
} from "../controllers/reportes/InventarioReporte.controllers";
import { 
    getReporteComprasConsolidado,
    getReportePreciosHistorico 
} from "../controllers/reportes/ComprasReporte.controllers";
import { 
    getReporteEmpleadosOperativo,
    getReporteVendedoresLiquidacion 
} from "../controllers/reportes/EmpleadosReporte.controllers";
import { 
    getReporteFinancieroConsolidado 
} from "../controllers/reportes/FinancieroReporte.controllers";
import { 
    getReporteGastosGenerales 
} from "../controllers/reportes/GastosGeneralesReporte.controllers";
import { 
    getReporteRevendedorConsolidado,
    getReporteRevendedorDetallado
} from "../controllers/reportes/RevendedorReporte.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();
router.use(authMiddleware)
// --- REPORTES EXISTENTES/REFACTORIZADOS ---
router.get("/reporte/ventas-detallado", getReporteVentasDetallado);
router.get("/reporte/pedidos-detallado", getReportePedidosDetallado);
router.get("/reporte/produccion-detallado", getReporteProduccionDetallado);
router.get("/reporte/transferencias-detallado", getReporteTransferenciasDetallado);
router.get("/reporte/revendedor-detallado", getReporteRevendedorDetallado);

// --- NUEVOS REPORTES CONSOLIDADOS (prompreporte.txt) ---
router.get("/reporte/ventas-consolidado", getReporteVentasConsolidado);
router.get("/reporte/pedidos-consolidado", getReportePedidosConsolidado);
router.get("/reporte/produccion-consolidado", getReporteProduccionConsolidado);
router.get("/reporte/transferencias-consolidado", getReporteTransferenciasConsolidado);
router.get("/reporte/inventario-consolidado", getReporteInventarioConsolidado);
router.get("/reporte/kardex", getReporteKardex);
router.get("/reporte/compras-consolidado", getReporteComprasConsolidado);
router.get("/reporte/precios-historico", getReportePreciosHistorico);
router.get("/reporte/empleados-operativo", getReporteEmpleadosOperativo);
router.get("/reporte/vendedores-liquidacion", getReporteVendedoresLiquidacion);
router.get("/reporte/financiero-consolidado", getReporteFinancieroConsolidado);
router.get("/reporte/revendedor-consolidado", getReporteRevendedorConsolidado);
router.get("/reporte/gastos-generales", getReporteGastosGenerales);

export default router;

