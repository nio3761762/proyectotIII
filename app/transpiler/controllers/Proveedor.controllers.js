"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProveedor = exports.getProveedor = exports.deleteProveedor = exports.updateProveedor = exports.getProveedores = exports.createProveedor = void 0;
const Proveedor_1 = require("../entities/Proveedor");
const Persona_controllers_1 = require("./Persona.controllers");
const idGenerator_1 = require("../utils/idGenerator"); // Importar la función
const TipoProveedor_controllers_1 = require("./TipoProveedor.controllers");
const error_handler_1 = require("../utils/error.handler");
const db_1 = require("../db");
const createProveedor = async (req, res) => {
    try {
        const { Personas } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PROV'); // Generar el ID secuencial
        const proveedor = new Proveedor_1.Proveedor();
        proveedor.IdProveedor = nuevoId;
        proveedor.Persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: Personas.IdPersona });
        if (Personas.RazonSocial)
            proveedor.RazonSocial = Personas.RazonSocial;
        if (Personas.Nit)
            proveedor.Nit = Personas.Nit;
        proveedor.Tipoproveedor = await (0, TipoProveedor_controllers_1.verifyTipoproveedor)({ TipoproveedorId: Personas.IdTipoProveedor });
        await proveedor.save();
        return res.json({ message: "El Proveedor se registro correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear Proveedor:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createProveedor = createProveedor;
const getProveedores = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
  SELECT 
  pr.idproveedor,
  pr.razonsocial,
  pr.nit,
  pr.estado,
  p.nombre,
  p.apellidopaterno,
  p.apellidomaterno,
  p.imagen,
  p.email,
  tp.nombre AS Tiponombre
FROM proveedor pr, persona p, tipoproveedor tp 
WHERE  pr.idpersona = p.idpersona AND pr.idtipoproveedor = tp.idtipoproveedor AND pr.estado = 1; 
`);
        return res.json({ result });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProveedores = getProveedores;
const updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { Persona } = req.body;
        const proveedor = await Proveedor_1.Proveedor.findOne({
            where: { IdProveedor: id },
            relations: ['Persona'],
        });
        if (!proveedor)
            return res.status(404).json({ message: 'Proveedor no existe' });
        if (Persona.RazonSocial)
            proveedor.RazonSocial = Persona.RazonSocial;
        proveedor.Tipoproveedor = await (0, TipoProveedor_controllers_1.verifyTipoproveedor)({ TipoproveedorId: Persona.IdTipoProveedor });
        if (Persona.Nit)
            proveedor.Nit = Persona.Nit;
        await proveedor.save();
        return res.json({ message: "El Proveedor se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateProveedor = updateProveedor;
const deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE proveedor 
      SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
      WHERE IdProveedor = $1
      RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        return res.json({ message: `Se ${mensajeAccion} los datos del Proveedor correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Proveedor:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteProveedor = deleteProveedor;
//buscar Proveedor por id
const getProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const proveedor = await Proveedor_1.Proveedor.findOne({ where: { IdProveedor: id },
            relations: ["Persona", "Tipoproveedor",
                "Persona.Celulares", "Persona.Documento",
                "Persona.Documento.Tipodocumento", "Persona.Documento.Complemento",
                "Persona.Direccion.Barrio"], });
        if (proveedor) {
            return res.status(404).json('Proveedor not found');
        }
        return res.json({
            //...
            proveedor
            // CorreoElectronico: decryptedEmail
        });
        //return res.json(Proveedor);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getProveedor = getProveedor;
const verifyProveedor = async ({ TipoproveedorId }) => {
    const existTipoproveedor = await Proveedor_1.Proveedor.findOne({ where: { IdProveedor: TipoproveedorId } });
    if (!existTipoproveedor) {
        throw new error_handler_1.HttpError(404, `El Proveedor con ID ${TipoproveedorId} no existe.`);
    }
    return existTipoproveedor;
};
exports.verifyProveedor = verifyProveedor;
