"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getobtenerMenus = exports.verifyRol = exports.deleteRole = exports.updateRole = exports.getRole = exports.getRoles = exports.filRoles = exports.getPermisosPorMenu = exports.getPermiso = exports.createRole = exports.updaterole = exports.createrole = void 0;
const Rol_1 = require("../entities/Rol"); // Asumo que la entidad Rol está aquí
const MenuPermiso_1 = require("../entities/MenuPermiso");
const db_1 = require("../db");
const idGenerator_1 = require("../utils/idGenerator");
// Crear un nuevo rol
const createrole = async ({ Nombre }) => {
    // Verificar si el rol ya existe
    const existingRole = await Rol_1.Rol.findOne({ where: { Nombre } });
    if (existingRole) {
        throw new Error("El rol ya existe");
    }
    const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('Rol');
    const role = new Rol_1.Rol();
    role.IdRol = nuevoId;
    role.Nombre = Nombre;
    role.FechaRegistro = new Date();
    await role.save();
    return role;
};
exports.createrole = createrole;
const updaterole = async ({ RolId, Nombre }) => {
    // Verificar si el rol ya existe
    const existingRole = await (0, exports.verifyRol)({ RolId });
    if (!existingRole) {
        throw new Error("No existe registro del rol");
    }
    existingRole.IdRol = RolId;
    existingRole.Nombre = Nombre ?? existingRole.Nombre;
    existingRole.FechaActualizacion = new Date();
    await existingRole.save();
    return existingRole;
};
exports.updaterole = updaterole;
const createRole = async (req, res) => {
    try {
        const { Nombre } = req.body;
        // Verificar si el rol ya existe
        const existingRole = await Rol_1.Rol.findOne({ where: { Nombre } });
        if (existingRole) {
            return res.status(400).json({ message: "El rol ya existe" });
        }
        try {
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        // Verificar si ya existe una sucursal con mismo nombre
        const ultimorol = await Rol_1.Rol.createQueryBuilder("rol")
            .select("MAX(rol.IdRol)", "ultimoId")
            .getRawOne();
        const nuevoId = `Rol-${(parseInt(ultimorol?.ultimoId?.replace("Rol-", "") || "0") + 1)}`;
        const role = new Rol_1.Rol();
        role.IdRol = nuevoId;
        role.Nombre = Nombre;
        role.FechaRegistro = new Date();
        await role.save();
        const RolRelation = await Rol_1.Rol.findOne({
            where: { IdRol: nuevoId }
        });
        return res.status(201).json(RolRelation);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createRole = createRole;
const getPermiso = async (req, res) => {
    try {
        const permiso = await MenuPermiso_1.Menupermiso.find({ relations: ["menu", "Permiso"] });
        return res.json(permiso);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPermiso = getPermiso;
const getPermisosPorMenu = async (req, res) => {
    const { idMenu } = req.params;
    try {
        const permisos = await MenuPermiso_1.Menupermiso.find({
            where: {
                menu: { IdMenu: idMenu }
            },
            relations: ["menu", "Permiso"]
        });
        return res.json(permisos.map(p => p.Permiso));
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getPermisosPorMenu = getPermisosPorMenu;
const filRoles = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'idrol', b.IdRol,
            'nombre', b.Nombre
          )
        ),
        '[]'::json
      ) AS roles
      FROM Rol b;
    `);
        return res.json(result[0].roles);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.filRoles = filRoles;
// Obtener todos los roles
const getRoles = async (req, res) => {
    try {
        const { search, estado, page = 1, limit = 8 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchParam = typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : null;
        const estadoParam = estado !== undefined && estado !== ""
            ? Number(estado)
            : null;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        r.idrol,
        r.nombre,
        r.fecharegistro,
        r.fechaactualizacion,
        r.estado,
        COUNT(*) OVER() AS total,
        COALESCE(
          json_agg(
            json_build_object(
              'IdRolMenu', rm.idrolmenu,
              'FechaRegistro', rm.fecharegistro,
              'Permitido', rm.permitido,
              'menu', json_build_object(
                'IdMenu', m.idmenu,
                'Nombre', m.nombre,
                'Visible', m.visible,
                'Icono', json_build_object(
                  'IdIcono', i.idicono,
                  'Icono', i.icono
                )
              ),
              'Permiso', json_build_object(
                'IdPermiso', p.idpermiso,
                'Nombre', p.nombre
              )
            )
          ) FILTER (WHERE rm.idrolmenu IS NOT NULL),
          '[]'
        ) AS "rolMenus"
      FROM rol r
      LEFT JOIN rolmenu rm 
        ON rm.idrol = r.idrol AND rm.permitido = 1
      LEFT JOIN menu m 
        ON m.idmenu = rm.idmenu
      LEFT JOIN icono i 
        ON i.idicono = m.idicono
      LEFT JOIN permiso p 
        ON p.idpermiso = rm.idpermiso
      WHERE 
        ($1::text IS NULL OR r.nombre ILIKE '%' || $1::text || '%')
      AND ($2::int IS NULL OR r.estado = $2)
      GROUP BY r.idrol
      ORDER BY r.idrol
      LIMIT $3 OFFSET $4;
      `, [
            searchParam,
            estadoParam,
            Number(limit),
            offset
        ]);
        // 🔥 sin resultados
        if (result.length === 0) {
            return res.json({
                total: 0,
                page: Number(page),
                limit: Number(limit),
                data: []
            });
        }
        return res.json({
            total: result[0].total,
            page: Number(page),
            limit: Number(limit),
            data: result
        });
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getRoles = getRoles;
// Obtener un rol por ID
const getRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Rol_1.Rol.findOne({ where: { IdRol: id } });
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        return res.json(role);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getRole = getRole;
// Actualizar un rol
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre } = req.body;
        const role = await Rol_1.Rol.findOne({ where: { IdRol: id } });
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        if (Nombre)
            role.Nombre = Nombre;
        role.FechaRegistro = role.FechaRegistro;
        role.FechaActualizacion = new Date();
        await role.save();
        const RolRelation = await Rol_1.Rol.findOne({
            where: { IdRol: id },
        });
        return res.json(RolRelation);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateRole = updateRole;
// Eliminar (desactivar) un rol
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE rol 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdRol = $1
   RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Rol no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del rol correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteRole = deleteRole;
const verifyRol = async ({ RolId }) => {
    const existRol = await Rol_1.Rol.findOne({ where: { IdRol: RolId } });
    if (!existRol) {
        throw new Error(`El rol con ID ${existRol} no existe.`);
    }
    return existRol;
};
exports.verifyRol = verifyRol;
const getobtenerMenus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'menu', json_build_object(
              'IdMenu', m.idmenu,
              'Nombre', m.nombre,
              'Visible', m.visible,
              'Enlace', json_build_object(
                'IdEnlace', e.idenlace,
                'Enlace', e.enlace
              )
            ),
            'permisos', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'IdPermiso', p.idpermiso,
                  'Nombre', p.nombre
                )
              ), '[]'::json)
              FROM rolmenu rm2
              INNER JOIN permiso p ON rm2.idpermiso = p.idpermiso
              WHERE rm2.idrol = $1 
                AND rm2.idmenu = m.idmenu 
                AND rm2.permitido = 1
            )
          )
        ),
        '[]'::json
      ) AS "Menus"
      FROM (
        SELECT DISTINCT idmenu
        FROM rolmenu
        WHERE idrol = $1 AND permitido = 1
      ) rm
      INNER JOIN menu m ON rm.idmenu = m.idmenu
      LEFT JOIN enlace e ON m.idenlace = e.idenlace;
    `, [id]);
        return res.json(result[0].Menus);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getobtenerMenus = getobtenerMenus;
