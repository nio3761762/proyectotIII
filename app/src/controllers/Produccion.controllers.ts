import { Request, Response } from "express";
import { IsNull, MoreThan, QueryRunner } from "typeorm";
import { Produccion } from "../entities/Produccion";
import { generarIdSecuencial } from "../utils/idGenerator";
import { MovimientoInventario } from "../entities/MovimientoInventario";
import { Inventario } from "../entities/Inventario";
import { ProduccionEmpleado } from "../entities/ProduccionEmpleado";
import { SalarioEmpleado, verifyEmpleado } from "./Empleado.controllers";
import { verifySucursal } from "./Sucursal.controllers";
import { verifyInsumo } from "./Insumo.controllers";
import { HttpError } from "../utils/error.handler";
import { getFechaHoraBolivia } from "../utils/Fecha";
import { HornoEnergia } from "../entities/HornoEnergia";
import { Receta } from "../entities/Receta";
import { ConfiguracionEnergia } from "../entities/ConfiguracionEnergia";
import { Gasto } from "../entities/Gastos";
import { Horario } from "../entities/Horario";
import { DetalleProduccion } from "../entities/Detalleproduccuin";
import { verifyProducto } from "./Producto.controllers";
import { verifyProductoMedida } from "./ProductoMedida.controllers";
import { createLoteInventario, registrarMovimientoEntrada, registrarMovimientoSalida } from "./Inventario.controllers";
import { ProduccionHornoDetalle } from "../entities/Produccionhornodetalle";
import { verifyHorno } from "./Horno.controllers";
import { BajaProducto } from "../entities/BajaProducto";
import { AppDataSource } from "../db";

/**
 * ============================================================================
 * CONTROL DE PRODUCCIÓN: SALIDA INSTANTÁNEA PARA VENTA
 * ============================================================================
 */

/**
 *  PASO 1: INICIAR PRODUCCIÓN
 */
