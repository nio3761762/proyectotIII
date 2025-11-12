"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Menu_controllers_1 = require("../controllers/Menu.controllers");
const router = (0, express_1.Router)();
// router.use(authMiddleware)
router.get("/Menu", Menu_controllers_1.getMenus);
exports.default = router;
