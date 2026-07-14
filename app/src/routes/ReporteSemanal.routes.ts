import { Router } from "express";
import {
    getReporteSemanalVentas,
    getReporteSemanalPedidos,
    getReporteSemanalProduccion,
    getReporteSemanalTransferencias,
    getReporteSemanalCompras,
    getReporteSemanalGastosGenerales,
    getReporteSemanalFinanciero,
    getReporteSemanalComisiones,
    getReporteSemanalKardex,
    getReporteSemanalGeneral
} from "../controllers/reportes/ReporteSemanal.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();
router.use(authMiddleware);

router.get("/reporte-semanal/ventas", getReporteSemanalVentas);
router.get("/reporte-semanal/pedidos", getReporteSemanalPedidos);
router.get("/reporte-semanal/produccion", getReporteSemanalProduccion);
router.get("/reporte-semanal/transferencias", getReporteSemanalTransferencias);
router.get("/reporte-semanal/compras", getReporteSemanalCompras);
router.get("/reporte-semanal/gastos-generales", getReporteSemanalGastosGenerales);
router.get("/reporte-semanal/financiero", getReporteSemanalFinanciero);
router.get("/reporte-semanal/comisiones", getReporteSemanalComisiones);
router.get("/reporte-semanal/kardex", getReporteSemanalKardex);
router.get("/reporte-semanal/resumen-general", getReporteSemanalGeneral);

export default router;
