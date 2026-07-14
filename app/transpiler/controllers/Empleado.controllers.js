"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmpleadosVendedores = exports.deleteEmpleado = exports.UpdateEmpleado = exports.CreateEmpleado = exports.SalarioEmpleado = exports.getEmpleados = exports.verifyEmpleado = exports.updateEmpleadoSucursal = exports.createEmpleadoSucursal = void 0;
const db_1 = require("../db");
const idGenerator_1 = require("../utils/idGenerator");
const Empleado_1 = require("../entities/Empleado");
const Persona_controllers_1 = require("./Persona.controllers");
const error_handler_1 = require("../utils/error.handler");
const EmpleadoSucursal_1 = require("../entities/EmpleadoSucursal");
const Sucursal_controllers_1 = require("./Sucursal.controllers");
const Salario_controllers_1 = require("./Salario.controllers");
const Cargo_controllers_1 = require("./Cargo.controllers");
const Salario_1 = require("../entities/Salario");
const createEmpleadoSucursal = async ({ Idempleado, idSucursal }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('SCEMP');
    const persona = new EmpleadoSucursal_1.EmpleadoSucursal();
    persona.IdEmpleadoSucursal = nuevoId;
    persona.Empleado = await (0, exports.verifyEmpleado)(Idempleado);
    if (idSucursal)
        persona.Sucursal = await (0, Sucursal_controllers_1.verifySucursal)({ SucursalId: idSucursal });
    persona.FechaInicio = new Date();
    await persona.save();
    return persona;
};
exports.createEmpleadoSucursal = createEmpleadoSucursal;
const updateEmpleadoSucursal = async ({ Idempleado, idSucursal, }) => {
    // sucursal activa actual
    const existPersona = await EmpleadoSucursal_1.EmpleadoSucursal
        .createQueryBuilder("es")
        .leftJoinAndSelect("es.Sucursal", "s")
        .leftJoin("es.Empleado", "e")
        .where("e.idempleado = :idEmpleado", {
        idEmpleado: Idempleado,
    })
        .andWhere("es.fechafin IS NULL")
        .getOne();
    // si no existe relación activa
    if (!existPersona) {
        return await (0, exports.createEmpleadoSucursal)({
            Idempleado,
            idSucursal,
        });
    }
    // si ya tiene la misma sucursal
    if (existPersona.Sucursal.IdSucursal === idSucursal) {
        return existPersona;
    }
    // cerrar relación actual
    existPersona.FechaFin = new Date();
    existPersona.Estado = 0;
    await existPersona.save();
    // crear nueva relación
    return await (0, exports.createEmpleadoSucursal)({
        Idempleado,
        idSucursal,
    });
};
exports.updateEmpleadoSucursal = updateEmpleadoSucursal;
const verifyEmpleado = async (IdEmpleado) => {
    const existPersona = await Empleado_1.Empleado.findOne({ where: { IdEmpleado: IdEmpleado } });
    if (!existPersona) {
        throw new error_handler_1.HttpError(404, `El empleado con ID ${IdEmpleado} no existe.`);
    }
    return existPersona;
};
exports.verifyEmpleado = verifyEmpleado;
const getEmpleados = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        e.idempleado,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.imagen,
        c.nombre AS cargo
      FROM empleado e
      INNER JOIN persona p 
        ON e.idpersona = p.idpersona
      INNER JOIN empleado_cargo ec 
        ON ec.idempleado = e.idempleado
      INNER JOIN cargo c 
        ON c.idcargo = ec.idcargo
      INNER JOIN empleado_sucursal es 
        ON es.idempleado = e.idempleado
      WHERE 
        ec.estado = 1
        AND es.estado = 1
        AND es.idsucursal = $1
        AND ec.idcargo IN ('CAR-004', 'CAR-001')
      `, [id]);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};
exports.getEmpleados = getEmpleados;
const SalarioEmpleado = async (IdEmpleado) => {
    const salario = await Salario_1.Salario.findOne({
        where: { Estado: 1,
            Empleado: { IdEmpleado: IdEmpleado }
        },
    });
    if (!salario) {
        throw new error_handler_1.HttpError(404, `El empleado con ID ${IdEmpleado} no existe.`);
    }
    return salario.Salario;
};
exports.SalarioEmpleado = SalarioEmpleado;
const CreateEmpleado = async (req, res) => {
    try {
        const { Personas } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('EMPL');
        console.log(Personas);
        const persona = new Empleado_1.Empleado();
        persona.IdEmpleado = nuevoId;
        persona.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: Personas.IdPersona });
        persona.FechaIngreso = Personas.FechaIngreso;
        console.log(Personas);
        await persona.save();
        if (Personas.Cargos && Personas.Cargos.length) {
            for (const cargo of Personas.Cargos) {
                await (0, Cargo_controllers_1.createEmpleadoCargo)({
                    Idempleado: nuevoId,
                    idcargo: cargo
                });
            }
        }
        if (Personas.Salario > 0)
            await (0, Salario_controllers_1.createSalario)({ salario: Personas.Salario, fecha: Personas.fecha, idempleado: nuevoId });
        if (Personas.IdSucursal)
            await (0, exports.createEmpleadoSucursal)({ Idempleado: nuevoId, idSucursal: Personas.IdSucursal });
        return res.status(200).json({ message: "Se registro los datos del cliente exitosamente" });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
exports.CreateEmpleado = CreateEmpleado;
const UpdateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { Personas } = req.body;
        console.log(Personas);
        const existPersona = await Empleado_1.Empleado.findOneBy({
            IdEmpleado: id,
        });
        if (!existPersona) {
            return res.status(404).json({
                message: "El empleado no existe",
            });
        }
        existPersona.FechaIngreso = Personas.FechaIngreso;
        // cargos actuales activos
        const cargosActuales = await db_1.AppDataSource.query(`
      SELECT idcargo
      FROM empleado_cargo
      WHERE idempleado = $1
      AND fechafin IS NULL
      `, [id]);
        const cargosActualesIds = cargosActuales.map((c) => c.idcargo);
        const nuevosCargos = Personas.Cargos || [];
        // cargos que deben cerrarse
        const cargosEliminar = cargosActualesIds.filter((c) => !nuevosCargos.includes(c));
        // cargos nuevos que deben agregarse
        const cargosAgregar = nuevosCargos.filter((c) => !cargosActualesIds.includes(c));
        // cerrar cargos eliminados
        if (cargosEliminar.length > 0) {
            await db_1.AppDataSource.query(`
        UPDATE empleado_cargo
        SET fechafin = CURRENT_DATE,
            estado = 0
        WHERE idempleado = $1
        AND idcargo = ANY($2)
        AND fechafin IS NULL
        `, [id, cargosEliminar]);
        }
        // agregar nuevos cargos
        for (const cargo of cargosAgregar) {
            await (0, Cargo_controllers_1.createEmpleadoCargo)({
                Idempleado: id,
                idcargo: cargo,
            });
        }
        await existPersona.save();
        await (0, Salario_controllers_1.updateSalario)({
            salario: Personas.Salario,
            fecha: Personas.fecha,
            idempleado: id,
        });
        await (0, exports.updateEmpleadoSucursal)({
            Idempleado: id,
            idSucursal: Personas.IdSucursal,
        });
        return res.status(200).json({
            message: "Empleado actualizado correctamente",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error del servidor",
        });
    }
};
exports.UpdateEmpleado = UpdateEmpleado;
const deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE empleado 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdEmpleado = $1
   RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del empleado correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Persona:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteEmpleado = deleteEmpleado;
const getEmpleadosVendedores = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT 
        e.idempleado,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.imagen,
        c.nombre AS cargo
      FROM empleado e
      INNER JOIN persona p 
        ON e.idpersona = p.idpersona
      INNER JOIN empleado_cargo ec 
        ON ec.idempleado = e.idempleado
      INNER JOIN cargo c 
        ON c.idcargo = ec.idcargo
      WHERE 
        ec.estado = 1
        AND ec.idcargo IN ('CAR-003', 'CAR-001')
      `);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};
exports.getEmpleadosVendedores = getEmpleadosVendedores;
