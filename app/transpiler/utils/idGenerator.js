"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarIdSecuencial = generarIdSecuencial;
const db_1 = require("../db"); // Importar AppDataSource
/**
 * Genera un ID secuencial con el formato MMDDYYYY<PREFIJO>-<SECUENCIA>
 * La secuencia se reinicia cada día.
 * Utiliza una transacción para garantizar la atomicidad y evitar IDs duplicados.
 *
 * @param prefijo El prefijo para el tipo de entidad (ej. 'U' para Usuario).
 * @returns El nuevo ID generado.
 */
async function generarIdSecuencial(prefijo) {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        await queryRunner.startTransaction();
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        const dia = ahora.getDate().toString().padStart(2, '0');
        const fechaFormatoSQL = `${anio}-${mes}-${dia}`;
        const fechaFormatoId = `${mes}${dia}${anio}`;
        // 1. Buscar la secuencia actual (usa el mismo nombre de tabla en todas las consultas)
        const res = await queryRunner.query('SELECT ultima_secuencia FROM "contadorsecuencias" WHERE prefijo = $1 AND fecha = $2 FOR UPDATE', [prefijo, fechaFormatoSQL]);
        let nuevaSecuencia;
        if (res.length === 0) {
            // 2a. Insertar nuevo registro
            nuevaSecuencia = 1;
            await queryRunner.query('INSERT INTO "contadorsecuencias" (prefijo, fecha, ultima_secuencia) VALUES ($1, $2, $3)', [prefijo, fechaFormatoSQL, nuevaSecuencia]);
        }
        else {
            // 2b. Actualizar registro existente
            nuevaSecuencia = res[0].ultima_secuencia + 1;
            await queryRunner.query('UPDATE "contadorsecuencias" SET ultima_secuencia = $1 WHERE prefijo = $2 AND fecha = $3', [nuevaSecuencia, prefijo, fechaFormatoSQL]);
        }
        await queryRunner.commitTransaction();
        return `${fechaFormatoId}${prefijo}-${nuevaSecuencia}`;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error al generar ID secuencial:', error);
        throw new Error('No se pudo generar el ID secuencial.');
    }
    finally {
        await queryRunner.release();
    }
}
