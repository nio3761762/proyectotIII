import API from './api';

export const getProducciones = async (Idsucursal, fecha,  search, page , limit  ) => {
  try {
     const params = {
      Idsucursal, fecha,search,page , limit
    };
// este es el metodo en el back end como se usa
// export const getProducciones = async (req: Request, res: Response) => {
//   const queryRunner = AppDataSource.createQueryRunner();

//   await queryRunner.connect(); 

//   try {

//     const {
//       Idsucursal,
//       fecha,
//       search,
//       page = 1,
//       limit = 10
//     } = req.query;

//     const offset = (Number(page) - 1) * Number(limit);

//     const result = await queryRunner.query(`
//       SELECT 
//         p.idproduccion AS "IdProduccion",
//         p.fechaproduccion AS "FechaProduccion",
//         p.horainicio AS "HoraInicio",
//         p.horafin AS "HoraFin",
//         p.costototal AS "CostoTotal",
//         p.costoinsumos AS "CostoInsumos",
//         p.costomanobra AS "CostoManoObra", 
//         p.costoindirecto AS "CostoIndirecto",
//         p.observacion AS "Observacion",
//         p.estado AS "Estado",  
//         COUNT(*) OVER() AS total,

//         -- Sucursal
//         json_build_object(
//           'IdSucursal', s.idsucursal,
//           'Nombre', s.nombre
//         ) AS "Sucursal",

//         -- Productos
//         COALESCE(
//           json_agg(
//             DISTINCT jsonb_build_object(
//               'IdDetalleProduccion', dp.iddetalleproduccion,
//               'Cantidad', dp.cantidad,
//               'CostoUnitario', dp.costounitario,
//               'CostoTotal', dp.costototal,
//               'CantidadMala', dp.cantidadmala,
//               'Motivo', dp.motivo,
//               'Producto', json_build_object(
//                 'IdProducto', prod.idproducto,
//                 'Nombre', prod.nombre
//               )
//             )
//           ) FILTER (WHERE dp.iddetalleproduccion IS NOT NULL),
//           '[]'
//         ) AS "Detalle",

//         -- Empleados
//         COALESCE(
//           json_agg(
//             DISTINCT jsonb_build_object(
//               'IdProduccionEmpleado', pe.idproduccionempleado,
//               'HoraInicio', pe.horainicio,
//               'HoraFin', pe.horafin,
//               'Horas', pe.horas,
//               'CostoTotal', pe.costototal,
//               'Empleado', json_build_object(
//                 'IdEmpleado', emp.idempleado,
//                 'Nombre', pers.nombre || ' ' || pers.apellidopaterno,
//                 'Imagen', pers.imagen,
//                 'Cargo', c.nombre
//               )
//             )
//           ) FILTER (WHERE pe.idproduccionempleado IS NOT NULL),
//           '[]'
//         ) AS "Empleados",

//         -- Hornos
//         COALESCE(
//           json_agg(
//             DISTINCT jsonb_build_object(
//               'IdProduccionHornoDetalle', ph.idproduccionhornodetalle,
//               'HoraInicio', ph.horainicio,
//               'HoraFin', ph.horafin,
//               'TipoEnergia', ph.tipoenergia,
//               'Consumo', ph.consumo,
//               'Costo', ph.costo,
//               'Horno', json_build_object(
//                 'IdHorno', h.idhorno,
//                 'Nombre', h.nombre
//               )
//             )
//           ) FILTER (WHERE ph.idproduccionhornodetalle IS NOT NULL),
//           '[]'
//         ) AS "DetalleHorno",

//         -- Salidas Detalladas (Quién produjo qué, en qué horno y a qué hora)
//         COALESCE(
//           (
//             SELECT json_agg(
//               jsonb_build_object(
//                 'IdHornoProducto', hp.idhornoproducto,
//                 'Cantidad', hp.cantidad,
//                 'Hora', hp.hora,
//                 'Producto', prod2.nombre,
//                 'Empleado', pers2.nombre || ' ' || pers2.apellidopaterno,
//                 'Horno', h2.nombre
//               )
//             )
//             FROM hornoproducto hp
//             INNER JOIN produccion_horno_detalle ph2 ON ph2.idproduccionhornodetalle = hp.idproduccionhornodetalle
//             INNER JOIN producto prod2 ON prod2.idproducto = hp.idproducto
//             INNER JOIN empleado emp2 ON emp2.idempleado = hp.idempleado
//             INNER JOIN persona pers2 ON pers2.idpersona = emp2.idpersona
//             INNER JOIN horno h2 ON h2.idhorno = ph2.idhorno
//             WHERE ph2.idproduccion = p.idproduccion
//           ),
//           '[]'
//         ) AS "SalidasDetalladas"

//       FROM produccion p

//       INNER JOIN sucursal s
//         ON s.idsucursal = p.idsucursal

//       LEFT JOIN detalle_produccion dp
//         ON dp.idproduccion = p.idproduccion

//       LEFT JOIN producto prod
//         ON prod.idproducto = dp.idproducto

//       LEFT JOIN produccion_empleado pe
//         ON pe.idproduccion = p.idproduccion

//       LEFT JOIN empleado emp
//         ON emp.idempleado = pe.idempleado

//       LEFT JOIN persona pers
//         ON pers.idpersona = emp.idpersona

//       LEFT JOIN (
//           SELECT idempleado, idcargo
//           FROM (
//               SELECT
//                 idempleado,
//                 idcargo,
//                 ROW_NUMBER() OVER (
//                   PARTITION BY idempleado
//                   ORDER BY CASE
//                     WHEN idcargo = 'CAR-001' THEN 1
//                     ELSE 2
//                   END
//                 ) AS rn
//               FROM empleado_cargo
//               WHERE estado = 1
//               AND idcargo IN ('CAR-001', 'CAR-004')
//           ) sub
//           WHERE rn = 1
//       ) ec
//         ON ec.idempleado = emp.idempleado

//       LEFT JOIN cargo c
//         ON c.idcargo = ec.idcargo

//       LEFT JOIN produccion_horno_detalle ph
//         ON ph.idproduccion = p.idproduccion

//       LEFT JOIN horno h
//         ON h.idhorno = ph.idhorno

//       WHERE
//         ($1::text IS NULL OR s.idsucursal = $1)

//         AND (
//           $2::date IS NULL
//           OR p.fechaproduccion = $2
//         )

//         AND (
//           $3::text IS NULL
//           OR EXISTS (
//             SELECT 1
//             FROM detalle_produccion dp2
//             INNER JOIN producto p2
//               ON p2.idproducto = dp2.idproducto
//             WHERE dp2.idproduccion = p.idproduccion
//               AND LOWER(p2.nombre) LIKE LOWER('%' || $3 || '%')
//           )
//         )

//       GROUP BY
//         p.idproduccion,
//         s.idsucursal

//       ORDER BY
//         p.fechaproduccion DESC,
//         p.horainicio DESC

//       LIMIT $4 OFFSET $5
//     `, [
//       Idsucursal || null,
//       fecha || null,
//       search || null,
//       Number(limit),
//       offset
//     ]);

//     if (result.length === 0) {
//       return res.json({
//         total: 0,
//         page: Number(page),
//         limit: Number(limit),
//         totalPages: 0,
//         data: []
//       });
//     }

//     return res.json({
//       total: Number(result[0].total),
//       page: Number(page),
//       limit: Number(limit),
//       totalPages: Math.ceil(
//         Number(result[0].total) / Number(limit)
//       ),
//       data: result.map(({ total, ...rest }: any) => rest)
//     });

//   } catch (error) {

//     if (error instanceof Error) {
//       return res.status(500).json({
//         message: error.message
//       });
//     }

//   } finally {

//     await queryRunner.release();

//   }
// };
    const response = await API.get('produccion',  { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const getInsumosSucursal = async (id, search = '', limit = 10, page = 1) => {
  try {
    const params = {
      search,
      limit,
      page
    };
    const response = await API.get(`produccion/insumos/sucursal/${id}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos de sucursal:', error);
    throw error;
  }
};


export const iniciarProduccion = async ( Idsucursal,IdEmpleados,Observacion, HoraInicio, HoraFin, FechaRegistro) => {
  try {
    const response = await API.post('produccion/iniciar', { 
     Idsucursal, 
     IdEmpleados,
     Observacion,
     HoraInicio,
     HoraFin,
     FechaRegistro
    });
    return response.data;

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
export const Agregarempleado = async ( IdProduccion, IdEmpleado, HoraInicio) => {
  try {
    const response = await API.post('produccion/agregarempleado', { 
     IdProduccion, IdEmpleado, HoraInicio
    });
    return response.data;

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const anularProduccion = async ( IdProduccion) => {
  try {
    const response = await API.put(`produccion/anular/${IdProduccion}`,);
    return response.data;

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const encenderHorno = async (IdProduccion, IdHorno, TipoEnergia, HoraInicio) => {
  try {
    const response = await API.post('produccion/horno/encender', { 
    IdProduccion, IdHorno, TipoEnergia, HoraInicio
    });
    return response.data;

} catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const finalizarProduccionTotal = async ( IdProduccion, IdSucursal, HoraFin) => {
  try {
    const response = await API.post('produccion/finalizar', { 
     IdProduccion, HoraFin
    });
    return response.data;

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const finalizarTurnoEmpleado = async (IdProduccion, IdEmpleado, HoraFin) => {
  try {
    const response = await API.post('produccion/empleado/finalizar', { 
   IdProduccion, IdEmpleado, HoraFin
    });
    return response.data;

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const cambiarCombustibleHorno = async ( IdProduccion, IdHorno, NuevoTipoEnergia, IdSucursal, HoraCambio) => {
  try {
    const response = await API.post('produccion/horno/cambio-combustible', { 
      IdProduccion, IdHorno, NuevoTipoEnergia, HoraCambio
    });
    return response.data;
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const registrarSalidaProducto = async ( IdProduccion, IdProducto, IdEmpleado, Cantidad, IdHorno, IdSucursal, HoraRegistro) => {
  try {
    const response = await API.post('produccion/producto/salida', { 
     IdProduccion, IdProducto, IdEmpleado, Cantidad, IdHorno, HoraRegistro
    });
    return response.data;

  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('Error al registrar salida:', msg);
    throw new Error(msg);
  }
};


export const descartarProducto = async ( IdProduccion, IdProducto, Cantidad, Motivo ) => {
  try {
    const response = await API.post('produccion/Descartarproducto',{
      IdProduccion, IdProducto, Cantidad, Motivo 
    });
    return response.data;
// este el metodo en el back end 
// export const descartarProductosDaniados = async (req: Request, res: Response) => {
//   const queryRunner = AppDataSource.createQueryRunner();
//   await queryRunner.connect();
//   await queryRunner.startTransaction();
//   try {
//     const { IdProduccion, IdProducto, Cantidad, Motivo } = req.body;

//     // 1. Validar que la producción exista
//     const produccion = await queryRunner.manager.findOne(Produccion, { 
//       where: { IdProduccion },
//       relations: ["Sucursal"]
//     });
//     if (!produccion) throw new Error("Producción no encontrada.");

//     // 2. Buscar el registro de producción de ese producto (DEBE EXISTIR si ya entró a inventario)
//     const detalle = await queryRunner.manager.findOne(DetalleProduccion, {
//       where: { Produccion: { IdProduccion }, Producto: { IdProducto } }
//     });
//     if (!detalle) throw new Error("No se puede descartar un producto que no ha sido registrado como producido.");

//     // 3. Buscar el lote de inventario asociado
//     const lote = await queryRunner.manager.findOne(Inventario, {
//       where: { 
//         IdReferencia: IdProduccion, 
//         Producto: { IdProducto }, 
//         Sucursal: { IdSucursal: produccion.Sucursal.IdSucursal },
//         Estado: 1 
//       }
//     });

//     if (!lote) throw new Error("No se encontró stock en inventario para este lote de producción.");
//     if (Number(lote.Stock) < Number(Cantidad)) {
//       throw new Error(`Stock insuficiente en el lote. Disponible: ${lote.Stock}`);
//     }

//     // 4. Descontar del inventario
//     lote.Stock = Number(lote.Stock) - Number(Cantidad);
//     if (lote.Stock <= 0) lote.Estado = 0;
//     await queryRunner.manager.save(lote);

//     // Registrar movimiento de salida
//     await registrarMovimientoSalida(queryRunner, lote, 'DESCARTE', Number(Cantidad), IdProduccion);

//     // 5. Actualizar el detalle de producción existente
//     // Restamos de la cantidad "buena" y sumamos a la "mala"
//     detalle.Cantidad = Number(detalle.Cantidad) - Number(Cantidad);
//     detalle.CantidadMala = Number(detalle.CantidadMala) + Number(Cantidad);
//     await queryRunner.manager.save(detalle);

//     await queryRunner.commitTransaction();
//     return res.status(200).json({ 
//       message: "Productos descartados correctamente.",
//       cantidadDescartada: Cantidad,
//       nuevaCantidadDisponible: detalle.Cantidad
//     });
//   } catch (error) {
//     await queryRunner.rollbackTransaction();
//     if (error instanceof Error) return res.status(500).json({ message: error.message });
//   } finally {
//     await queryRunner.release();
//   }
// };
  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};

export const registrarMermaProduccion = async (IdProduccion, IdProducto, CantidadMala, Motivo) => {
  try {
    const response = await API.post('produccion/producto/merma', { IdProduccion, IdProducto, CantidadMala, Motivo });
    return response.data;
  } catch (error) {
    console.error('Error al registrar merma:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const registrarSalidaProductoMasiva = async (IdProduccion, Salidas) => {
  try {
    const response = await API.post('produccion/producto/salida-masiva', { IdProduccion, Salidas });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('Error al registrar salidas masivas:', msg);
    throw new Error(msg);
  }
};

export const actualizarProduccion = async (IdProduccion, data) => {
  try {
    const response = await API.put(`produccion/${IdProduccion}`, data);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('Error al actualizar producción:', msg);
    throw new Error(msg);
  }
};

export const apagarHorno = async ( IdProduccion, IdHorno, HoraFin) => {
  try {
    const response = await API.post('produccion/Apagarhorno',{IdProduccion, IdHorno, HoraFin});
    return response.data;
// este es el metodo del backend 
// export const apagarHorno = async (req: Request, res: Response) => {
//   const queryRunner = AppDataSource.createQueryRunner();
//   await queryRunner.connect();
//   await queryRunner.startTransaction();
//   try {
//     const { hora } = getFechaHoraBolivia();
//     const { IdProduccion, IdHorno, HoraFin } = req.body;

//     const peh = await queryRunner.manager.findOne(ProduccionHornoDetalle, { 
//       where: { Produccion: { IdProduccion }, Horno: { IdHorno }, HoraFin: IsNull() },
//       relations: ["Produccion", "Produccion.Sucursal", "Horno"] 
//     });

//     if (!peh) throw new Error("No se encontró una sesión activa para este horno.");
    
//     const IdSucursal = peh.Produccion.Sucursal.IdSucursal;
//     const f_hora = HoraFin || hora;
//     peh.HoraFin = f_hora;

//     // Calcular horas transcurridas
//     const inicio = new Date(`1970-01-01T${peh.HoraInicio}`);
//     const fin = new Date(`1970-01-01T${peh.HoraFin}`);
//     let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
//     if (diff < 0) diff += 24; // Cruce de medianoche
//     peh.Horas = diff;

//     // Obtener información de consumo del horno para el tipo de energía usado
//     const infoE = await queryRunner.manager.findOne(HornoEnergia, { 
//       where: { Horno: { IdHorno: peh.Horno.IdHorno }, TipoEnergia: peh.TipoEnergia } 
//     });
    
//     const consumo = peh.Horas * Number(infoE?.ConsumoPorHora || 0);
//     peh.Consumo = consumo;

//     // Calcular costo según tipo de energía
//     if (peh.TipoEnergia === "Gas GLP") {
//         const config = await queryRunner.manager.findOne(ConfiguracionEnergia, { where: { TipoEnergia: peh.TipoEnergia }, relations: ["Insumo"] });
//         peh.Costo = await consumirInsumoFIFO(queryRunner, config?.Insumo?.IdInsumo, consumo, IdSucursal, IdProduccion, "CONSUMO_ENERGIA_HORNO");
//     } else {
//         peh.Costo = consumo * await calcularCostoUnitarioPromedio(peh.TipoEnergia, IdSucursal);
//     }
    
//     await queryRunner.manager.save(peh);

//     // Actualizar Costo Indirecto en la cabecera de Producción
//     const produccion = peh.Produccion;
//     produccion.CostoIndirecto = Number(produccion.CostoIndirecto) + Number(peh.Costo);
//     await queryRunner.manager.save(produccion);

//     await queryRunner.commitTransaction();
//     return res.json({ 
//       message: "Horno apagado correctamente.", 
//       horasUso: peh.Horas, 
//       consumo: peh.Consumo, 
//       costo: peh.Costo 
//     });
//   } catch (error) {
//     await queryRunner.rollbackTransaction();
//     if (error instanceof Error) return res.status(500).json({ message: error.message });
//   } finally {
//     await queryRunner.release();
//   }
// };

  } catch (error) {
    console.error('Error al intentar ingresar datos:', error.response);
    throw error;
  }
};
