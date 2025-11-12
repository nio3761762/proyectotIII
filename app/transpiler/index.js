"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
async function main() {
    try {
        await db_1.AppDataSource.initialize();
        console.log('Database connected');
        //el servidor estara ejecutandose en el puerto 3000
        app_1.default.listen(3000);
        console.log('Server is listening on port ,', 3000);
    }
    catch (error) {
        console.log(error);
    }
}
main();
