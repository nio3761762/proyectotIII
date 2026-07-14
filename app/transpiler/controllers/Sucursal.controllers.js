"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListGasto = exports.CreateGastos = exports.Listsucursal = exports.verifySucursal = exports.deleteSucursal = exports.updateSucursal = exports.getSucursalDireccion = exports.getSucursalById = exports.getSucursales = exports.createSucursal = void 0;
const Sucursal_1 = require("../entities/Sucursal");
const Direccion_controllers_1 = require("./Direccion.controllers");
const AdmDatos_controllers_1 = require("./AdmDatos.controllers");
const Horario_controllers_1 = require("./Horario.controllers");
const error_handler_1 = require("../utils/error.handler");
const idGenerator_1 = require("../utils/idGenerator");
const db_1 = require("../db");
const Gastos_1 = require("../entities/Gastos");
// Crear una nueva sucursal
const createSucursal = async (req, res) => {
    try {
        const { RegistrarSucurcal } = req.body;
        const existingSucursal = await Sucursal_1.Sucursal.findOne({ where: { Nombre: RegistrarSucurcal.Nombre } });
        if (existingSucursal) {
            return res.status(400).json({ message: "La sucursal ya existe" });
        }
        const sucursal = new Sucursal_1.Sucursal();
        sucursal.IdSucursal = await (0, idGenerator_1.generarIdSecuencial)('SUC');
        sucursal.Nombre = RegistrarSucurcal.nombre;
        sucursal.Direccion = await (0, Direccion_controllers_1.createDireccion)({ BarrioId: RegistrarSucurcal.idbarrio, Direccions: RegistrarSucurcal.direccion, Referencia: RegistrarSucurcal.referencia, Ubicacion: RegistrarSucurcal.ubicacion });
        if (RegistrarSucurcal.nro)
            sucursal.Nro = RegistrarSucurcal.nro;
        sucursal.FechaRegistro = new Date();
        sucursal.Datos = await (0, AdmDatos_controllers_1.verifyDatos)({ DatoId: 1 });
        ;
        if (RegistrarSucurcal.celular)
            sucursal.Celular = RegistrarSucurcal.celular;
        if (RegistrarSucurcal.central)
            sucursal.Central = Number(RegistrarSucurcal.central);
        await sucursal.save();
        if (RegistrarSucurcal.horarios && RegistrarSucurcal.horarios.length > 0)
            for (const ssc of RegistrarSucurcal.horarios) {
                await (0, Horario_controllers_1.createHorario)({ HoraEntrada: ssc.horaentrada, HoraSalida: ssc.horasalida, Dia: ssc.dia, IdSucursal: sucursal.IdSucursal, tipo: ssc.Tipo });
            }
        return res.status(201).json({ message: "La sucursal se registro correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createSucursal = createSucursal;
// Obtener todas las sucursales
const getSucursales = async (req, res) => {
    try {
        const { search = "", estado, page = 1, limit = 8 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;
        let where = `where 1=1`;
        const baseParams = [];
        // 🔍 búsqueda
        const searchText = (search ?? "").toString().trim();
        if (searchText.length > 0) {
            baseParams.push(`%${searchText}%`);
            where += ` and s.nombre ilike $${baseParams.length}`;
        }
        // 🔥 estado (1, 0, -1)
        if (estado !== undefined && estado !== "-1") {
            const estadoNum = Number(estado);
            if (!isNaN(estadoNum)) {
                baseParams.push(estadoNum);
                where += ` and s.estado = $${baseParams.length}`;
            }
        }
        // 🔢 total
        const countResult = await db_1.AppDataSource.query(`
      select count(*) as total
      from sucursal s
      ${where};
      `, baseParams);
        const total = Number(countResult[0].total);
        const totalPages = Math.ceil(total / limitNum);
        // 📦 params data
        const dataParams = [...baseParams];
        dataParams.push(limitNum);
        dataParams.push(offset);
        // 🚀 query principal
        const result = await db_1.AppDataSource.query(`
      select 
        s.idsucursal,
        s.nombre,
        s.estado,
        s.celular,
        s.nro,
        s.central,

        -- direccion
        dir.direccion,

        -- datos
        dat.datos,

        -- horarios
        coalesce(hor.horarios, '[]'::json) as horario

      from sucursal s

      -- direccion
      left join lateral (
        select json_build_object(
          'iddireccion', d.iddireccion,
          'direccion', d.direccion,
          'referencia', d.referencia,
          'ubicacion', d.ubicacion,
          'barrio', (
            select json_build_object(
              'idbarrio', b.idbarrio,
              'nombre', b.nombre,
              'distrito', (
                select json_build_object(
                  'iddistrito', dis.iddistrito,
                  'nombre', dis.nombre,
                  'ciudad', (
                    select json_build_object(
                      'idciudad', c.idciudad,
                      'nombre', c.nombre,
                      'departamento', (
                        select json_build_object(
                          'iddepto', dep.iddepto,
                          'nombre', dep.nombre
                        )
                        from departamento dep
                        where dep.iddepto = c.iddepto
                      )
                    )
                    from ciudad c
                    where c.idciudad = dis.idciudad
                  )
                )
                from distritos dis
                where dis.iddistrito = b.iddistrito
              )
            )
            from barrio b
            where b.idbarrio = d.idbarrio
          )
        ) as direccion
        from direccion d
        where d.iddireccion = s.iddireccion
        limit 1
      ) dir on true

      -- datos
      left join lateral (
        select json_build_object(
          'iddatos', da.iddatos,
          'nombre', da.nombre,
          'foto' , da.foto
        ) as datos
        from administrardatos da
        where da.iddatos = s.iddatos
        limit 1
      ) dat on true

      -- horarios
      left join lateral (
        select json_agg(
          json_build_object(
            'idhorario', h.idhorario,
            'dia', h.dia,
            'tipo', h.tipo,
            'horaentrada', h.horaentrada,
            'horasalida', h.horasalida
          )
        ) as horarios
        from horario h
        where h.idsucursal = s.idsucursal
      ) hor on true

      ${where}
      order by s.idsucursal desc
      limit $${dataParams.length - 1}
      offset $${dataParams.length};
      `, dataParams);
        return res.json({
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            data: result
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getSucursales = getSucursales;
// Obtener sucursal por Id
const getSucursalById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
          s.idsucursal,
          COALESCE(
              json_agg(
                  json_build_object(
                      'idempleadosucursal', es.idempleadosucursal,
                      'idempleado', e.idempleado,
                      'persona', row_to_json(p),
                      'cargo', (
                        SELECT json_build_object(
                          'idcargo', c.idcargo,
                          'nombre', c.nombre
                        )
                        FROM empleado_cargo ec
                        JOIN cargo c ON c.idcargo = ec.idcargo
                        WHERE ec.idempleado = e.idempleado
                        AND ec.fechafin IS NULL
                        LIMIT 1
                      ),
                      'estado', es.estado
                  )
              ) FILTER (WHERE es.idempleadosucursal IS NOT NULL),
              '[]'
          ) AS empleados
      FROM sucursal s
      LEFT JOIN empleado_sucursal es 
          ON es.idsucursal = s.idsucursal
          AND es.estado = 1
      LEFT JOIN empleado e 
          ON e.idempleado = es.idempleado
      LEFT JOIN persona p 
          ON p.idpersona = e.idpersona
      WHERE s.idsucursal = $1
      GROUP BY s.idsucursal;
      `, [id]);
        // 🔥 Si no existe la sucursal → []
        if (result.length === 0) {
            return res.json([]);
        }
        return res.json(result[0]);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getSucursalById = getSucursalById;
const getSucursalDireccion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
  SELECT
    s.idsucursal,
    s.nombre,
    ad.nombre AS nombreempresa,
    ad.celular,
    ad.email,
    ad.foto,
    d.direccion,
    d.referencia,
    d.ubicacion,
    b.nombre AS nombrebarrio,
    c.nombre AS nombreciudad,
    dp.nombre AS nombredepartamento,
    p.nombre AS nombrepais
  FROM sucursal s 
  JOIN administrardatos ad ON ad.iddatos = s.iddatos
  JOIN direccion d ON d.iddireccion = s.iddireccion
  JOIN barrio b ON b.idbarrio = d.idbarrio
  JOIN distritos ds ON ds.iddistrito = b.iddistrito
  JOIN ciudad c ON c.idciudad = ds.idciudad
  JOIN departamento dp ON dp.iddepto = c.iddepto
  JOIN pais p ON p.idpais = dp.idpais
  WHERE s.idsucursal = $1
`, [id]);
        // 🔥 Si no existe la sucursal → []
        if (result.length === 0) {
            return res.json([]);
        }
        return res.json(result[0]);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getSucursalDireccion = getSucursalDireccion;
// Actualizar sucursal
const updateSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const { RegistrarSucurcal } = req.body;
        const sucursal = await Sucursal_1.Sucursal.findOne({
            where: { IdSucursal: id },
        });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrado" });
        }
        sucursal.Nombre = RegistrarSucurcal.nombre;
        sucursal.Direccion = await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: RegistrarSucurcal.iddireccion, BarrioId: RegistrarSucurcal.idbarrio, Direccions: RegistrarSucurcal.direccion, Referencia: RegistrarSucurcal.referencia, Ubicacion: RegistrarSucurcal.ubicacion });
        if (RegistrarSucurcal.nro)
            sucursal.Nro = RegistrarSucurcal.nro;
        sucursal.FechaActualizacion = new Date();
        if (RegistrarSucurcal.celular)
            sucursal.Celular = RegistrarSucurcal.celular;
        if (RegistrarSucurcal.central)
            sucursal.Central = RegistrarSucurcal.central;
        await sucursal.save();
        if (RegistrarSucurcal.horarios && RegistrarSucurcal.horarios.length > 0)
            for (const ssc of RegistrarSucurcal.horarios) {
                await (0, Horario_controllers_1.updateHorario)({ HorarioId: ssc.idhorario, HoraEntrada: ssc.horaentrada, HoraSalida: ssc.horasalida, Dia: ssc.dia, IdSucursal: sucursal.IdSucursal, Tipo: ssc.Tipo });
            }
        return res.status(201).json({ message: "La sucursal se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateSucursal = updateSucursal;
// Eliminar (desactivar o activar) sucursal
const deleteSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE sucursal 
      SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
      WHERE IdSucursal = $1
      RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Sucursal no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos de la Sucursal correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Sucursal:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteSucursal = deleteSucursal;
const verifySucursal = async ({ SucursalId }) => {
    const existingSucursal = await Sucursal_1.Sucursal.findOne({ where: { IdSucursal: SucursalId } });
    if (!existingSucursal) {
        throw new error_handler_1.HttpError(404, `La sucursal con ID ${SucursalId} no existe.`);
    }
    return existingSucursal;
};
exports.verifySucursal = verifySucursal;
const Listsucursal = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
  SELECT 
    p.idsucursal,
    p.nombre,
    p.central
   FROM sucursal p 
   WHERE estado = 1
  `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.Listsucursal = Listsucursal;
const CreateGastos = async (req, res) => {
    try {
        const { gastos } = req.body;
        if (!gastos || gastos.length === 0) {
            return res.status(400).json({ message: "Debe enviar al menos un horno" });
        }
        for (const gast of gastos) {
            const gasto = new Gastos_1.Gasto();
            const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('Gasto');
            gasto.IdGasto = nuevoId;
            gasto.Fecha = new Date();
            gasto.Periodo = gast.Periodo; // Ej: "2026-04" 🔥 importante
            gasto.Tipo = gast.Tipo; // FIJO | VARIABLE
            gasto.Monto = gast.Monto;
            gasto.Consumo = gast.Consumo;
            gasto.Sucursal = await (0, exports.verifySucursal)({ SucursalId: gast.IdSucursal });
            gasto.Servicio = gast.Servicio; // Ej: Luz, Agua, Gas a domicilio, Internet, Alquiler
            await gasto.save();
        }
        return res.json({ message: 'Se registraron los gastos correctamente' });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.CreateGastos = CreateGastos;
const ListGasto = async (req, res) => {
    try {
        const { id, periodo } = req.query;
        const result = await db_1.AppDataSource.query(`SELECT 
    g.idgasto,
    g.periodo,
    g.tipo,
    g.servicio,
    g.monto,
    g.consumo,
    g.fecha
   FROM gasto g 
   WHERE g.idsucursal = $1 AND g.periodo = $2
  `, [id, periodo]);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.ListGasto = ListGasto;
