import { Router } from "express";
import { getDistribuciones, getDistribucion, updateDistribucion, deleteDistribucion, createDistribucion, ObtenerCLienteDestino, getDistribucionesSucursal, anularDistribucion } from "../controllers/Distribucion.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.get("/distribuciones", getDistribuciones);
router.get("/getDistribucionesSucursal", getDistribucionesSucursal);
router.get("/ObtenerCLienteDestino/:id", ObtenerCLienteDestino);
router.post("/distribucion", createDistribucion);
router.get("/distribucion/:id", getDistribucion);
router.put("/distribucion/:id", updateDistribucion);
router.put("/distribucionanular/:id", anularDistribucion);
router.delete("/distribucion/:id", deleteDistribucion);

export default router;