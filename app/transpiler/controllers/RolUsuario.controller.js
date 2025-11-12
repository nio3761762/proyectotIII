"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignarupdateRol = exports.AsignarRol = void 0;
const RolUsuario_1 = require("../entities/RolUsuario");
const Rol_controllers_1 = require("./Rol.controllers");
const Usuario_controllers_1 = require("./Usuario.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const AsignarRol = async (req, res) => {
    try {
        const { UsuarioId, RolId } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('RU');
        const role = new RolUsuario_1.Rolusuario();
        role.IdRolUsuario = nuevoId;
        role.Usuario = await (0, Usuario_controllers_1.verifyUsuario)({ UsuarioId: UsuarioId });
        role.FechaRegistro = new Date();
        role.Rol = await (0, Rol_controllers_1.verifyRol)({ RolId: RolId });
        await role.save();
        return res.status(201).json({ message: "El rol se asigno al usuario exitosamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.AsignarRol = AsignarRol;
const AsignarupdateRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { RolId } = req.body;
        const RolUsuario = await RolUsuario_1.Rolusuario.findOne({
            where: {
                Usuario: { IdUsuario: id }
            },
            relations: ["Rol"]
        });
        if (!RolUsuario)
            return res.status(404).json({ message: "El usuario no cuenta con un rol asignado" });
        if (RolUsuario.Rol && RolUsuario.Rol.IdRol === RolId) {
            return res.status(200).json({ message: "El rol ya está asignado al usuario." });
        }
        RolUsuario.IdRolUsuario = RolUsuario.IdRolUsuario;
        RolUsuario.Rol = await (0, Rol_controllers_1.verifyRol)({ RolId });
        RolUsuario.FechaActualizacion = new Date();
        RolUsuario.save();
        return res.status(200).json({ message: "Se actualizo el rol del usuario exitosamente" });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ mensaje: "Error del servidor" });
    }
};
exports.AsignarupdateRol = AsignarupdateRol;
//   export const AsignarupdateRol = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params; // ID del usuario
//     const { RolId } = req.body; // Nuevo rol que se quiere asignar
//     // Buscar la relación usuario-rol
//     const RolUsuario = await Rolusuario.findOne({
//       where: {
//         IdUsuario: id,
//       },
//     });
//     if (!RolUsuario) {
//       return res.status(404).json({ message: "El usuario no cuenta con un rol asignado" });
//     }
//     // Verificar si ya tiene el mismo rol asignado
//     if (RolUsuario.Rol.IdRol === RolId) {
//       return res.status(200).json({ message: "El rol ya está asignado al usuario, no se requiere actualización" });
//     }
//     // Si el rol es diferente, se actualiza
//     RolUsuario.IdRol = RolId;
//     RolUsuario.FechaActualizacion = new Date();
//     await RolUsuario.save(); // ¡OJO! No olvides el `await` aquí
//     return res.status(200).json({ message: "Se actualizó el rol del usuario exitosamente" });
//   } catch (error) {
//     console.error("Error al actualizar el rol del usuario:", error);
//     return res.status(500).json({ mensaje: "Error del servidor" });
//   }
// };
