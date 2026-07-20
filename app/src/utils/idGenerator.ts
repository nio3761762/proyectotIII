import { AppDataSource } from '../db';
import { QueryRunner } from 'typeorm';

/**
 * Genera un ID secuencial con el formato MMDDYYYY<PREFIJO>-<SECUENCIA>
 * La secuencia se reinicia cada día.
 * Si se pasa un queryRunner, participa en su transacción (evita saltos por rollback).
 *
 * @param prefijo El prefijo para el tipo de entidad (ej. 'U' para Usuario).
 * @param queryRunner Opcional — si se provee, usa esa conexión/transacción.
 * @returns El nuevo ID generado.
 */
export async function generarIdSecuencial(prefijo: string, queryRunner?: QueryRunner): Promise<string> {
    const propio = !queryRunner;
    console.log(`  generarIdSecuencial INICIO prefijo=${prefijo} propio=${propio}`);
    const qr = queryRunner ?? AppDataSource.createQueryRunner();

    if (propio) {
        console.log(`  generarIdSecuencial conectando QR para ${prefijo}...`);
        await qr.connect();
        console.log(`  generarIdSecuencial conectado, iniciando tx para ${prefijo}...`);
        await qr.startTransaction();
        console.log(`  generarIdSecuencial tx iniciada para ${prefijo}`);
    }

    try {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        const dia = ahora.getDate().toString().padStart(2, '0');

        const fechaFormatoSQL = `${anio}-${mes}-${dia}`;
        const fechaFormatoId = `${mes}${dia}${anio}`;

        console.log(`  generarIdSecuencial consultando FOR UPDATE para ${prefijo}...`);
        const res = await qr.query(
            'SELECT ultima_secuencia FROM "contadorsecuencias" WHERE prefijo = $1 AND fecha = $2 FOR UPDATE',
            [prefijo, fechaFormatoSQL]
        );

        let nuevaSecuencia: number;

        if (res.length === 0) {
            nuevaSecuencia = 1;
            await qr.query(
                'INSERT INTO "contadorsecuencias" (prefijo, fecha, ultima_secuencia) VALUES ($1, $2, $3)',
                [prefijo, fechaFormatoSQL, nuevaSecuencia]
            );
        } else {
            nuevaSecuencia = res[0].ultima_secuencia + 1;
            await qr.query(
                'UPDATE "contadorsecuencias" SET ultima_secuencia = $1 WHERE prefijo = $2 AND fecha = $3',
                [nuevaSecuencia, prefijo, fechaFormatoSQL]
            );
        }

        if (propio) await qr.commitTransaction();
        return `${fechaFormatoId}${prefijo}-${nuevaSecuencia}`;

    } catch (error) {
        if (propio) await qr.rollbackTransaction();
        console.error('Error al generar ID secuencial:', error);
        throw new Error('No se pudo generar el ID secuencial.');
    } finally {
        if (propio) await qr.release();
    }
}