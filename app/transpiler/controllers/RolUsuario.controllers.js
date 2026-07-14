"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignarupdateRol = exports.DeleteRol = exports.AsignarRol = void 0;
const RolUsuario_1 = require("../entities/RolUsuario");
const Rol_controllers_1 = require("./Rol.controllers");
const idGenerator_1 = require("../utils/idGenerator");
const db_1 = require("../db");
const AsignarRol = async (req, res) => {
    try {
        const { UsuarioId, RolesAsignar = [], RolesQuitar = [] } = req.body;
        await db_1.AppDataSource.query('BEGIN');
        // 🔹 1. ELIMINAR roles
        if (RolesQuitar.length > 0) {
            await db_1.AppDataSource.query(`
        DELETE FROM rolusuario
        WHERE idusuario = $1
        AND idrol = ANY($2)
      `, [UsuarioId, RolesQuitar]);
        }
        // 🔹 2. INSERTAR roles
        for (const rolId of RolesAsignar) {
            const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('RU');
            await db_1.AppDataSource.query(`
        INSERT INTO rolusuario (
          idrolusuario,
          idusuario,
          idrol,
          fecharegistro
        )
        VALUES ($1, $2, $3, NOW())
      `, [nuevoId, UsuarioId, rolId]);
        }
        await db_1.AppDataSource.query('COMMIT');
        return res.json({
            message: "Roles actualizados correctamente"
        });
    }
    catch (error) {
        await db_1.AppDataSource.query('ROLLBACK');
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.AsignarRol = AsignarRol;
const DeleteRol = async (req, res) => {
    try {
        const { idu, idr } = req.params;
        const result = await db_1.AppDataSource.query(`
      DELETE FROM rolusuario
      WHERE idusuario = $1 AND idrol = $2
      RETURNING *;
    `, [idu, idr]);
        if (result.length === 0) {
            return res.status(404).json({ message: "No se encontró la relación" });
        }
        return res.json({ message: "Rol eliminado correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.DeleteRol = DeleteRol;
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
