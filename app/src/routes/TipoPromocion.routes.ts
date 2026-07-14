import { Router } from "express";
import { authMiddleware } from "../middleware/verifyToken";
import { getTipopromocions } from "../controllers/Tipopromocion.controllers";

const router = Router();


router.use(authMiddleware)
 router.get("/tipopromocion",getTipopromocions);

export default router;