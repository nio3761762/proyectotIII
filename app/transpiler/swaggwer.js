"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de reserva de boletos para Buses',
            version: '1.0.0',
            description: 'Documentación de la API de reserva de boletos para Buses, de la empresa ficcticia de transporte Expreso Arequipa',
        },
        // servers: [
        //   {
        //     url: 'http://localhost:3000', // Cambia esto si tu servidor está en una URL diferente
        //   },
        // ],
    },
    apis: [
        `${path_1.default.join(__dirname, './routes/*')}`
    ], // Ruta a los archivos donde están los endpoints, ajustado a TypeScript './routes/*.ts'
};
//const swaggerSpec = swaggerJsdoc(options);
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
