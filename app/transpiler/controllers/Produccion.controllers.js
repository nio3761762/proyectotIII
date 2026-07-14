"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarMermaProduccion = exports.getInsumosSucursal = exports.getProducciones = exports.verifyProduccion = exports.consumirInsumoFIFO = exports.anularProduccion = exports.agregarEmpleadoProduccion = exports.descartarProductosDaniados = exports.finalizarProduccionTotal = exports.cambiarCombustibleHorno = exports.registrarSalidaProducto = exports.apagarHorno = exports.encenderHorno = exports.finalizarTurnoEmpleado = exports.iniciarProduccion = void 0;
const typeorm_1 = require("typeorm");
const Produccion_1 = require("../entities/Produccion");
const idGenerator_1 = require("../utils/idGenerator");
const MovimientoInventario_1 = require("../entities/MovimientoInventario");
const Inventario_1 = require("../entities/Inventario");
const ProduccionEmpleado_1 = require("../entities/ProduccionEmpleado");
const Empleado_controllers_1 = require("./Empleado.controllers");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Insumo_controllers_1 = require("./Insumo.controllers");
const error_handler_1 = require("../utils/error.handler");
const Fecha_1 = require("../utils/Fecha");
const HornoEnergia_1 = require("../entities/HornoEnergia");
const Receta_1 = require("../entities/Receta");
const ConfiguracionEnergia_1 = require("../entities/ConfiguracionEnergia");
const Gastos_1 = require("../entities/Gastos");
const Horario_1 = require("../entities/Horario");
const Detalleproduccuin_1 = require("../entities/Detalleproduccuin");
const Producto_controllers_1 = require("./Producto.controllers");
const Inventario_controllers_1 = require("./Inventario.controllers");
const Produccionhornodetalle_1 = require("../entities/Produccionhornodetalle");
const Horno_controllers_1 = require("./Horno.controllers");
const HornoProduccto_1 = require("../entities/HornoProduccto");
const db_1 = require("../db");
/**
 * ============================================================================
 * CONTROL DE PRODUCCIÓN: SALIDA INSTANTÁNEA PARA VENTA
 * ============================================================================
 */
/**
 *  PASO 1: INICIAR PRODUCCIÓN
 */
const iniciarProduccion = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { Idsucursal, IdEmpleados, Observacion, HoraInicio, HoraFin, FechaRegistro } = req.body;
        const h_inicio = HoraInicio || hora;
        const h_fin = HoraFin || null;
        const produccion = new Produccion_1.Produccion();
        produccion.IdProduccion = await (0, idGenerator_1.generarIdSecuencial)('PROD', queryRunner);
        produccion.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: Idsucursal });
        produccion.FechaProduccion = FechaRegistro || fecha;
        produccion.HoraInicio = h_inicio;
        produccion.HoraFin = h_fin;
        if (Observacion)
            produccion.Observacion = Observacion;
        // Inicializar costos
        produccion.CostoManoObra = 0;
        produccion.CostoTotal = 0;
        await queryRunner.manager.save(produccion);
        let totalMO = 0;
        for (const idEmp of IdEmpleados) {
            const pe = new ProduccionEmpleado_1.ProduccionEmpleado();
            const sueldo = await (0, Empleado_controllers_1.SalarioEmpleado)(idEmp);
            pe.IdProduccionEmpleado = await (0, idGenerator_1.generarIdSecuencial)("PE", queryRunner);
            pe.Produccion = produccion;
            pe.Empleado = await (0, Empleado_controllers_1.verifyEmpleado)(idEmp);
            pe.Sucursal = produccion.Sucursal;
            pe.Fecha = fecha;
            pe.HoraInicio = h_inicio;
            pe.CostoHora = await calcularCostoHoraEmpleado(sueldo, Idsucursal);
            if (h_fin) {
                pe.HoraFin = h_fin;
                const inicio = new Date(`1970-01-01T${pe.HoraInicio}`);
                const fin = new Date(`1970-01-01T${pe.HoraFin}`);
                let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                if (diff < 0)
                    diff += 24;
                pe.Horas = diff;
                pe.CostoTotal = pe.Horas * Number(pe.CostoHora);
                totalMO += Number(pe.CostoTotal);
            }
            else {
                pe.CostoTotal = 0;
                pe.Horas = 0;
            }
            await queryRunner.manager.save(pe);
        }
        if (h_fin) {
            produccion.CostoManoObra = totalMO;
            produccion.CostoTotal = Number(produccion.CostoInsumos) + Number(produccion.CostoManoObra) + Number(produccion.CostoIndirecto);
            await queryRunner.manager.save(produccion);
        }
        await queryRunner.commitTransaction();
        return res.json({
            message: h_fin ? "Producción registrada y finalizada" : "Producción iniciada",
            IdProduccion: produccion.IdProduccion
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.iniciarProduccion = iniciarProduccion;
/**
 *  FINALIZAR TURNO EMPLEADO
 */
const finalizarTurnoEmpleado = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, IdEmpleado, HoraFin } = req.body;
        const pe = await queryRunner.manager.findOne(ProduccionEmpleado_1.ProduccionEmpleado, {
            where: { Produccion: { IdProduccion }, Empleado: { IdEmpleado }, HoraFin: (0, typeorm_1.IsNull)() }
        });
        if (!pe)
            throw new Error("No hay turno activo");
        const h_fin = HoraFin || hora;
        pe.HoraFin = h_fin;
        const inicio = new Date(`1970-01-01T${pe.HoraInicio}`);
        const fin = new Date(`1970-01-01T${pe.HoraFin}`);
        let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        if (diff < 0)
            diff += 24; // Manejo de cruce de medianoche
        pe.Horas = diff;
        pe.CostoTotal = pe.Horas * Number(pe.CostoHora);
        await queryRunner.manager.save(pe);
        await queryRunner.commitTransaction();
        return res.json({ message: "Empleado finalizó" });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.finalizarTurnoEmpleado = finalizarTurnoEmpleado;
/** QueryRunner o transaction
 *  PASO 2: ENCENDER EL HORNO
 */
const encenderHorno = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, IdHorno, TipoEnergia, HoraInicio } = req.body;
        const peh = new Produccionhornodetalle_1.ProduccionHornoDetalle();
        peh.IdProduccionHornoDetalle = await (0, idGenerator_1.generarIdSecuencial)("PEH", queryRunner);
        peh.Produccion = await (0, exports.verifyProduccion)(IdProduccion);
        peh.Horno = await (0, Horno_controllers_1.verifyHorno)(IdHorno);
        peh.TipoEnergia = TipoEnergia;
        peh.Fecha = peh.Produccion.FechaProduccion || fecha;
        peh.HoraInicio = HoraInicio || hora;
        await queryRunner.manager.save(peh);
        await queryRunner.commitTransaction();
        return res.json({ message: "Horno encendido", IdProduccionHornoDetalle: peh.IdProduccionHornoDetalle });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.encenderHorno = encenderHorno;
