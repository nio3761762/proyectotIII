"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRol = exports.deleteRole = exports.updateRole = exports.getRole = exports.getRoles = exports.getPermisosPorMenu = exports.getPermiso = exports.createRole = exports.updaterole = exports.createrole = void 0;
const Rol_1 = require("../entities/Rol"); // Asumo que la entidad Rol está aquí
const Estado_controllers_1 = require("./Estado.controllers");
const MenuPermiso_1 = require("../entities/MenuPermiso");
// Crear un nuevo rol
const createrole = async ({ Nombre }) => {
    // Verificar si el rol ya existe
    const existingRole = await Rol_1.Rol.findOne({ where: { Nombre } });
    if (existingRole) {
        throw new Error("El rol ya existe");
    }
    const result = await Rol_1.Rol.createQueryBuilder("rol")
        .select("MAX(CAST(SUBSTRING(rol.IdRol FROM '[0-9]+') AS INTEGER))", "ultimoNumero")
        .getRawOne();
    const nuevoNumero = (result?.ultimoNumero || 0);
    const nuevoId = `ROL-${nuevoNumero}`;
    const role = new Rol_1.Rol();
    role.IdRol = nuevoId;
    role.Nombre = Nombre;
    role.FechaRegistro = new Date();
    role.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
    await role.save();
    const RolRelation = await Rol_1.Rol.findOne({
        where: { IdRol: nuevoId },
        relations: ["Estado"]
    });
    return RolRelation;
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
    const RolRelation = await Rol_1.Rol.findOne({
        where: { IdRol: RolId },
        relations: ["Estado"]
    });
    return RolRelation;
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
        let estado;
        try {
            estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        }
        catch (error) {
            if (error instanceof Error)
                return res.status(400).json({ message: error.message });
        }
        // Verificar si ya existe una sucursal con mismo nombre
        if (!estado) {
            return res.status(500).json({ message: "No se pudo encontrar el estado" });
        }
        const ultimorol = await Rol_1.Rol.createQueryBuilder("rol")
            .select("MAX(rol.IdRol)", "ultimoId")
            .getRawOne();
        const nuevoId = `Rol-${(parseInt(ultimorol?.ultimoId?.replace("Rol-", "") || "0") + 1)}`;
        const role = new Rol_1.Rol();
        role.IdRol = nuevoId;
        role.Nombre = Nombre;
        role.FechaRegistro = new Date();
        role.Estado = estado;
        await role.save();
        const RolRelation = await Rol_1.Rol.findOne({
            where: { IdRol: nuevoId },
            relations: ["Estado"]
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
// Obtener todos los roles
const getRoles = async (req, res) => {
    try {
        const roles = await Rol_1.Rol.createQueryBuilder("rol")
            .leftJoinAndSelect("rol.Estado", "estado")
            .leftJoinAndSelect("rol.rolMenus", "rolMenus", "rolMenus.Permitido = :permitido", { permitido: 1 })
            .leftJoinAndSelect("rolMenus.menu", "menu")
            .leftJoinAndSelect("menu.Icono", "icono")
            .leftJoinAndSelect("rolMenus.Permiso", "permiso")
            .getMany();
        return res.json(roles);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
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
        role.IdRol = id;
        role.Nombre = Nombre || role.Nombre;
        role.FechaRegistro = role.FechaRegistro;
        role.FechaActualizacion = new Date();
        await role.save();
        const RolRelation = await Rol_1.Rol.findOne({
            where: { IdRol: id },
            relations: ["Estado"]
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
        const rol = await Rol_1.Rol.findOne({
            where: { IdRol: id },
            relations: ['Estado']
        });
        if (!rol) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const esActivo = rol.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        rol.Estado = nuevoEstado;
        await rol.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del rol correctamente` });
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
