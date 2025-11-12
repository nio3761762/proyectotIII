"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import {createUser, deleteUser, getUser, getUsers, updateUser,ActivarUser,login} from '../controllers/user.controllers'
const Rol_controllers_1 = require("../controllers/Rol.controllers");
const router = (0, express_1.Router)();
router.post('/addRole', Rol_controllers_1.createRole);
router.get('/role/:id', Rol_controllers_1.getRole);
router.get('/role', Rol_controllers_1.getRoles);
router.get('/permiso', Rol_controllers_1.getPermiso);
router.get('/permisos/:idMenu', Rol_controllers_1.getPermisosPorMenu);
router.put('/role/:id', Rol_controllers_1.updateRole);
router.delete('/role/:id', Rol_controllers_1.deleteRole);
exports.default = router;