/**
 *  PASO 2.5: APAGAR EL HORNO
 *  Cierra la sesión activa del horno y calcula el consumo y costo.
 */
const apagarHorno = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, IdHorno, HoraFin } = req.body;
        const peh = await queryRunner.manager.findOne(Produccionhornodetalle_1.ProduccionHornoDetalle, {
            where: { Produccion: { IdProduccion }, Horno: { IdHorno }, HoraFin: (0, typeorm_1.IsNull)() },
            relations: ["Produccion", "Produccion.Sucursal", "Horno"]
        });
        if (!peh)
            throw new Error("No se encontró una sesión activa para este horno.");
        const IdSucursal = peh.Produccion.Sucursal.IdSucursal;
        const f_hora = HoraFin || hora;
        peh.HoraFin = f_hora;
        // Calcular horas transcurridas
        const inicio = new Date(`1970-01-01T${peh.HoraInicio}`);
        const fin = new Date(`1970-01-01T${peh.HoraFin}`);
        let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        if (diff < 0)
            diff += 24; // Cruce de medianoche
        peh.Horas = diff;
        // Obtener información de consumo del horno para el tipo de energía usado
        const infoE = await queryRunner.manager.findOne(HornoEnergia_1.HornoEnergia, {
            where: { Horno: { IdHorno: peh.Horno.IdHorno }, TipoEnergia: peh.TipoEnergia }
        });
        const consumo = peh.Horas * Number(infoE?.ConsumoPorHora || 0);
        peh.Consumo = consumo;
        // Calcular costo según tipo de energía
        if (peh.TipoEnergia === "Gas GLP") {
            const config = await queryRunner.manager.findOne(ConfiguracionEnergia_1.ConfiguracionEnergia, { where: { TipoEnergia: peh.TipoEnergia }, relations: ["Insumo"] });
            peh.Costo = await (0, exports.consumirInsumoFIFO)(queryRunner, config?.Insumo?.IdInsumo, consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
        }
        else {
            peh.Costo = consumo * await calcularCostoUnitarioPromedio(peh.TipoEnergia, IdSucursal);
        }
        await queryRunner.manager.save(peh);
        // Actualizar Costo Indirecto en la cabecera de Producción
        const produccion = peh.Produccion;
        produccion.CostoIndirecto = Number(produccion.CostoIndirecto) + Number(peh.Costo);
        await queryRunner.manager.save(produccion);
        await queryRunner.commitTransaction();
        return res.json({
            message: "Horno apagado correctamente.",
            horasUso: peh.Horas,
            consumo: peh.Consumo,
            costo: peh.Costo
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.apagarHorno = apagarHorno;
/**
 *  PASO 3: REGISTRAR SALIDA Y VENTA AL INSTANTE
 */
const registrarSalidaProducto = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, IdProducto, IdEmpleado, Cantidad, IdHorno, HoraRegistro } = req.body;
        const produccion = await queryRunner.manager.findOne(Produccion_1.Produccion, { where: { IdProduccion }, relations: ["Sucursal"] });
        if (!produccion)
            throw new Error("Producción no encontrada");
        const IdSucursal = produccion.Sucursal.IdSucursal;
        const empleado = await (0, Empleado_controllers_1.verifyEmpleado)(IdEmpleado);
        const sesionHorno = await queryRunner.manager.findOne(Produccionhornodetalle_1.ProduccionHornoDetalle, {
            where: { Produccion: { IdProduccion }, Horno: { IdHorno }, HoraFin: (0, typeorm_1.IsNull)() }
        });
        if (!sesionHorno)
            throw new Error("No hay sesión de horno activa.");
        // 1. Registro detallado
        const hp = new HornoProduccto_1.Hornoproducto();
        hp.Idhornoproducto = await (0, idGenerator_1.generarIdSecuencial)("HPROD", queryRunner);
        hp.ProduccionHornoDetalle = sesionHorno;
        hp.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
        hp.Empleado = empleado;
        hp.Cantidad = Cantidad;
        hp.Hora = HoraRegistro; // Guardamos la hora de la salida
        await queryRunner.manager.save(hp);
        // 2. Descontar Insumos (FIFO)
        const receta = await queryRunner.manager.findOne(Receta_1.Receta, { where: { Producto: { IdProducto } }, relations: ["Ingredientes", "Ingredientes.Insumo"] });
        let costoInsumosNuevos = 0;
        if (receta) {
            const factor = Cantidad / Number(receta.Rendimiento);
            for (const ing of receta.Ingredientes) {
                costoInsumosNuevos += await (0, exports.consumirInsumoFIFO)(queryRunner, ing.Insumo.IdInsumo, Number(ing.Pesoconvertido) * factor, IdSucursal, IdProduccion);
            }
        }
        // 3. Detalle Producción (Acumulado para el cierre)
        let detalle = await queryRunner.manager.findOne(Detalleproduccuin_1.DetalleProduccion, { where: { Produccion: { IdProduccion }, Producto: { IdProducto }, Empleado: { IdEmpleado } } });
        if (detalle) {
            detalle.Cantidad = Number(detalle.Cantidad) + Number(Cantidad);
            detalle.CostoTotal = Number(detalle.CostoTotal) + costoInsumosNuevos;
            detalle.CostoUnitario = Number(detalle.CostoTotal) / Number(detalle.Cantidad);
        }
        else {
            detalle = new Detalleproduccuin_1.DetalleProduccion();
            detalle.IdDetalleProduccion = await (0, idGenerator_1.generarIdSecuencial)("DTPRO", queryRunner);
            detalle.Produccion = produccion;
            detalle.Producto = await (0, Producto_controllers_1.verifyProducto)({ ProductoId: IdProducto });
            detalle.Empleado = empleado;
            detalle.Cantidad = Cantidad;
            detalle.CostoTotal = costoInsumosNuevos;
            detalle.CostoUnitario = costoInsumosNuevos / Cantidad;
        }
        await queryRunner.manager.save(detalle);
        // 4. ACTUALIZAR CABECERA
        produccion.CostoInsumos = Number(produccion.CostoInsumos) + costoInsumosNuevos;
        await queryRunner.manager.save(produccion);
        // 🚀 5. ENTRADA AL INVENTARIO (AL INSTANTE PARA VENTA)
        await (0, Inventario_controllers_1.createLoteInventario)(queryRunner, IdProducto, null, Number(Cantidad), detalle.CostoUnitario, IdSucursal, 'ENTRADA_PRODUCCION', IdProduccion, detalle.CostoUnitario, undefined);
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "Salida registrada. Producto disponible para venta." });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.registrarSalidaProducto = registrarSalidaProducto;
/**
 *  CAMBIO DE COMBUSTIBLE
 */
