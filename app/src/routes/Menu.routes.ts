import { Router } from "express";
import { getMenus } from "../controllers/Menu.controllers";
import { authMiddleware } from "../middleware/verifyToken";

const router = Router();


router.use(authMiddleware)
router.get("/Menu",getMenus);

export default router;