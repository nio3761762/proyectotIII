import { Router } from "express";
import { getCube, testDetalleVenta, getDailySummary, getOlapDataForDateAndBranch, getLatestMovements, getOlapData, getRecentAlerts } from "../controllers/Olap.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

//router.use(authMiddleware);
router.get("/Olap/test", testDetalleVenta);
router.get("/Olap/daily_summary", getDailySummary);
router.get("/Olap/summary", getOlapDataForDateAndBranch);
router.get("/Olap/cube", getCube);
router.get("/Olap/latest_movements", getLatestMovements);
 router.get("/Olap/Cubes", getOlapData);
router.get("/Olap/latest-movements", getLatestMovements);
router.get("/Olap/recent-alerts", getRecentAlerts);


export default router; 