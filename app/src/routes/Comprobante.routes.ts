import { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken";
import { getComprobante } from "../controllers/Comprobante.controllers";

const router = Router();


 router.use(authMiddleware)
router.get("/Comprobante",getComprobante);

export default router;