import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./db";

// Cargar variables del .env
dotenv.config();

async function main() {
  try {
    await AppDataSource.initialize();
  

    const PORT = process.env.PORT;

    app.listen(PORT);
   
  } catch (error) {
  
  }
}

main();