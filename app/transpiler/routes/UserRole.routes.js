"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import {createUser, deleteUser, getUser, getUsers, updateUser,ActivarUser,login} from '../controllers/user.controllers'
const UserRol_controllers_1 = require("../controllers/UserRol.controllers");
const router = (0, express_1.Router)();
router.post('/Aasignar', UserRol_controllers_1.assignRoleToUser);
router.get('/UserRole/:id', UserRol_controllers_1.getUserRoles);
exports.default = router;
