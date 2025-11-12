import { Router } from "express";
import { createTipoLicencia, getTipoLicencias, getTipoLicencia, updateTipoLicencia, deleteTipoLicencia } from "../controllers/TipoLicencia.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();
router.use(authMiddleware)
router.post("/tipolicencia", createTipoLicencia);
router.get("/tipolicencia", getTipoLicencias);
router.get("/tipolicencia/:id", getTipoLicencia);
router.put("/tipolicencia/:id", updateTipoLicencia);
router.delete("/tipolicencia/:id", deleteTipoLicencia);

export default router;
