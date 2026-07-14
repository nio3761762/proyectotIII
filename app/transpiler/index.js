"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
// Cargar variables del .env
dotenv_1.default.config();
async function main() {
    try {
        await db_1.AppDataSource.initialize();
        console.log("Database connected");
        const PORT = process.env.PORT || 3000;
        app_1.default.listen(PORT);
        console.log("Server is listening on port:", PORT);
    }
    catch (error) {
        console.log(error);
    }
}
main();
