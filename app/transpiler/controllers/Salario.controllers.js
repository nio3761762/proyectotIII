"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSalario = exports.createSalario = exports.verifySalarioId = exports.verifySalario = exports.getSalario = void 0;
const Salario_1 = require("../entities/Salario");
const getSalario = async (req, res) => {
    try {
        const salarios = await Salario_1.Salario.find();
        return res.json(salarios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getSalario = getSalario;
const verifySalario = async ({ SalarioId }) => {
    const existSalario = await Salario_1.Salario.findOne({ where: { Salario: Number(SalarioId) } });
    if (!existSalario) {
        return await (0, exports.createSalario)({ salario: Number(SalarioId) });
    }
    else
        return existSalario;
};
exports.verifySalario = verifySalario;
const verifySalarioId = async ({ SalarioId }) => {
    const existSalario = await Salario_1.Salario.findOne({ where: { IdSalario: SalarioId } });
    if (!existSalario) {
        throw new Error(`El salario con ID ${existSalario} no existe.`);
    }
    return existSalario;
};
exports.verifySalarioId = verifySalarioId;
const createSalario = async ({ salario }) => {
    const result = await Salario_1.Salario.createQueryBuilder("salario")
        .select("MAX(CAST(SUBSTRING(Salario.IdSalario FROM '[0-9]+') AS INTEGER))", "ultimoNumero")
        .getRawOne();
    const nuevoNumero = (result?.ultimoNumero || 0) + 1;
    const nuevoId = `SAL-${nuevoNumero}`;
    const nuevo = new Salario_1.Salario();
    nuevo.IdSalario = nuevoId;
    nuevo.Salario = salario;
    await nuevo.save();
    return nuevo;
};
exports.createSalario = createSalario;
const updateSalario = async ({ SalarioId, salario }) => {
    const existSalario = await (0, exports.verifySalarioId)({ SalarioId });
    if (!existSalario) {
        throw new Error(`El salario con ID ${existSalario} no existe.`);
    }
    existSalario.IdSalario = SalarioId;
    existSalario.Salario = salario ?? existSalario.Salario;
    await existSalario.save();
    return existSalario;
};
exports.updateSalario = updateSalario;