export const iniciarProduccion = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { fecha, hora } = getFechaHoraBolivia();
    const { Idsucursal, IdEmpleados, Observacion, HoraInicio, HoraFin, FechaRegistro } = req.body;
    const h_inicio = HoraInicio || hora;
    const h_fin = HoraFin || null;
    
    const produccion = new Produccion();
    produccion.IdProduccion = await generarIdSecuencial('PROD', queryRunner);
    produccion.Sucursal = await verifySucursal({ SucursalId: Idsucursal });
    produccion.FechaProduccion = FechaRegistro || fecha;
    produccion.HoraInicio = h_inicio;
    produccion.HoraFin = h_fin;
    if(Observacion) produccion.Observacion = Observacion;
    
    // Inicializar costos
    produccion.CostoManoObra = 0;
    produccion.CostoTotal = 0;
    
    await queryRunner.manager.save(produccion);

    let totalMO = 0;

    for (const idEmp of IdEmpleados) {
      const pe = new ProduccionEmpleado();
      const sueldo = await SalarioEmpleado(idEmp);
      pe.IdProduccionEmpleado = await generarIdSecuencial("PE", queryRunner);
      pe.Produccion = produccion;
      pe.Empleado = await verifyEmpleado(idEmp);
      pe.Sucursal = produccion.Sucursal;
      pe.Fecha = fecha;
      pe.HoraInicio = h_inicio;
      pe.CostoHora = await calcularCostoHoraEmpleado(sueldo, Idsucursal);
      
      if (h_fin) {
        pe.HoraFin = h_fin;
        const inicio = new Date(`1970-01-01T${pe.HoraInicio}`);
        const fin = new Date(`1970-01-01T${pe.HoraFin}`);
        let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24;
        pe.Horas = diff;
        pe.CostoTotal = pe.Horas * Number(pe.CostoHora);
        totalMO += Number(pe.CostoTotal);
      } else {
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
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 *  FINALIZAR TURNO EMPLEADO
 */
export const finalizarTurnoEmpleado = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { hora } = getFechaHoraBolivia();
    const { IdProduccion, IdEmpleado, HoraFin } = req.body;
    const pe = await queryRunner.manager.findOne(ProduccionEmpleado, {
      where: { Produccion: { IdProduccion }, Empleado: { IdEmpleado }, HoraFin: IsNull() }
    });
    if (!pe) throw new Error("No hay turno activo");
    const h_fin = HoraFin || hora;
    pe.HoraFin = h_fin;
    const inicio = new Date(`1970-01-01T${pe.HoraInicio}`);
    const fin = new Date(`1970-01-01T${pe.HoraFin}`);
    let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24; // Manejo de cruce de medianoche
    pe.Horas = diff;
    pe.CostoTotal = pe.Horas * Number(pe.CostoHora);
    await queryRunner.manager.save(pe);
    await queryRunner.commitTransaction();
    return res.json({ message: "Empleado finalizó" });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/** QueryRunner o transaction
 *  PASO 2: ENCENDER EL HORNO
 */
export const encenderHorno = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { fecha, hora } = getFechaHoraBolivia();
    const { IdProduccion, IdHorno, TipoEnergia, HoraInicio } = req.body;
    const peh = new ProduccionHornoDetalle();
    peh.IdProduccionHornoDetalle = await generarIdSecuencial("PEH", queryRunner);
    peh.Produccion = await verifyProduccion(IdProduccion);
    peh.Horno = await verifyHorno(IdHorno);
    peh.TipoEnergia = TipoEnergia;
    peh.Fecha =peh.Produccion.FechaProduccion || fecha;
    peh.HoraInicio = HoraInicio || hora;
    await queryRunner.manager.save(peh);
    await queryRunner.commitTransaction();
    return res.json({ message: "Horno encendido", IdProduccionHornoDetalle: peh.IdProduccionHornoDetalle });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 *  PASO 2.5: APAGAR EL HORNO
 *  Cierra la sesión activa del horno y calcula el consumo y costo.
 */
export const apagarHorno = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { hora } = getFechaHoraBolivia();
    const { IdProduccion, IdHorno, HoraFin } = req.body;

    const peh = await queryRunner.manager.findOne(ProduccionHornoDetalle, { 
      where: { Produccion: { IdProduccion }, Horno: { IdHorno }, HoraFin: IsNull() },
      relations: ["Produccion", "Produccion.Sucursal", "Horno"] 
    });

    if (!peh) throw new Error("No se encontró una sesión activa para este horno.");
    
    const IdSucursal = peh.Produccion.Sucursal.IdSucursal;
    const f_hora = HoraFin || hora;
    peh.HoraFin = f_hora;

    // Calcular horas transcurridas
    const inicio = new Date(`1970-01-01T${peh.HoraInicio}`);
    const fin = new Date(`1970-01-01T${peh.HoraFin}`);
    let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24; // Cruce de medianoche
    peh.Horas = diff;

    // Obtener información de consumo del horno para el tipo de energía usado
    const infoE = await queryRunner.manager.findOne(HornoEnergia, { 
      where: { Horno: { IdHorno: peh.Horno.IdHorno }, TipoEnergia: peh.TipoEnergia } 
    });
    
    const consumo = peh.Horas * Number(infoE?.ConsumoPorHora || 0);
    peh.Consumo = consumo;

    // Calcular costo según tipo de energía
    if (peh.TipoEnergia === "Gas GLP") {
        const config = await queryRunner.manager.findOne(ConfiguracionEnergia, { where: { TipoEnergia: peh.TipoEnergia }, relations: ["Insumo"] });
        peh.Costo = await consumirInsumoFIFO(queryRunner, config?.Insumo?.IdInsumo, consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
    } else {
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
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 *  PASO 3: REGISTRAR SALIDA Y VENTA AL INSTANTE
 */
export const registrarSalidaProducto = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { hora } = getFechaHoraBolivia();
    const { IdProduccion, IdProducto, IdProductoMedida, IdEmpleado, Cantidad, CantidadPresentacion, HoraRegistro } = req.body;
    const produccion = await queryRunner.manager.findOne(Produccion, { where: { IdProduccion }, relations: ["Sucursal"] });
    if (!produccion) throw new Error("Producción no encontrada");
    const IdSucursal = produccion.Sucursal.IdSucursal;
    const empleado = await verifyEmpleado(IdEmpleado);

    // 🔥 RESOLVER PRESENTACIÓN Y CANTIDADES
    let cantidadUnidades = Number(Cantidad);
    let cantidadPresentacion = Number(CantidadPresentacion || 0);
    let productoMedida: any = null;
    if (IdProductoMedida) {
      productoMedida = await verifyProductoMedida({ PaqueteId: IdProductoMedida });
      const unidadesPorPresentacion = Number(productoMedida.Cantidad) || 1;
      if (cantidadPresentacion > 0) {
        cantidadUnidades = cantidadPresentacion * unidadesPorPresentacion;
      }
    }
    const CantidadParaCostos = cantidadUnidades > 0 ? cantidadUnidades : Number(Cantidad);

    // 1. Descontar Insumos (FIFO)
    const receta = await queryRunner.manager.findOne(Receta, { where: { Producto: { IdProducto } }, relations: ["Ingredientes", "Ingredientes.Insumo"] });
    let costoInsumosNuevos = 0;
    if (receta) {
      const factor = CantidadParaCostos / Number(receta.Rendimiento);
      for (const ing of receta.Ingredientes) {
        costoInsumosNuevos += await consumirInsumoFIFO(queryRunner, ing.Insumo.IdInsumo, Number(ing.Pesoconvertido) * factor, IdSucursal, IdProduccion);
      }
    }

    // 3. Detalle Producción (Acumulado para el cierre)
    let detalle = await queryRunner.manager.findOne(DetalleProduccion, {
      where: { Produccion: { IdProduccion }, Producto: { IdProducto }, Empleado: { IdEmpleado }, ...(productoMedida ? { ProductoMedida: { IdProductoMedida: productoMedida.IdProductoMedida } } : {}) }
    });
    if (detalle) {
      detalle.Cantidad = Number(detalle.Cantidad) + CantidadParaCostos;
      detalle.CantidadPresentacion = Number(detalle.CantidadPresentacion || 0) + cantidadPresentacion;
      detalle.CantidadUnidades = Number(detalle.CantidadUnidades || 0) + cantidadUnidades;
      detalle.CostoTotal = Number(detalle.CostoTotal) + costoInsumosNuevos;
      detalle.CostoUnitario = Number(detalle.CostoTotal) / Number(detalle.Cantidad);  
    } else {
      detalle = new DetalleProduccion();
      detalle.IdDetalleProduccion = await generarIdSecuencial("DTPRO", queryRunner);
      detalle.Produccion = produccion;
      detalle.Producto = await verifyProducto({ ProductoId: IdProducto });
      if (productoMedida) detalle.ProductoMedida = productoMedida;
      detalle.Empleado = empleado;
      detalle.Cantidad = CantidadParaCostos;
      detalle.CantidadPresentacion = cantidadPresentacion;
      detalle.CantidadUnidades = cantidadUnidades;
      detalle.CostoTotal = costoInsumosNuevos;
      detalle.CostoUnitario = CantidadParaCostos > 0 ? costoInsumosNuevos / CantidadParaCostos : 0;
    }
    
    await queryRunner.manager.save(detalle);

    // 4. ACTUALIZAR CABECERA
    produccion.CostoInsumos = Number(produccion.CostoInsumos) + costoInsumosNuevos;
    await queryRunner.manager.save(produccion);

    // 🚀 5. ENTRADA AL INVENTARIO (AL INSTANTE PARA VENTA)
    await createLoteInventario(queryRunner, IdProducto, null, cantidadUnidades, detalle.CostoUnitario, IdSucursal, 'ENTRADA_PRODUCCION', IdProduccion, detalle.CostoUnitario, undefined);
    
    await queryRunner.commitTransaction();
    return res.status(200).json({ message: "Salida registrada. Producto disponible para venta." });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 *  CAMBIO DE COMBUSTIBLE
 */
export const cambiarCombustibleHorno = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { hora, fecha } = getFechaHoraBolivia();
    const { IdProduccion, IdHorno, NuevoTipoEnergia, HoraFin } = req.body;
    const peh = await queryRunner.manager.findOne(ProduccionHornoDetalle, { 
      where: { Produccion: { IdProduccion }, Horno: { IdHorno }, HoraFin: IsNull() },
      relations: ["Produccion", "Produccion.Sucursal", "Horno"] 
    });
    if (!peh) throw new Error("Sin sesión activa");
    
    const IdSucursal = peh.Produccion.Sucursal.IdSucursal;
    const f_hora = HoraFin || hora;
    peh.HoraFin = f_hora;
    const inicio = new Date(`1970-01-01T${peh.HoraInicio}`);
    const fin = new Date(`1970-01-01T${peh.HoraFin}`);
    let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    peh.Horas = diff;
    const infoE = await queryRunner.manager.findOne(HornoEnergia, { where: { Horno: { IdHorno: peh.Horno.IdHorno }, TipoEnergia: peh.TipoEnergia } });
    const consumo = peh.Horas * Number(infoE?.ConsumoPorHora || 0);
    peh.Consumo = consumo;

    if (peh.TipoEnergia === "Gas GLP") {
        const config = await queryRunner.manager.findOne(ConfiguracionEnergia, { where: { TipoEnergia: peh.TipoEnergia }, relations: ["Insumo"] });
        peh.Costo = await consumirInsumoFIFO(queryRunner, config?.Insumo?.IdInsumo, consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
    } else {
        peh.Costo = consumo * await calcularCostoUnitarioPromedio(peh.TipoEnergia, IdSucursal);
    }
    await queryRunner.manager.save(peh);

    // 🔥 ACTUALIZAR CABECERA (Acumulamos el costo indirecto en tiempo real)
    const produccion = peh.Produccion;
    produccion.CostoIndirecto = Number(produccion.CostoIndirecto) + Number(peh.Costo);
    await queryRunner.manager.save(produccion);

    const nuevo = new ProduccionHornoDetalle();
    nuevo.IdProduccionHornoDetalle = await generarIdSecuencial("PEH", queryRunner);
    nuevo.Produccion = peh.Produccion;
    nuevo.Horno = peh.Horno;
    nuevo.TipoEnergia = NuevoTipoEnergia;
    nuevo.Fecha = peh.Produccion.FechaProduccion || fecha;
    nuevo.HoraInicio = f_hora;
    await queryRunner.manager.save(nuevo);
    await queryRunner.commitTransaction();
    return res.json({ message: "Energía cambiada" });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * CIERRE FINAL: AJUSTE DE COSTOS REALES
 */
export const finalizarProduccionTotal = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { hora } = getFechaHoraBolivia();
    const { IdProduccion, HoraFin } = req.body;
    const f_hora = HoraFin || hora;
    const produccion = await queryRunner.manager.findOne(Produccion, {
      where: { IdProduccion }, 
      relations: ["ProduccionEmpleado", "DetalleHorno", "Detalle", "Detalle.Producto", "DetalleHorno.Horno", "Sucursal"]
    });
    if (!produccion) throw new Error("No existe la producción");

    const IdSucursal = produccion.Sucursal.IdSucursal;
    produccion.HoraFin = f_hora;
    
    // 1. Cerrar Empleados
    for (const pe of produccion.ProduccionEmpleado) {
      if (!pe.HoraFin) {
        pe.HoraFin = f_hora;
        const inicio = new Date(`1970-01-01T${pe.HoraInicio}`);
        const fin = new Date(`1970-01-01T${pe.HoraFin}`);
        let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24;
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
        if (diff < 0) diff += 24;
        dh.Horas = diff;
        const infoE = await queryRunner.manager.findOne(HornoEnergia, { where: { Horno: { IdHorno: dh.Horno.IdHorno }, TipoEnergia: dh.TipoEnergia } });
        dh.Consumo = dh.Horas * Number(infoE?.ConsumoPorHora || 0);
        
        // Calculamos el costo de la energía (GLP, Luz o Natural)
        if (dh.TipoEnergia === "Gas GLP") {
          const config = await queryRunner.manager.findOne(ConfiguracionEnergia, { where: { TipoEnergia: dh.TipoEnergia }, relations: ["Insumo"] });
          dh.Costo = await consumirInsumoFIFO(queryRunner, config?.Insumo?.IdInsumo, dh.Consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
        } else {
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
      await queryRunner.manager.update(Inventario,
        { IdReferencia: IdProduccion, Producto: { IdProducto: det.Producto.IdProducto } },
        { CostoUnitario: det.CostoUnitario }
      ); 
    }
    await queryRunner.commitTransaction();
    return res.json({ message: "Producción finalizada y costos ajustados." });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * DESCARTAR PRODUCTOS DAÑADOS (MERMA)
 * Método para dar de baja productos que salieron defectuosos y no son aptos para la venta.
 * Descuenta del inventario y actualiza el detalle de producción.
 */
export const descartarProductosDaniados = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { IdProduccion, IdProducto, Cantidad, Motivo } = req.body;

    // 1. Validar que la producción exista
    const produccion = await queryRunner.manager.findOne(Produccion, { 
      where: { IdProduccion },
      relations: ["Sucursal"]
    });
    if (!produccion) throw new Error("Producción no encontrada.");

    // 2. Buscar el registro de producción de ese producto (DEBE EXISTIR si ya entró a inventario)
    const detalle = await queryRunner.manager.findOne(DetalleProduccion, {
      where: { Produccion: { IdProduccion }, Producto: { IdProducto } }
    });
    if (!detalle) throw new Error("No se puede descartar un producto que no ha sido registrado como producido.");

    // 3. Buscar el lote de inventario asociado
    const lote = await queryRunner.manager.findOne(Inventario, {
      where: { 
        IdReferencia: IdProduccion, 
        Producto: { IdProducto }, 
        Sucursal: { IdSucursal: produccion.Sucursal.IdSucursal },
        Estado: 1 
      }
    });

    if (!lote) throw new Error("No se encontró stock en inventario para este lote de producción.");
    if (Number(lote.Stock) < Number(Cantidad)) {
      throw new Error(`Stock insuficiente en el lote. Disponible: ${lote.Stock}`);
    }

    // 4. Descontar del inventario
    lote.Stock = Number(lote.Stock) - Number(Cantidad);
    if (lote.Stock <= 0) lote.Estado = 0;
    await queryRunner.manager.save(lote);

    // Registrar movimiento de salida
    await registrarMovimientoSalida(queryRunner, lote, 'DESCARTE', Number(Cantidad), IdProduccion);

    // 5. Actualizar el detalle de producción existente
    // La cantidad producida se mantiene; solo acumulamos la merma
    detalle.CantidadMala = Number(detalle.CantidadMala) + Number(Cantidad);
    detalle.Motivo = Motivo;
    await queryRunner.manager.save(detalle);

    await queryRunner.commitTransaction();
    return res.status(200).json({ 
      message: "Productos descartados correctamente.",
      cantidadDescartada: Cantidad,
      nuevaCantidadDisponible: detalle.Cantidad
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * AGREGAR EMPLEADO A UNA PRODUCCIÓN EN CURSO
 */
export const agregarEmpleadoProduccion = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { fecha, hora } = getFechaHoraBolivia();
    const { IdProduccion, IdEmpleado, HoraInicio } = req.body;
    const produccion = await queryRunner.manager.findOne(Produccion, { 
        where: { IdProduccion },
        relations: ["Sucursal"]
    });
    if (!produccion) throw new Error("Producción no encontrada");
    if (produccion.estado === 0) throw new Error("La producción está anulada");
    if (produccion.HoraFin) throw new Error("La producción ya finalizó");

    // Verificar si ya está en la producción y no ha terminado su turno
    const existente = await queryRunner.manager.findOne(ProduccionEmpleado, {
        where: { Produccion: { IdProduccion }, Empleado: { IdEmpleado }, HoraFin: IsNull() }
    });
    if (existente) throw new Error("El empleado ya tiene un turno activo en esta producción");

    const pe = new ProduccionEmpleado();
    const sueldo = await SalarioEmpleado(IdEmpleado);
    pe.IdProduccionEmpleado = await generarIdSecuencial("PE", queryRunner);
    pe.Produccion = produccion;
    pe.Empleado = await verifyEmpleado(IdEmpleado);
    pe.Sucursal = produccion.Sucursal;
    pe.Fecha = fecha;
    pe.HoraInicio = HoraInicio || hora;
    pe.CostoHora = await calcularCostoHoraEmpleado(sueldo, produccion.Sucursal.IdSucursal);
    pe.CostoTotal = 0;
    pe.Horas = 0;
    
    await queryRunner.manager.save(pe);
    await queryRunner.commitTransaction();
    return res.json({ message: "Empleado agregado a la producción" });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * ANULAR PRODUCCIÓN
 */
export const anularProduccion = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { id } = req.params;
    const produccion = await queryRunner.manager.findOne(Produccion, { where: { IdProduccion:id } });
    if (!produccion) throw new Error("Producción no encontrada");
    if (produccion.estado === 0) throw new Error("La producción ya está anulada");

    // 1. Revertir movimientos de inventario
    const movimientos = await queryRunner.manager.find(MovimientoInventario, {
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
        const reverso = new MovimientoInventario();
        reverso.IdMovimiento = await generarIdSecuencial("MOINV", queryRunner);
        reverso.Tipo = "ANULAR_PRODUCCION";
        reverso.Cantidad = -Number(mov.Cantidad);
        reverso.CostoUnitario = Number(mov.CostoUnitario);
        reverso.CostoTotal = -Number(mov.CostoTotal);
        reverso.Fecha = new Date();
        reverso.Sucursal = mov.Sucursal;
        reverso.IdReferencia = id;
        reverso.Inventario = lote;
        if (mov.Insumo) reverso.Insumo = mov.Insumo;
        if (mov.Producto) reverso.Producto = mov.Producto;

        await queryRunner.manager.save(reverso);
      }
    }

    // 2. Marcar producción como anulada
    produccion.estado = 0;
    await queryRunner.manager.save(produccion);

    await queryRunner.commitTransaction();
    return res.json({ message: "Producción anulada y stock revertido" });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * REGISTRO MASIVO DE SALIDAS DE PRODUCTO
 */
export const registrarSalidaProductoMasiva = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { IdProduccion, Salidas } = req.body;
    if (!Array.isArray(Salidas) || Salidas.length === 0) {
      throw new Error("Debe enviar al menos una salida");
    }

    const produccion = await queryRunner.manager.findOne(Produccion, { where: { IdProduccion }, relations: ["Sucursal"] });
    if (!produccion) throw new Error("Producción no encontrada");
    if (produccion.estado === 0) throw new Error("La producción está anulada");
    const IdSucursal = produccion.Sucursal.IdSucursal;

    let totalCostoInsumos = 0;
    const resultados: any[] = [];

    for (const salida of Salidas) {
      const { IdProducto, IdProductoMedida, IdEmpleado, Cantidad, CantidadPresentacion, HoraRegistro } = salida;
      if (!IdProducto || !Cantidad) {
        throw new Error("Cada salida debe tener IdProducto y Cantidad");
      }

      const empleado = IdEmpleado ? await verifyEmpleado(IdEmpleado) : null;

      // 🔥 RESOLVER PRESENTACIÓN Y CANTIDADES
      // CantidadUnidades = CantidadPresentacion (presentaciones) × cantidad de la presentación (unidades por presentación)
      let cantidadUnidades = Number(Cantidad);
      let cantidadPresentacion = Number(CantidadPresentacion || 0);
      let productoMedida: any = null;

      if (IdProductoMedida) {
        productoMedida = await verifyProductoMedida({ PaqueteId: IdProductoMedida });
        const unidadesPorPresentacion = Number(productoMedida.Cantidad) || 1;
        // Si se envió cantidad de presentaciones, el total de unidades es presentaciones × unidades por presentación
        if (cantidadPresentacion > 0) {
          cantidadUnidades = cantidadPresentacion * unidadesPorPresentacion;
        }
      }
      const CantidadParaCostos = cantidadUnidades > 0 ? cantidadUnidades : Number(Cantidad);

      // 1. Descontar Insumos (FIFO)
      const receta = await queryRunner.manager.findOne(Receta, { where: { Producto: { IdProducto } }, relations: ["Ingredientes", "Ingredientes.Insumo"] });
      let costoInsumosNuevos = 0;
      if (receta) {
        const factor = CantidadParaCostos / Number(receta.Rendimiento);
        for (const ing of receta.Ingredientes) {
          costoInsumosNuevos += await consumirInsumoFIFO(queryRunner, ing.Insumo.IdInsumo, Number(ing.Pesoconvertido) * factor, IdSucursal, IdProduccion);
        }
      }

      // 3. Detalle Producción (Acumulado)
      let detalle = await queryRunner.manager.findOne(DetalleProduccion, {
        where: { Produccion: { IdProduccion }, Producto: { IdProducto }, ...(empleado ? { Empleado: { IdEmpleado } } : {}), ...(productoMedida ? { ProductoMedida: { IdProductoMedida: productoMedida.IdProductoMedida } } : {}) }
      });
      if (detalle) {
        detalle.Cantidad = Number(detalle.Cantidad) + CantidadParaCostos;
        detalle.CantidadPresentacion = Number(detalle.CantidadPresentacion || 0) + cantidadPresentacion;
        detalle.CantidadUnidades = Number(detalle.CantidadUnidades || 0) + cantidadUnidades;
        detalle.CostoTotal = Number(detalle.CostoTotal) + costoInsumosNuevos;
        detalle.CostoUnitario = Number(detalle.CostoTotal) / Number(detalle.Cantidad);
      } else {
        detalle = new DetalleProduccion();
        detalle.IdDetalleProduccion = await generarIdSecuencial("DTPRO", queryRunner);
        detalle.Produccion = produccion;
        detalle.Producto = await verifyProducto({ ProductoId: IdProducto });
        if (productoMedida) detalle.ProductoMedida = productoMedida;
        if (empleado) detalle.Empleado = empleado;
        detalle.Cantidad = CantidadParaCostos;
        detalle.CantidadPresentacion = cantidadPresentacion;
        detalle.CantidadUnidades = cantidadUnidades;
        detalle.CostoTotal = costoInsumosNuevos;
        detalle.CostoUnitario = CantidadParaCostos > 0 ? costoInsumosNuevos / CantidadParaCostos : 0;
      }
      await queryRunner.manager.save(detalle);

      totalCostoInsumos += costoInsumosNuevos;

      // 4. Entrada al inventario (en unidades totales producidas)
      await createLoteInventario(queryRunner, IdProducto, null, cantidadUnidades, detalle.CostoUnitario, IdSucursal, 'ENTRADA_PRODUCCION', IdProduccion, detalle.CostoUnitario, undefined);

      resultados.push({ IdProducto, Cantidad: cantidadUnidades });
    }

    // 5. Actualizar cabecera
    produccion.CostoInsumos = Number(produccion.CostoInsumos) + totalCostoInsumos;
    await queryRunner.manager.save(produccion);

    // 6. Si la producción ya estaba finalizada, recalculamos costos
    if (produccion.HoraFin) {
      await recalcularCostosProduccion(queryRunner, IdProduccion);
    }

    await queryRunner.commitTransaction();
    return res.status(200).json({
      message: `${resultados.length} salida(s) registrada(s) correctamente`,
      salidas: resultados
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * ACTUALIZAR PRODUCCIÓN (editar observacion, fechas y cantidades)
 */
export const actualizarProduccion = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { id } = req.params;
    const { Observacion, FechaProduccion, HoraInicio, HoraFin, Productos } = req.body;

    const produccion = await queryRunner.manager.findOne(Produccion, {
      where: { IdProduccion: id },
      relations: ["Sucursal"]
    });
    if (!produccion) throw new Error("Producción no encontrada");
    if (produccion.estado === 0) throw new Error("No se puede editar una producción anulada");

    const IdSucursal = produccion.Sucursal.IdSucursal;

    // Actualizar campos básicos
    if (Observacion !== undefined) produccion.Observacion = Observacion;
    if (FechaProduccion !== undefined) produccion.FechaProduccion = FechaProduccion;
    if (HoraInicio !== undefined) produccion.HoraInicio = HoraInicio;
    if (HoraFin !== undefined) produccion.HoraFin = HoraFin;
    await queryRunner.manager.save(produccion);

    // Actualizar productos si se enviaron
    if (Array.isArray(Productos) && Productos.length > 0) {
      let totalCostoInsumosDelta = 0;

      for (const prod of Productos) {
        const { IdProducto, IdProductoMedida, Cantidad, CantidadPresentacion, IdEmpleado, HoraRegistro } = prod;
        if (!IdProducto || Cantidad === undefined) continue;

        // 🔥 RESOLVER PRESENTACIÓN Y CANTIDADES
        let cantidadUnidades = Number(Cantidad);
        let cantidadPresentacion = Number(CantidadPresentacion || 0);
        let productoMedida: any = null;
        if (IdProductoMedida) {
          productoMedida = await verifyProductoMedida({ PaqueteId: IdProductoMedida });
          const unidadesPorPresentacion = Number(productoMedida.Cantidad) || 1;
          if (cantidadPresentacion > 0) {
            cantidadUnidades = cantidadPresentacion * unidadesPorPresentacion;
          }
        }
        const CantidadParaCostos = cantidadUnidades > 0 ? cantidadUnidades : Number(Cantidad);

        // Buscar detalle existente
        const detalleExistente = await queryRunner.manager.findOne(DetalleProduccion, {
          where: { Produccion: { IdProduccion: id }, Producto: { IdProducto } }
        });

        const cantidadActual = detalleExistente ? Number(detalleExistente.Cantidad) : 0;
        const diferencia = Number(CantidadParaCostos) - cantidadActual;

        if (diferencia > 0) {
          // Aumentar cantidad - registrar salida adicional
          const empleado = IdEmpleado ? await verifyEmpleado(IdEmpleado) : null;

          // Consumir insumos adicionales
          const receta = await queryRunner.manager.findOne(Receta, {
            where: { Producto: { IdProducto } },
            relations: ["Ingredientes", "Ingredientes.Insumo"]
          });
          let costoExtra = 0;
          if (receta) {
            const factor = diferencia / Number(receta.Rendimiento);
            for (const ing of receta.Ingredientes) {
              costoExtra += await consumirInsumoFIFO(queryRunner, ing.Insumo.IdInsumo, Number(ing.Pesoconvertido) * factor, IdSucursal, id);
            }
          }

          // Actualizar o crear detalle
          if (detalleExistente) {
            detalleExistente.Cantidad = Number(CantidadParaCostos);
            if (IdProductoMedida) {
              detalleExistente.CantidadPresentacion = cantidadPresentacion;
              detalleExistente.CantidadUnidades = cantidadUnidades;
            } else {
              detalleExistente.CantidadPresentacion = 0;
              detalleExistente.CantidadUnidades = Number(CantidadParaCostos);
            }
            detalleExistente.CostoTotal = Number(detalleExistente.CostoTotal) + costoExtra;
            detalleExistente.CostoUnitario = Number(detalleExistente.CostoTotal) / Number(CantidadParaCostos);
            if (productoMedida) detalleExistente.ProductoMedida = productoMedida;
            if (IdEmpleado) detalleExistente.Empleado = await verifyEmpleado(IdEmpleado);
            await queryRunner.manager.save(detalleExistente);
          } else {
            const nuevoDetalle = new DetalleProduccion();
            nuevoDetalle.IdDetalleProduccion = await generarIdSecuencial("DTPRO", queryRunner);
            nuevoDetalle.Produccion = produccion;
            nuevoDetalle.Producto = await verifyProducto({ ProductoId: IdProducto });
            if (productoMedida) nuevoDetalle.ProductoMedida = productoMedida;
            if (IdEmpleado) nuevoDetalle.Empleado = await verifyEmpleado(IdEmpleado);
            nuevoDetalle.Cantidad = CantidadParaCostos;
            nuevoDetalle.CantidadPresentacion = cantidadPresentacion;
            nuevoDetalle.CantidadUnidades = cantidadUnidades;
            nuevoDetalle.CostoTotal = costoExtra;
            nuevoDetalle.CostoUnitario = CantidadParaCostos > 0 ? costoExtra / CantidadParaCostos : 0;
            await queryRunner.manager.save(nuevoDetalle);
          }

          // Entrada al inventario
          const costoUnitarioProducto = detalleExistente ? Number(detalleExistente.CostoUnitario) : (CantidadParaCostos > 0 ? costoExtra / CantidadParaCostos : 0);
          await createLoteInventario(queryRunner, IdProducto, null, diferencia, costoUnitarioProducto, IdSucursal, 'ENTRADA_PRODUCCION', id, costoUnitarioProducto, undefined);
          totalCostoInsumosDelta += costoExtra;

        } else if (diferencia < 0) {
          // Reducir cantidad
          const cantidadAReducir = Math.abs(diferencia);
          if (!detalleExistente) throw new Error(`No existe registro del producto ${IdProducto} para reducir`);

          // Reducir inventario descontando de todos los lotes activos de esta producción
          const lotes = await queryRunner.manager.find(Inventario, {
            where: { IdReferencia: id, Producto: { IdProducto }, Estado: 1 },
            order: { FechaIngreso: 'ASC' }
          });
          let restante = cantidadAReducir;
          for (const lote of lotes) {
            if (restante <= 0) break;
            const disponible = Number(lote.Stock);
            const aDescontar = Math.min(disponible, restante);
            lote.Stock = disponible - aDescontar;
            if (lote.Stock <= 0) {
              lote.Estado = 0;
              lote.Stock = 0;
            }
            await queryRunner.manager.save(lote);
            await registrarMovimientoSalida(queryRunner, lote, 'AJUSTE_PRODUCCION', aDescontar, id);
            restante -= aDescontar;
          }

          // Actualizar detalle
          detalleExistente.Cantidad = Number(CantidadParaCostos);
          if (Number(detalleExistente.Cantidad) <= 0) {
            detalleExistente.CantidadMala = Number(detalleExistente.CantidadMala) + Math.abs(Number(detalleExistente.Cantidad));
          }
          detalleExistente.CantidadPresentacion = IdProductoMedida ? cantidadPresentacion : 0;
          detalleExistente.CantidadUnidades = IdProductoMedida ? cantidadUnidades : Number(CantidadParaCostos);
          // 🔥 Guardar/cambiar la presentación (antes no se actualizaba en este flujo)
          if (IdProductoMedida && productoMedida) {
            detalleExistente.ProductoMedida = productoMedida;
          }
          // Recalcular costo proporcionalmente
          const proporcionReducir = cantidadAReducir / (cantidadActual || 1);
          detalleExistente.CostoTotal = Number(detalleExistente.CostoTotal) * (1 - proporcionReducir);
          detalleExistente.CostoUnitario = Number(CantidadParaCostos) > 0 ? Number(detalleExistente.CostoTotal) / Number(CantidadParaCostos) : 0;
          await queryRunner.manager.save(detalleExistente);
        } else {
          // diferencia === 0 → misma cantidad total, pero puede cambiar presentación/encargado
          if (detalleExistente && (IdProductoMedida || IdEmpleado)) {
            if (IdProductoMedida && productoMedida) detalleExistente.ProductoMedida = productoMedida;
            detalleExistente.CantidadPresentacion = cantidadPresentacion;
            detalleExistente.CantidadUnidades = cantidadUnidades;
            if (IdEmpleado) detalleExistente.Empleado = await verifyEmpleado(IdEmpleado);
            await queryRunner.manager.save(detalleExistente);
          } else if (detalleExistente && !IdProductoMedida && !IdEmpleado) {
            // Sólo se quitó la presentación/cantidad sin otros cambios
            detalleExistente.CantidadPresentacion = 0;
            detalleExistente.CantidadUnidades = Number(CantidadParaCostos);
            await queryRunner.manager.save(detalleExistente);
          }
        }
      }

      // Recalcular costos totales si la producción ya estaba finalizada o hubo cambios en productos
      if (produccion.HoraFin || Productos.some((p: any) => p.Cantidad !== undefined)) {
        await recalcularCostosProduccion(queryRunner, id);
      }
    }

    await queryRunner.commitTransaction();
    return res.json({ message: "Producción actualizada correctamente", IdProduccion: id });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * Recalcular costos de una producción (después de ediciones)
 */
const recalcularCostosProduccion = async (queryRunner: QueryRunner, IdProduccion: string) => {
  const produccion = await queryRunner.manager.findOne(Produccion, {
    where: { IdProduccion },
    relations: ["ProduccionEmpleado", "DetalleHorno", "Detalle", "Sucursal"]
  });
  if (!produccion) return;

  // MO
  const totalMO = produccion.ProduccionEmpleado.reduce((acc, pe) => acc + Number(pe.CostoTotal), 0);
  // Energía hornos
  const totalEnergia = produccion.DetalleHorno.reduce((acc, dh) => acc + Number(dh.Costo), 0);
  // Agua (proporcional)
  const horasMax = Math.max(...produccion.ProduccionEmpleado.map(pe => Number(pe.Horas)), 0.1);
  const totalAgua = await calcularGastoProporcional(produccion.Sucursal.IdSucursal, "Agua", horasMax);
  const costosIndirectos = totalEnergia + totalAgua;

  produccion.CostoManoObra = totalMO;
  produccion.CostoIndirecto = costosIndirectos;

  // Recalcular detalle costs con prorrateo
  const totalInsumos = Number(produccion.CostoInsumos) || 1;
  for (const det of produccion.Detalle) {
    const proporcion = Number(det.CostoTotal) / totalInsumos;
    const asignados = (totalMO * proporcion) + (costosIndirectos * proporcion);
    det.CostoTotal = Number(det.CostoTotal) + asignados;
    det.CostoUnitario = Number(det.Cantidad) > 0 ? Number(det.CostoTotal) / Number(det.Cantidad) : 0;
    await queryRunner.manager.save(det);
  }

  produccion.CostoTotal = Number(produccion.CostoInsumos) + totalMO + costosIndirectos;
  await queryRunner.manager.save(produccion);
};

/**
 * APOYO
 */
export const consumirInsumoFIFO = async (queryRunner: QueryRunner, IdInsumo: string | undefined, Cantidad: number, IdSucursal: string, IdReferencia: string, tipoMovimiento: string = "SALIDA_PRODUCCION") => {
  let restante = Number(Cantidad);
  let costoTotal = 0;

  if (!IdInsumo) return 0;

  // Sincronización: Si es Agua Potable, usamos el costo promedio de las facturas de la Sucursal
  let costoOverride: number | null = null;
  if (IdInsumo === "06172026INS-1") {
    const cp = await calcularCostoUnitarioPromedio("Agua", IdSucursal);
    if (cp > 0) costoOverride = cp;
  }

  const lotes = await queryRunner.manager.find(Inventario, {
    where: {
      Insumo: { IdInsumo },
      Sucursal: { IdSucursal },
      Stock: MoreThan(0),
      Estado: 1
    },
    order: { FechaIngreso: "ASC" },
    relations: ["Insumo", "Sucursal"]
  });

  if (lotes.length === 0) {
    const cp = costoOverride ?? 0;
    const insumo = await verifyInsumo({ ProductoId: IdInsumo });
    const sucursal = await verifySucursal({ SucursalId: IdSucursal });

    const mov = new MovimientoInventario();
    mov.IdMovimiento = await generarIdSecuencial("MOINV", queryRunner);
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

  const lotsToSave: Inventario[] = [];
  const movements: MovimientoInventario[] = [];

  for (const lote of lotes) {
    if (restante <= 0) break;
    const disponible = Number(lote.Stock);
    const consumo = Math.min(disponible, restante);

    const costoUnitario = costoOverride ?? Number(lote.CostoUnitario);
    const costo = consumo * costoUnitario;

    lote.Stock = disponible - consumo;
    if (lote.Stock <= 0) lote.Estado = 0;
    lotsToSave.push(lote);

    const mov = new MovimientoInventario();
    mov.IdMovimiento = await generarIdSecuencial("MOINV", queryRunner);
    mov.Tipo = tipoMovimiento;
    mov.Cantidad = -consumo;
    mov.Fecha = new Date();
    mov.Insumo = lote.Insumo;
    mov.Sucursal = lote.Sucursal;
    mov.CostoUnitario = Number(lote.CostoUnitario);
    mov.CostoTotal = costo;
    mov.Inventario = lote;
    mov.IdReferencia = IdReferencia;
    movements.push(mov);
    costoTotal += costo;
    restante -= consumo;
  }

  if (lotsToSave.length > 0) await queryRunner.manager.save(lotsToSave);
  if (movements.length > 0) await queryRunner.manager.save(movements);
  return costoTotal;
};

const calcularGastoProporcional = async (IdSucursal: string, servicio: string, horasProduccion: number) => {
  const periodoActual = new Date().toISOString().slice(0, 7);
  const gasto = await Gasto.findOne({ where: { Sucursal: { IdSucursal }, Periodo: periodoActual, Servicio: servicio } });
  
  if (!gasto) return 0;

  const horasMes = await calcularHorasMes(IdSucursal);
  return (Number(gasto.Monto) / (horasMes || 1)) * horasProduccion;
};

const calcularCostoHoraEmpleado = async (sueldoMensual: number, IdSucursal: string) => {
  const horasMes = await calcularHorasMes(IdSucursal);
  return (horasMes > 0) ? (sueldoMensual / horasMes) : 0;
};

const calcularHorasMes = async (IdSucursal: string) => {
  const horarios = await Horario.find({ where: { Sucursal: { IdSucursal } } });
  let horasDiaTotal = 0;
  for (const h of horarios) {
    const entrada = new Date(`1970-01-01T${h.HoraEntrada}`);
    const salida = new Date(`1970-01-01T${h.HoraSalida}`);
    let diff = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    horasDiaTotal += diff;
  }
  const diasOperativos = new Set(horarios.map(h => h.Dia)).size || 1;
  return (horasDiaTotal / diasOperativos) * 30;
}; 

const calcularCostoUnitarioPromedio = async (TipoServicio: string, IdSucursal: string) => {
  let servicio = "";
  if (TipoServicio === "Electricidad") servicio = "Luz";
  else if (TipoServicio === "Agua") servicio = "Agua";
  else servicio = "Gas Natural";

  const facturas = await Gasto.find({ where: { Servicio: servicio, Sucursal: { IdSucursal } }, order: { Fecha: "DESC" }, take: 3 });
  if (facturas.length === 0) return 0;
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

export const verifyProduccion = async (idproduccion: string) => {
  const prod = await Produccion.findOne({ where: { IdProduccion: idproduccion } });
  if (!prod) throw new HttpError(404, "No existe");
  return prod;
};

export const getProducciones = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect(); 

  try {

    const {
      Idsucursal,
      fecha,
      search,
      page = 1,
      limit = 10
    } = req.query;

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
              'CantidadPresentacion', dp.cantidadpresentacion,
              'CantidadUnidades', dp.cantidadunidades,
              'CostoUnitario', dp.costounitario,
              'CostoTotal', dp.costototal,
              'CantidadMala', dp.cantidadmala,
              'Motivo', dp.motivo,
              'Producto', json_build_object(
                'IdProducto', prod.idproducto,
                'Nombre', prod.nombre
              ),
              'ProductoMedida', CASE WHEN dp.idproductomedida IS NOT NULL THEN jsonb_build_object(
                'IdProductoMedida', pm.idproductomedida,
                'Cantidad', pm.cantidad,
                'Presentacion', json_build_object(
                  'IdPresentacion', pres.idpresentacion,
                  'Nombre', pres.nombre,
                  'Abreviatura', pres.abreviatura,
                  'Produccion', pres.produccion,
                  'Venta', pres.venta
                )
              ) ELSE NULL END,
              'Empleado', json_build_object(
                'IdEmpleado', dp.idempleado,
                'Nombre', COALESCE(pers4.nombre || ' ' || pers4.apellidopaterno, 'Sin asignar')
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

        -- Salidas Detalladas (Quién produjo qué y a qué hora, desde el detalle de producción)
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'IdHornoProducto', dp3.iddetalleproduccion,
                'Cantidad', dp3.cantidad,
                'CantidadPresentacion', dp3.cantidadpresentacion,
                'CantidadUnidades', dp3.cantidadunidades,
                'CantidadMala', dp3.cantidadmala,
                'Motivo', dp3.motivo,
                'Hora', COALESCE(pe3.horainicio, p.horainicio),
                'Producto', prod3.nombre,
                'Empleado', pers3.nombre || ' ' || pers3.apellidopaterno,
                'Presentacion', CASE WHEN dp3.idproductomedida IS NOT NULL THEN
                  (SELECT pr3.nombre FROM productomedida pm3 INNER JOIN presentacion pr3 ON pr3.idpresentacion = pm3.idpresentacion WHERE pm3.idproductomedida = dp3.idproductomedida)
                ELSE NULL END
              )
            )
            FROM detalle_produccion dp3
            INNER JOIN producto prod3 ON prod3.idproducto = dp3.idproducto
            LEFT JOIN empleado emp3 ON emp3.idempleado = dp3.idempleado
            LEFT JOIN persona pers3 ON pers3.idpersona = emp3.idpersona
            LEFT JOIN produccion_empleado pe3
              ON pe3.idproduccion = dp3.idproduccion AND pe3.idempleado = dp3.idempleado
            WHERE dp3.idproduccion = p.idproduccion
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

      LEFT JOIN empleado emp4
        ON emp4.idempleado = dp.idempleado

      LEFT JOIN persona pers4
        ON pers4.idpersona = emp4.idpersona

      LEFT JOIN productomedida pm
        ON pm.idproductomedida = dp.idproductomedida
        AND pm.idproducto = dp.idproducto

      LEFT JOIN presentacion pres
        ON pres.idpresentacion = pm.idpresentacion

      LEFT JOIN produccion_horno_detalle ph
        ON ph.idproduccion = p.idproduccion

      LEFT JOIN horno h
        ON h.idhorno = ph.idhorno

      WHERE
        ($1::text IS NULL OR s.idsucursal = $1)

        AND (
          $2::date IS NULL
          OR p.fechaproduccion::date = $2::date
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
      totalPages: Math.ceil(
        Number(result[0].total) / Number(limit)
      ),
      data: result.map(({ total, ...rest }: any) => rest)
    });

  } catch (error) {

    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message
      });
    }

  } finally {

    await queryRunner.release();

  }
};

export const getInsumosSucursal = async (req: Request, res: Response) => {

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();

  try {

    const { id } = req.params;

    const {
      search,
      page = 1,
      limit = 10
    } = req.query;

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
      data: stock.map(({ total, ...rest }: any) => rest)
    });

  } catch (error) {

    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message
      });
    }

  } finally {

    await queryRunner.release();

  }
}; 

/**
 * REGISTRAR PRODUCTOS DEFECTUOSOS (MERMA)
 */
export const registrarMermaProduccion = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { IdProduccion, IdProducto, CantidadMala, Motivo } = req.body;

    // 1. Buscar el detalle de producción
    const detalle = await queryRunner.manager.findOne(DetalleProduccion, {
      where: { Produccion: { IdProduccion }, Producto: { IdProducto } }
    });

    if (!detalle) throw new Error("No se encontró el registro de este producto en la producción especificada.");

    // La merma se envía como delta: positivo descuenta, negativo restaura
    const delta = Number(CantidadMala);
    const cantAnterior = Number(detalle.CantidadMala);
    const cantNueva = cantAnterior + delta;
    if (cantNueva < 0) {
      throw new Error("La cantidad dañada no puede ser negativa.");
    }

    // 2. Ajustar inventario según el delta
    if (delta !== 0) {
      let lote = await queryRunner.manager.findOne(Inventario, {
        where: { IdReferencia: IdProduccion, Producto: { IdProducto: IdProducto }, Estado: 1 }
      });

      if (delta > 0) {
        if (!lote) throw new Error("No se encontró stock en inventario para esta producción.");
        if (Number(lote.Stock) < delta) {
          throw new Error(`Stock insuficiente en el lote para registrar la merma. Disponible: ${lote.Stock}`);
        }

        // 3a. Descontar del inventario
        lote.Stock = Number(lote.Stock) - delta;
        if (lote.Stock <= 0) {
          lote.Estado = 0;
          lote.Stock = 0;
        }
        await queryRunner.manager.save(lote);

        // 4a. Registrar movimiento de salida por merma
        await registrarMovimientoSalida(queryRunner, lote, "MERMA_PRODUCCION", delta, IdProduccion);
      } else {
        // Para restaurar stock se permite recuperar un lote agotado
        if (!lote) {
          lote = await queryRunner.manager.findOne(Inventario, {
            where: { IdReferencia: IdProduccion, Producto: { IdProducto: IdProducto } }
          });
        }
        if (!lote) throw new Error("No se encontró stock en inventario para esta producción.");

        // 3b. Restaurar stock por reducción de merma
        lote.Stock = Number(lote.Stock) + Math.abs(delta);
        if (lote.Stock > 0) lote.Estado = 1;
        await queryRunner.manager.save(lote);

        // 4b. Registrar movimiento de entrada por ajuste de merma
        await registrarMovimientoEntrada(queryRunner, lote, "AJUSTE_MERMA", IdProduccion, Math.abs(delta));
      }
    }

    // 5. Actualizar registro en detalle de producción (para reportes)
    // Nota: La cantidad original se mantiene, pero ahora sabemos cuántos fueron mermas
    detalle.CantidadMala = cantNueva;
    if (Motivo !== undefined) detalle.Motivo = Motivo;
    await queryRunner.manager.save(detalle);

    await queryRunner.commitTransaction();
    return res.status(200).json({ message: "Merma registrada correctamente y stock actualizado." });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};

/**
 * REGISTRAR BAJA DE PRODUCTO (productos que no se lograron vender)
 * Elimina del inventario los productos y registra el motivo en la tabla BajaProducto
 */
export const registrarBajaProducto = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const { fecha, hora } = getFechaHoraBolivia();
    const { IdProduccion, IdProducto, Cantidad, Motivo } = req.body;

    // 1. Validar que la producción exista
    const produccion = await queryRunner.manager.findOne(Produccion, {
      where: { IdProduccion },
      relations: ["Sucursal"]
    });
    if (!produccion) throw new HttpError(404, "Producción no encontrada.");

    // 2. Validar el producto
    const producto = await verifyProducto({ ProductoId: IdProducto });

    // 3. Buscar el lote en inventario asociado a esta producción
    const lote = await queryRunner.manager.findOne(Inventario, {
      where: {
        IdReferencia: IdProduccion,
        Producto: { IdProducto },
        Sucursal: { IdSucursal: produccion.Sucursal.IdSucursal },
        Estado: 1
      }
    });

    if (!lote) throw new HttpError(404, "No se encontró stock en inventario para este lote de producción.");
    if (Number(lote.Stock) < Number(Cantidad)) {
      throw new HttpError(400, `Stock insuficiente en el lote. Disponible: ${lote.Stock}`);
    }

    // 4. Descontar del inventario
    lote.Stock = Number(lote.Stock) - Number(Cantidad);
    if (lote.Stock <= 0) lote.Estado = 0;
    await queryRunner.manager.save(lote);

    // 5. Registrar movimiento de salida
    await registrarMovimientoSalida(queryRunner, lote, 'BAJA_PRODUCTO', Number(Cantidad), IdProduccion);

    // 6. Actualizar el detalle de producción existente
    const detalle = await queryRunner.manager.findOne(DetalleProduccion, {
      where: { Produccion: { IdProduccion }, Producto: { IdProducto } }
    });
    if (detalle) {
      detalle.CantidadMala = Number(detalle.CantidadMala) + Number(Cantidad);
      if (Motivo) detalle.Motivo = Motivo;
      await queryRunner.manager.save(detalle);
    }

    // 7. Registrar en la tabla BajaProducto
    const baja = new BajaProducto();
    baja.IdBaja = await generarIdSecuencial('BAJA', queryRunner);
    baja.Produccion = produccion;
    baja.Sucursal = produccion.Sucursal;
    baja.Producto = producto;
    baja.Cantidad = Number(Cantidad);
    baja.Motivo = Motivo || null;
    baja.Fecha = fecha;
    baja.Hora = hora;
    await queryRunner.manager.save(baja);

    await queryRunner.commitTransaction();
    return res.status(200).json({
      message: "Producto dado de baja correctamente.",
      cantidad: Cantidad
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof Error) return res.status(500).json({ message: error.message });
  } finally {
    await queryRunner.release();
  }
};
