"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const File_controllers_1 = require("../controllers/File.controllers");
const file_multer_1 = require("../config/file-multer");
const router = (0, express_1.Router)();
router.post('/upload-Archivo', file_multer_1.uploadFile.single('archivo'), File_controllers_1.uploadFile);
exports.default = router;
