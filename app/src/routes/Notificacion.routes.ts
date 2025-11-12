
import { Router } from "express";
import { sendNotifications } from "../controllers/Notificacion.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();

router.use(authMiddleware);
router.post("/send-notifications", sendNotifications);

export default router;
