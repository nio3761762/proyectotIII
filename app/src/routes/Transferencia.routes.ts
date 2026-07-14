import { Router } from "express";
import { getTransferencias, registrarTransferencia, anularTransferencia } from "../controllers/Transferencia.controllers";

const router = Router();

router.post("/transferencia", registrarTransferencia);
router.get("/gettransferencia", getTransferencias);
router.put("/anulartransferencia/:id", anularTransferencia);

export default router;