const cambiarCombustibleHorno = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { hora, fecha } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, IdHorno, NuevoTipoEnergia, HoraFin } = req.body;
        const peh = await queryRunner.manager.findOne(Produccionhornodetalle_1.ProduccionHornoDetalle, {
            where: { Produccion: { IdProduccion }, Horno: { IdHorno }, HoraFin: (0, typeorm_1.IsNull)() },
            relations: ["Produccion", "Produccion.Sucursal", "Horno"]
        });
        if (!peh)
            throw new Error("Sin sesión activa");
        const IdSucursal = peh.Produccion.Sucursal.IdSucursal;
        const f_hora = HoraFin || hora;
        peh.HoraFin = f_hora;
        const inicio = new Date(`1970-01-01T${peh.HoraInicio}`);
        const fin = new Date(`1970-01-01T${peh.HoraFin}`);
        let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        if (diff < 0)
            diff += 24;
        peh.Horas = diff;
        const infoE = await queryRunner.manager.findOne(HornoEnergia_1.HornoEnergia, { where: { Horno: { IdHorno: peh.Horno.IdHorno }, TipoEnergia: peh.TipoEnergia } });
        const consumo = peh.Horas * Number(infoE?.ConsumoPorHora || 0);
        peh.Consumo = consumo;
        if (peh.TipoEnergia === "Gas GLP") {
            const config = await queryRunner.manager.findOne(ConfiguracionEnergia_1.ConfiguracionEnergia, { where: { TipoEnergia: peh.TipoEnergia }, relations: ["Insumo"] });
            peh.Costo = await (0, exports.consumirInsumoFIFO)(queryRunner, config?.Insumo?.IdInsumo, consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
        }
        else {
            peh.Costo = consumo * await calcularCostoUnitarioPromedio(peh.TipoEnergia, IdSucursal);
        }
        await queryRunner.manager.save(peh);
        // 🔥 ACTUALIZAR CABECERA (Acumulamos el costo indirecto en tiempo real)
        const produccion = peh.Produccion;
        produccion.CostoIndirecto = Number(produccion.CostoIndirecto) + Number(peh.Costo);
        await queryRunner.manager.save(produccion);
        const nuevo = new Produccionhornodetalle_1.ProduccionHornoDetalle();
        nuevo.IdProduccionHornoDetalle = await (0, idGenerator_1.generarIdSecuencial)("PEH", queryRunner);
        nuevo.Produccion = peh.Produccion;
        nuevo.Horno = peh.Horno;
        nuevo.TipoEnergia = NuevoTipoEnergia;
        nuevo.Fecha = peh.Produccion.FechaProduccion || fecha;
        nuevo.HoraInicio = f_hora;
        await queryRunner.manager.save(nuevo);
        await queryRunner.commitTransaction();
        return res.json({ message: "Energía cambiada" });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.cambiarCombustibleHorno = cambiarCombustibleHorno;
/**
 * CIERRE FINAL: AJUSTE DE COSTOS REALES
 */
const finalizarProduccionTotal = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, HoraFin } = req.body;
        const f_hora = HoraFin || hora;
        const produccion = await queryRunner.manager.findOne(Produccion_1.Produccion, {
            where: { IdProduccion },
            relations: ["ProduccionEmpleado", "DetalleHorno", "Detalle", "Detalle.Producto", "DetalleHorno.Horno", "Sucursal"]
        });
        if (!produccion)
            throw new Error("No existe la producción");
        const IdSucursal = produccion.Sucursal.IdSucursal;
        produccion.HoraFin = f_hora;
        // 1. Cerrar Empleados
        for (const pe of produccion.ProduccionEmpleado) {
            if (!pe.HoraFin) {
                pe.HoraFin = f_hora;
                const inicio = new Date(`1970-01-01T${pe.HoraInicio}`);
                const fin = new Date(`1970-01-01T${pe.HoraFin}`);
                let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                if (diff < 0)
                    diff += 24;
                pe.Horas = diff;
                pe.CostoTotal = pe.Horas * Number(pe.CostoHora);
                await queryRunner.manager.save(pe);
            }
        }
        // 2. Cerrar Hornos
        let totalEnergiaHornos = 0;
        for (const dh of produccion.DetalleHorno) {
            if (!dh.HoraFin) {
                dh.HoraFin = f_hora;
                const inicio = new Date(`1970-01-01T${dh.HoraInicio}`);
                const fin = new Date(`1970-01-01T${dh.HoraFin}`);
                let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                if (diff < 0)
                    diff += 24;
                dh.Horas = diff;
                const infoE = await queryRunner.manager.findOne(HornoEnergia_1.HornoEnergia, { where: { Horno: { IdHorno: dh.Horno.IdHorno }, TipoEnergia: dh.TipoEnergia } });
                dh.Consumo = dh.Horas * Number(infoE?.ConsumoPorHora || 0);
                // Calculamos el costo de la energía (GLP, Luz o Natural)
                if (dh.TipoEnergia === "Gas GLP") {
                    const config = await queryRunner.manager.findOne(ConfiguracionEnergia_1.ConfiguracionEnergia, { where: { TipoEnergia: dh.TipoEnergia }, relations: ["Insumo"] });
                    dh.Costo = await (0, exports.consumirInsumoFIFO)(queryRunner, config?.Insumo?.IdInsumo, dh.Consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
                }
                else {
                    dh.Costo = dh.Consumo * await calcularCostoUnitarioPromedio(dh.TipoEnergia, IdSucursal);
                }
                await queryRunner.manager.save(dh);
            }
            totalEnergiaHornos += Number(dh.Costo);
        }
        // 3. Totales
        const totalMO = produccion.ProduccionEmpleado.reduce((acc, pe) => acc + Number(pe.CostoTotal), 0);
        const horasMax = Math.max(...produccion.ProduccionEmpleado.map(pe => Number(pe.Horas)), 0.1);
        // El AGUA afecta siempre proporcionalmente al tiempo de producción
        const totalAgua = await calcularGastoProporcional(IdSucursal, "Agua", horasMax);
        produccion.CostoManoObra = totalMO;
        // Costo Indirecto = Energía de Hornos (Luz/Gas/GLP) + Agua
        produccion.CostoIndirecto = totalEnergiaHornos + totalAgua;
        produccion.CostoTotal = Number(produccion.CostoInsumos) + totalMO + produccion.CostoIndirecto;
        await queryRunner.manager.save(produccion);
        //  4. AJUSTE FINAL DE COSTOS EN INVENTARIO
        const totalInsumos = Number(produccion.CostoInsumos) || 1;
        for (const det of produccion.Detalle) {
            // Prorrateamos MO e Indirectos según el peso del costo de insumos de cada producto
            const proporcion = Number(det.CostoTotal) / totalInsumos;
            const asignados = (totalMO * proporcion) + (produccion.CostoIndirecto * proporcion);
            det.CostoTotal = Number(det.CostoTotal) + asignados;
            det.CostoUnitario = det.CostoTotal / Number(det.Cantidad);
            await queryRunner.manager.save(det);
            // Actualizamos los lotes de inventario que creamos durante el día
            await queryRunner.manager.update(Inventario_1.Inventario, { IdReferencia: IdProduccion, Producto: { IdProducto: det.Producto.IdProducto } }, { CostoUnitario: det.CostoUnitario });
        }
        await queryRunner.commitTransaction();
        return res.json({ message: "Producción finalizada y costos ajustados." });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.finalizarProduccionTotal = finalizarProduccionTotal;
/**
 * DESCARTAR PRODUCTOS DAÑADOS (MERMA)
 * Método para dar de baja productos que salieron defectuosos y no son aptos para la venta.
 * Descuenta del inventario y actualiza el detalle de producción.
 */
const descartarProductosDaniados = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { IdProduccion, IdProducto, Cantidad, Motivo } = req.body;
        // 1. Validar que la producción exista
        const produccion = await queryRunner.manager.findOne(Produccion_1.Produccion, {
            where: { IdProduccion },
            relations: ["Sucursal"]
        });
        if (!produccion)
            throw new Error("Producción no encontrada.");
        // 2. Buscar el registro de producción de ese producto (DEBE EXISTIR si ya entró a inventario)
        const detalle = await queryRunner.manager.findOne(Detalleproduccuin_1.DetalleProduccion, {
            where: { Produccion: { IdProduccion }, Producto: { IdProducto } }
        });
        if (!detalle)
            throw new Error("No se puede descartar un producto que no ha sido registrado como producido.");
        // 3. Buscar el lote de inventario asociado
        const lote = await queryRunner.manager.findOne(Inventario_1.Inventario, {
            where: {
                IdReferencia: IdProduccion,
                Producto: { IdProducto },
                Sucursal: { IdSucursal: produccion.Sucursal.IdSucursal },
                Estado: 1
            }
        });
        if (!lote)
            throw new Error("No se encontró stock en inventario para este lote de producción.");
        if (Number(lote.Stock) < Number(Cantidad)) {
            throw new Error(`Stock insuficiente en el lote. Disponible: ${lote.Stock}`);
        }
        // 4. Descontar del inventario
        lote.Stock = Number(lote.Stock) - Number(Cantidad);
        if (lote.Stock <= 0)
            lote.Estado = 0;
        await queryRunner.manager.save(lote);
        // Registrar movimiento de salida
        await (0, Inventario_controllers_1.registrarMovimientoSalida)(queryRunner, lote, 'DESCARTE', Number(Cantidad), IdProduccion);
        // 5. Actualizar el detalle de producción existente
        // Restamos de la cantidad "buena" y sumamos a la "mala"
        detalle.Cantidad = Number(detalle.Cantidad) - Number(Cantidad);
        detalle.CantidadMala = Number(detalle.CantidadMala) + Number(Cantidad);
        detalle.Motivo = Motivo;
        await queryRunner.manager.save(detalle);
        await queryRunner.commitTransaction();
        return res.status(200).json({
            message: "Productos descartados correctamente.",
            cantidadDescartada: Cantidad,
            nuevaCantidadDisponible: detalle.Cantidad
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.descartarProductosDaniados = descartarProductosDaniados;
/**
 * AGREGAR EMPLEADO A UNA PRODUCCIÓN EN CURSO
 */
const agregarEmpleadoProduccion = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { fecha, hora } = (0, Fecha_1.getFechaHoraBolivia)();
        const { IdProduccion, IdEmpleado, HoraInicio } = req.body;
        const produccion = await queryRunner.manager.findOne(Produccion_1.Produccion, {
            where: { IdProduccion },
            relations: ["Sucursal"]
        });
        if (!produccion)
            throw new Error("Producción no encontrada");
        if (produccion.estado === 0)
            throw new Error("La producción está anulada");
        if (produccion.HoraFin)
            throw new Error("La producción ya finalizó");
        // Verificar si ya está en la producción y no ha terminado su turno
        const existente = await queryRunner.manager.findOne(ProduccionEmpleado_1.ProduccionEmpleado, {
            where: { Produccion: { IdProduccion }, Empleado: { IdEmpleado }, HoraFin: (0, typeorm_1.IsNull)() }
        });
        if (existente)
            throw new Error("El empleado ya tiene un turno activo en esta producción");
        const pe = new ProduccionEmpleado_1.ProduccionEmpleado();
        const sueldo = await (0, Empleado_controllers_1.SalarioEmpleado)(IdEmpleado);
        pe.IdProduccionEmpleado = await (0, idGenerator_1.generarIdSecuencial)("PE", queryRunner);
        pe.Produccion = produccion;
        pe.Empleado = await (0, Empleado_controllers_1.verifyEmpleado)(IdEmpleado);
        pe.Sucursal = produccion.Sucursal;
        pe.Fecha = fecha;
        pe.HoraInicio = HoraInicio || hora;
        pe.CostoHora = await calcularCostoHoraEmpleado(sueldo, produccion.Sucursal.IdSucursal);
        pe.CostoTotal = 0;
        pe.Horas = 0;
        await queryRunner.manager.save(pe);
        await queryRunner.commitTransaction();
        return res.json({ message: "Empleado agregado a la producción" });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.agregarEmpleadoProduccion = agregarEmpleadoProduccion;
/**
 * ANULAR PRODUCCIÓN
 */
const anularProduccion = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { id } = req.params;
        const produccion = await queryRunner.manager.findOne(Produccion_1.Produccion, { where: { IdProduccion: id } });
        if (!produccion)
            throw new Error("Producción no encontrada");
        if (produccion.estado === 0)
            throw new Error("La producción ya está anulada");
        // 1. Revertir movimientos de inventario
        const movimientos = await queryRunner.manager.find(MovimientoInventario_1.MovimientoInventario, {
            where: { IdReferencia: id },
            relations: ["Inventario", "Sucursal", "Insumo", "Producto"]
        });
        for (const mov of movimientos) {
            const lote = mov.Inventario;
            if (lote) {
                // Revertimos el stock: si el movimiento fue resta (-), sumamos. Si fue suma (+), restamos.
                lote.Stock = Number(lote.Stock) - Number(mov.Cantidad);
                lote.Estado = lote.Stock > 0 ? 1 : 0;
                await queryRunner.manager.save(lote);
                // Registrar movimiento de anulación
                const reverso = new MovimientoInventario_1.MovimientoInventario();
                reverso.IdMovimiento = await (0, idGenerator_1.generarIdSecuencial)("MOINV", queryRunner);
                reverso.Tipo = "ANULAR_PRODUCCION";
                reverso.Cantidad = -Number(mov.Cantidad);
                reverso.CostoUnitario = Number(mov.CostoUnitario);
                reverso.CostoTotal = -Number(mov.CostoTotal);
                reverso.Fecha = new Date();
                reverso.Sucursal = mov.Sucursal;
                reverso.IdReferencia = id;
                reverso.Inventario = lote;
                if (mov.Insumo)
                    reverso.Insumo = mov.Insumo;
                if (mov.Producto)
                    reverso.Producto = mov.Producto;
                await queryRunner.manager.save(reverso);
            }
        }
        // 2. Marcar producción como anulada
        produccion.estado = 0;
        await queryRunner.manager.save(produccion);
        await queryRunner.commitTransaction();
        return res.json({ message: "Producción anulada y stock revertido" });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.anularProduccion = anularProduccion;
/**
 * APOYO
 */
const consumirInsumoFIFO = async (queryRunner, IdInsumo, Cantidad, IdSucursal, IdReferencia, tipoMovimiento = "SALIDA_PRODUCCION") => {
    let restante = Number(Cantidad);
    let costoTotal = 0;
    if (!IdInsumo)
        return 0;
    // Sincronización: Si es Agua Potable, usamos el costo promedio de las facturas de la Sucursal
    let costoOverride = null;
    if (IdInsumo === "06172026INS-1") {
        const cp = await calcularCostoUnitarioPromedio("Agua", IdSucursal);
        if (cp > 0)
            costoOverride = cp;
    }
    const lotes = await queryRunner.manager.find(Inventario_1.Inventario, {
        where: {
            Insumo: { IdInsumo },
            Sucursal: { IdSucursal },
            Stock: (0, typeorm_1.MoreThan)(0),
            Estado: 1
        },
        order: { FechaIngreso: "ASC" },
        relations: ["Insumo", "Sucursal"]
    });
    if (lotes.length === 0) {
        const cp = costoOverride ?? 0;
        const insumo = await (0, Insumo_controllers_1.verifyInsumo)({ ProductoId: IdInsumo });
        const sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: IdSucursal });
        const mov = new MovimientoInventario_1.MovimientoInventario();
        mov.IdMovimiento = await (0, idGenerator_1.generarIdSecuencial)("MOINV", queryRunner);
        mov.Tipo = tipoMovimiento;
        mov.Cantidad = -restante;
        mov.Fecha = new Date();
        mov.Insumo = insumo;
        mov.Sucursal = sucursal;
        mov.CostoUnitario = cp;
        mov.CostoTotal = restante * cp;
        mov.IdReferencia = IdReferencia;
        await queryRunner.manager.save(mov);
        return mov.CostoTotal;
    }
    for (const lote of lotes) {
        if (restante <= 0)
            break;
        const disponible = Number(lote.Stock);
        const consumo = Math.min(disponible, restante);
        // Usamos el costo override si existe (para el caso del Agua)
        const costoUnitario = costoOverride ?? Number(lote.CostoUnitario);
        const costo = consumo * costoUnitario;
        lote.Stock = disponible - consumo;
        if (lote.Stock <= 0)
            lote.Estado = 0;
        await queryRunner.manager.save(lote);
        const mov = new MovimientoInventario_1.MovimientoInventario();
        mov.IdMovimiento = await (0, idGenerator_1.generarIdSecuencial)("MOINV", queryRunner);
        mov.Tipo = tipoMovimiento;
        mov.Cantidad = -consumo;
        mov.Fecha = new Date();
        mov.Insumo = lote.Insumo;
        mov.Sucursal = lote.Sucursal;
        mov.CostoUnitario = Number(lote.CostoUnitario);
        mov.CostoTotal = costo;
        mov.Inventario = lote;
        mov.IdReferencia = IdReferencia;
        await queryRunner.manager.save(mov);
        costoTotal += costo;
        restante -= consumo;
    }
    return costoTotal;
};
exports.consumirInsumoFIFO = consumirInsumoFIFO;
const calcularGastoProporcional = async (IdSucursal, servicio, horasProduccion) => {
    const periodoActual = new Date().toISOString().slice(0, 7);
    const gasto = await Gastos_1.Gasto.findOne({ where: { Sucursal: { IdSucursal }, Periodo: periodoActual, Servicio: servicio } });
    if (!gasto)
        return 0;
    const horasMes = await calcularHorasMes(IdSucursal);
    return (Number(gasto.Monto) / (horasMes || 1)) * horasProduccion;
};
const calcularCostoHoraEmpleado = async (sueldoMensual, IdSucursal) => {
    const horasMes = await calcularHorasMes(IdSucursal);
    return (horasMes > 0) ? (sueldoMensual / horasMes) : 0;
};
const calcularHorasMes = async (IdSucursal) => {
    const horarios = await Horario_1.Horario.find({ where: { Sucursal: { IdSucursal } } });
    let horasDiaTotal = 0;
    for (const h of horarios) {
        const entrada = new Date(`1970-01-01T${h.HoraEntrada}`);
        const salida = new Date(`1970-01-01T${h.HoraSalida}`);
        let diff = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
        if (diff < 0)
            diff += 24;
        horasDiaTotal += diff;
    }
    const diasOperativos = new Set(horarios.map(h => h.Dia)).size || 1;
    return (horasDiaTotal / diasOperativos) * 30;
};
const calcularCostoUnitarioPromedio = async (TipoServicio, IdSucursal) => {
    let servicio = "";
    if (TipoServicio === "Electricidad")
        servicio = "Luz";
    else if (TipoServicio === "Agua")
        servicio = "Agua";
    else
        servicio = "Gas Natural";
    const facturas = await Gastos_1.Gasto.find({ where: { Servicio: servicio, Sucursal: { IdSucursal } }, order: { Fecha: "DESC" }, take: 3 });
    if (facturas.length === 0)
        return 0;
    let totalMonto = 0, totalConsumo = 0;
    for (const f of facturas) {
        totalMonto += Number(f.Monto);
        totalConsumo += Number(f.Consumo);
    }
    const costoPorUnidad = (totalConsumo > 0) ? (totalMonto / totalConsumo) : (totalMonto / facturas.length);
    // 💧 Conversión especial para Agua y Gas Natural:
    // Agua: de Litros (Gasto) a Mililitros (Producción) -> / 1000
    // Gas Natural: de m³ (Gasto) a Litros (Producción - Horno) -> / 1000
    if (servicio === "Agua" || servicio === "Gas Natural") {
        return costoPorUnidad / 1000;
    }
    return costoPorUnidad;
};
const verifyProduccion = async (idproduccion) => {
    const prod = await Produccion_1.Produccion.findOne({ where: { IdProduccion: idproduccion } });
    if (!prod)
        throw new error_handler_1.HttpError(404, "No existe");
    return prod;
};
exports.verifyProduccion = verifyProduccion;
const getProducciones = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        const { Idsucursal, fecha, search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const result = await queryRunner.query(`
      SELECT 
        p.idproduccion AS "IdProduccion",
        p.fechaproduccion AS "FechaProduccion",
        p.horainicio AS "HoraInicio",
        p.horafin AS "HoraFin",
        p.costototal AS "CostoTotal",
        p.costoinsumos AS "CostoInsumos",
        p.costomanobra AS "CostoManoObra", 
        p.costoindirecto AS "CostoIndirecto",
        p.observacion AS "Observacion",
        p.estado AS "Estado",  
        COUNT(*) OVER() AS total,

        -- Sucursal
        json_build_object(
          'IdSucursal', s.idsucursal,
          'Nombre', s.nombre
        ) AS "Sucursal",

        -- Productos
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdDetalleProduccion', dp.iddetalleproduccion,
              'Cantidad', dp.cantidad,
              'CostoUnitario', dp.costounitario,
              'CostoTotal', dp.costototal,
              'CantidadMala', dp.cantidadmala,
              'Motivo', dp.motivo,
              'Producto', json_build_object(
                'IdProducto', prod.idproducto,
                'Nombre', prod.nombre
              )
            )
          ) FILTER (WHERE dp.iddetalleproduccion IS NOT NULL),
          '[]'
        ) AS "Detalle",

        -- Empleados
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdProduccionEmpleado', pe.idproduccionempleado,
              'HoraInicio', pe.horainicio,
              'HoraFin', pe.horafin,
              'Horas', pe.horas,
              'CostoTotal', pe.costototal,
              'Empleado', json_build_object(
                'IdEmpleado', emp.idempleado,
                'Nombre', pers.nombre || ' ' || pers.apellidopaterno,
                'Imagen', pers.imagen,
                'Cargo', c.nombre
              )
            )
          ) FILTER (WHERE pe.idproduccionempleado IS NOT NULL),
          '[]'
        ) AS "Empleados",

        -- Hornos
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'IdProduccionHornoDetalle', ph.idproduccionhornodetalle,
              'HoraInicio', ph.horainicio,
              'HoraFin', ph.horafin,
              'TipoEnergia', ph.tipoenergia,
              'Consumo', ph.consumo,
              'Costo', ph.costo,
              'Horno', json_build_object(
                'IdHorno', h.idhorno,
                'Nombre', h.nombre
              )
            )
          ) FILTER (WHERE ph.idproduccionhornodetalle IS NOT NULL),
          '[]'
        ) AS "DetalleHorno",

        -- Salidas Detalladas (Quién produjo qué, en qué horno y a qué hora)
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'IdHornoProducto', hp.idhornoproducto,
                'Cantidad', hp.cantidad,
                'Hora', hp.hora,
                'Producto', prod2.nombre,
                'Empleado', pers2.nombre || ' ' || pers2.apellidopaterno,
                'Horno', h2.nombre
              )
            )
            FROM hornoproducto hp
            INNER JOIN produccion_horno_detalle ph2 ON ph2.idproduccionhornodetalle = hp.idproduccionhornodetalle
            INNER JOIN producto prod2 ON prod2.idproducto = hp.idproducto
            INNER JOIN empleado emp2 ON emp2.idempleado = hp.idempleado
            INNER JOIN persona pers2 ON pers2.idpersona = emp2.idpersona
            INNER JOIN horno h2 ON h2.idhorno = ph2.idhorno
            WHERE ph2.idproduccion = p.idproduccion
          ),
          '[]'
        ) AS "SalidasDetalladas"

      FROM produccion p

      INNER JOIN sucursal s
        ON s.idsucursal = p.idsucursal

      LEFT JOIN detalle_produccion dp
        ON dp.idproduccion = p.idproduccion

      LEFT JOIN producto prod
        ON prod.idproducto = dp.idproducto

      LEFT JOIN produccion_empleado pe
        ON pe.idproduccion = p.idproduccion

      LEFT JOIN empleado emp
        ON emp.idempleado = pe.idempleado

      LEFT JOIN persona pers
        ON pers.idpersona = emp.idpersona

      LEFT JOIN (
          SELECT idempleado, idcargo
          FROM (
              SELECT
                idempleado,
                idcargo,
                ROW_NUMBER() OVER (
                  PARTITION BY idempleado
                  ORDER BY CASE
                    WHEN idcargo = 'CAR-001' THEN 1
                    ELSE 2
                  END
                ) AS rn
              FROM empleado_cargo
              WHERE estado = 1
              AND idcargo IN ('CAR-001', 'CAR-004')
          ) sub
          WHERE rn = 1
      ) ec
        ON ec.idempleado = emp.idempleado

      LEFT JOIN cargo c
        ON c.idcargo = ec.idcargo

      LEFT JOIN produccion_horno_detalle ph
        ON ph.idproduccion = p.idproduccion

      LEFT JOIN horno h
        ON h.idhorno = ph.idhorno

      WHERE
        ($1::text IS NULL OR s.idsucursal = $1)

        AND (
          $2::date IS NULL
          OR p.fechaproduccion = $2
        )

        AND (
          $3::text IS NULL
          OR EXISTS (
            SELECT 1
            FROM detalle_produccion dp2
            INNER JOIN producto p2
              ON p2.idproducto = dp2.idproducto
            WHERE dp2.idproduccion = p.idproduccion
              AND LOWER(p2.nombre) LIKE LOWER('%' || $3 || '%')
          )
        )

      GROUP BY
        p.idproduccion,
        s.idsucursal

      ORDER BY
        p.fechaproduccion DESC,
        p.horainicio DESC

      LIMIT $4 OFFSET $5
    `, [
            Idsucursal || null,
            fecha || null,
            search || null,
            Number(limit),
            offset
        ]);
        if (result.length === 0) {
            return res.json({
                total: 0,
                page: Number(page),
                limit: Number(limit),
                totalPages: 0,
                data: []
            });
        }
        return res.json({
            total: Number(result[0].total),
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(Number(result[0].total) / Number(limit)),
            data: result.map(({ total, ...rest }) => rest)
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
    finally {
        await queryRunner.release();
    }
};
exports.getProducciones = getProducciones;
const getInsumosSucursal = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        const { id } = req.params;
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const stock = await queryRunner.query(`
      SELECT 
        i.idinsumo AS "IdInsumo",
        i.nombre AS "Nombre",
        i.imagen AS "Imagen",

        SUM(inv.stock) AS "StockGramos",
        SUM(inv.cantidad) AS "CantidadOriginal",

        COUNT(*) OVER() AS total,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'UnidadNombre', um.nombre,
              'ContenidoUnidad', um.cantidad,
              'Abreviatura', um.abreviatura
            )
          ) FILTER (WHERE um.idunidadmedida IS NOT NULL),
          '[]'
        ) AS "Unidades"

      FROM inventario inv

      INNER JOIN insumo i 
        ON i.idinsumo = inv.idinsumo

      LEFT JOIN unidadmedida um 
        ON um.idunidadmedida = inv.idunidadmedida

      WHERE 
        inv.idsucursal = $1 
        AND inv.estado = 1

        AND (
          $2::text IS NULL
          OR LOWER(i.nombre) LIKE LOWER('%' || $2 || '%')
        )

      GROUP BY 
        i.idinsumo, 
        i.nombre, 
        i.imagen

      ORDER BY i.nombre ASC

      LIMIT $3 OFFSET $4
    `, [
            id,
            search || null,
            Number(limit),
            offset
        ]);
        if (stock.length === 0) {
            return res.json({
                total: 0,
                page: Number(page),
                limit: Number(limit),
                totalPages: 0,
                data: []
            });
        }
        return res.json({
            total: Number(stock[0].total),
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(Number(stock[0].total) / Number(limit)),
            data: stock.map(({ total, ...rest }) => rest)
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
    finally {
        await queryRunner.release();
    }
};
exports.getInsumosSucursal = getInsumosSucursal;
/**
 * REGISTRAR PRODUCTOS DEFECTUOSOS (MERMA)
 */
const registrarMermaProduccion = async (req, res) => {
    const queryRunner = db_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { IdProduccion, IdProducto, CantidadMala, Motivo } = req.body;
        // 1. Buscar el detalle de producción
        const detalle = await queryRunner.manager.findOne(Detalleproduccuin_1.DetalleProduccion, {
            where: { Produccion: { IdProduccion }, Producto: { IdProducto } }
        });
        if (!detalle)
            throw new Error("No se encontró el registro de este producto en la producción especificada.");
        // 2. Buscar el lote en inventario asociado a esta producción
        const lote = await queryRunner.manager.findOne(Inventario_1.Inventario, {
            where: { IdReferencia: IdProduccion, Producto: { IdProducto: IdProducto }, Estado: 1 }
        });
        if (!lote)
            throw new Error("No se encontró stock en inventario para esta producción.");
        if (Number(lote.Stock) < Number(CantidadMala)) {
            throw new Error(`Stock insuficiente en el lote para registrar la merma. Disponible: ${lote.Stock}`);
        }
        // 3. Descontar del inventario
        lote.Stock = Number(lote.Stock) - Number(CantidadMala);
        if (lote.Stock <= 0)
            lote.Estado = 0;
        await queryRunner.manager.save(lote);
        // 4. Registrar movimiento de salida por merma
        await (0, Inventario_controllers_1.registrarMovimientoSalida)(queryRunner, lote, "MERMA_PRODUCCION", Number(CantidadMala), IdProduccion);
        // 5. Actualizar registro en detalle de producción (para reportes)
        detalle.CantidadMala = Number(detalle.CantidadMala) + Number(CantidadMala);
        // Nota: La cantidad original se mantiene, pero ahora sabemos cuántos fueron mermas
        await queryRunner.manager.save(detalle);
        await queryRunner.commitTransaction();
        return res.status(200).json({ message: "Merma registrada correctamente y stock actualizado." });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.registrarMermaProduccion = registrarMermaProduccion;
