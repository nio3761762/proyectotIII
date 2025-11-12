"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const error_handler_1 = require("../utils/error.handler");
const errorHandler = (err, req, res, next) => {
    if (err instanceof error_handler_1.HttpError) {
        res.status(err.statusCode).json({ message: err.message });
    }
    else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.errorHandler = errorHandler;
