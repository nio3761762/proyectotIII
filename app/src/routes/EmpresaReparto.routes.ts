import { Router } from "express";
import { createEmpresaReparto, getEmpresaRepartos, getEmpresaReparto, updateEmpresaReparto, deleteEmpresaReparto } from "../controllers/EmpresaReparto.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.post("/empresareparto", createEmpresaReparto);
router.get("/empresareparto", getEmpresaRepartos);
router.get("/empresareparto/:id", getEmpresaReparto);
router.put("/empresareparto/:id", updateEmpresaReparto);
router.delete("/empresareparto/:id", deleteEmpresaReparto);

export default router;
