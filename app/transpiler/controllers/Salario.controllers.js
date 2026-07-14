"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSalario = exports.createSalario = void 0;
const Salario_1 = require("../entities/Salario");
const idGenerator_1 = require("../utils/idGenerator");
const Empleado_controllers_1 = require("./Empleado.controllers");
const createSalario = async ({ salario, fecha, idempleado }) => {
    const result = await (0, idGenerator_1.generarIdSecuencial)('SAL');
    const nuevo = new Salario_1.Salario();
    nuevo.IdSalario = result;
    nuevo.Salario = salario;
    nuevo.FechaInicio = fecha ? new Date(fecha) : new Date();
    nuevo.Empleado = await (0, Empleado_controllers_1.verifyEmpleado)(idempleado);
    await nuevo.save();
    return nuevo;
};
exports.createSalario = createSalario;
const updateSalario = async ({ salario, fecha, idempleado }) => {
    const salarioActual = await Salario_1.Salario
        .createQueryBuilder("s")
        .leftJoin("s.Empleado", "e")
        .where("e.idempleado = :idempleado", { idempleado })
        .andWhere("s.fechafin IS NULL")
        .getOne();
    // 🔍 validar si es el mismo salario
    if (salarioActual && Number(salarioActual.Salario) === salario) {
        return salarioActual; // no haces nada
    }
    // 🔴 cerrar salario actual
    if (salarioActual) {
        salarioActual.FechaFin = new Date();
        salarioActual.Estado = 0;
        await salarioActual.save();
    }
    // 🟢 crear nuevo salario
    return await (0, exports.createSalario)({ salario, fecha, idempleado });
};
exports.updateSalario = updateSalario;
