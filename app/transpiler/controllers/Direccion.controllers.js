"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerDIreccion = exports.verifyDireccion = exports.updateDireccion = exports.createDireccion = void 0;
const DIreccion_1 = require("../entities/DIreccion");
const Barrio_1 = require("../entities/Barrio");
const idGenerator_1 = require("../utils/idGenerator");
const Barrio_controllers_1 = require("./Barrio.controllers");
// export const createDireccion = async (req: Request, res: Response) => {
//   try {
//     const { IdPersona, IdBarrio, Direccions } = req.body;
//     const ultima = await Direccion.createQueryBuilder("direccion")
//       .select("MAX(direccion.IdDireccion)", "ultimoId")
//       .getRawOne();
//     const nuevoId = `DIR-${(parseInt(ultima?.ultimoId?.replace("DIR-", "") || "0") + 1)}`;
//     const direccion = new Direccion();
//     direccion.IdDireccion = nuevoId;
//     direccion.IdPersona = IdPersona || null;
//     direccion.IdBarrio = IdBarrio;
//     direccion.Direccions = Direccions;
//     await direccion.save();
//     return res.status(201).json(direccion);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };
// export const getDirecciones = async (req: Request, res: Response) => {
//   try {
//     const direcciones = await Direccion.find({ relations: ["Barrio", "Persona", "sucursal"] });
//     return res.json(direcciones);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };
// export const updateDireccion = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { IdPersona, IdBarrio, Direccions } = req.body;
//     const direccion = await Direccion.findOne({ where: { IdDireccion: id } });
//     if (!direccion) {
//       return res.status(404).json({ message: "Dirección no encontrada" });
//     }
//     direccion.IdPersona = IdPersona !== undefined ? IdPersona : direccion.IdPersona;
//     direccion.IdBarrio = IdBarrio !== undefined ? IdBarrio : direccion.IdBarrio;
//     direccion.Direccions = Direccions !== undefined ? Direccions : direccion.Direccions;
//     await direccion.save();
//     return res.json(direccion);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };
// export const getDireccionById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const direccion = await Direccion.findOne({
//       where: { IdDireccion: id },
//       relations: ["Barrio", "Persona", "sucursal"],
//     });
//     if (!direccion) {
//       return res.status(404).json({ message: "Dirección no encontrada" });
//     }
//     return res.json(direccion);
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// };
const createDireccion = async ({ BarrioId, Direccions, Referencia, Ubicacion }) => {
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('DIR');
    const direccion = new DIreccion_1.Direccion();
    direccion.IdDireccion = nuevoId;
    if (BarrioId)
        direccion.Barrio = await (0, Barrio_controllers_1.verifyBarrio)({ BarrioId: BarrioId });
    if (Direccions)
        direccion.Direccion = Direccions;
    if (Referencia)
        direccion.Referencia = Referencia;
    if (Ubicacion)
        direccion.Ubicacion = Ubicacion;
    await direccion.save();
    return direccion;
};
exports.createDireccion = createDireccion;
const updateDireccion = async ({ IdDireccion, BarrioId, Direccions, Referencia, Ubicacion }) => {
    // Buscar dirección existente
    if (IdDireccion) {
        const existBarrio = await Barrio_1.Barrio.findOne({ where: { IdBarrio: BarrioId } });
        if (!existBarrio) {
            throw new Error("No existe el barrio solicitado");
        }
        const direccion = await DIreccion_1.Direccion.findOne({ where: { IdDireccion } });
        if (!direccion) {
            throw new Error(`La dirección con ID ${IdDireccion} no existe.`);
        }
        direccion.IdDireccion = IdDireccion;
        direccion.Barrio = existBarrio;
        if (Direccions)
            direccion.Direccion = Direccions;
        if (Referencia)
            direccion.Referencia = Referencia;
        if (Ubicacion)
            direccion.Ubicacion = Ubicacion;
        await direccion.save();
        return direccion;
    }
    return (0, exports.createDireccion)({ BarrioId, Direccions, Referencia, Ubicacion });
};
exports.updateDireccion = updateDireccion;
const verifyDireccion = async ({ IdDireccion }) => {
    const existDireccion = await DIreccion_1.Direccion.findOne({ where: { IdDireccion: IdDireccion } });
    if (!existDireccion) {
        throw new Error(`El Barrio con ID ${existDireccion} no existe.`);
    }
    return existDireccion;
};
exports.verifyDireccion = verifyDireccion;
const obtenerDIreccion = async (req, res) => {
    try {
        const { id } = req.params;
        const direccion = await DIreccion_1.Direccion.findOne({
            where: { IdDireccion: id },
            relations: ["Barrio", "Barrio.Distrito", "Barrio.Distrito.Ciudad", "Barrio.Distrito.Ciudad.Departamento", "Barrio.Distrito.Ciudad.Departamento.Pais"]
        });
        return res.json(direccion);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.obtenerDIreccion = obtenerDIreccion;
