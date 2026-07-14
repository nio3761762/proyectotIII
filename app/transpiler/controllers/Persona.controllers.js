"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmail = exports.getPersonas = exports.getClientes = exports.UpdatePersona = exports.deletePersona = exports.CreatePersona = exports.getPersona = exports.updatePersona = exports.SubirPhoto = exports.verifyPersona = void 0;
const Persona_1 = require("../entities/Persona");
const Direccion_controllers_1 = require("./Direccion.controllers");
const Celular_controllers_1 = require("./Celular.controllers");
const error_handler_1 = require("../utils/error.handler");
const Celular_1 = require("../entities/Celular");
const idGenerator_1 = require("../utils/idGenerator");
const Documento_controllers_1 = require("./Documento.controllers");
const db_1 = require("../db");
const Empleado_1 = require("../entities/Empleado");
const Proveedor_1 = require("../entities/Proveedor");
const Usuario_1 = require("../entities/Usuario");
const Cargo_controllers_1 = require("./Cargo.controllers");
const Salario_controllers_1 = require("./Salario.controllers");
const Empleado_controllers_1 = require("./Empleado.controllers");
const TipoProveedor_controllers_1 = require("./TipoProveedor.controllers");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const verifyPersona = async ({ PersonaId }) => {
    const existPersona = await Persona_1.Persona.findOne({ where: { IdPersona: PersonaId } });
    if (!existPersona) {
        throw new error_handler_1.HttpError(404, `La persona con ID ${PersonaId} no existe.`);
    }
    return existPersona;
};
exports.verifyPersona = verifyPersona;
const SubirPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { Foto } = req.body;
        const persona = await Persona_1.Persona.findOneBy({ IdPersona: id });
        if (!persona)
            return res.status(404).json({ message: "La Persona no cuenta con un imagen" });
        persona.Imagen = Foto;
        await persona.save();
        return res.status(200).json({ message: "Se actualizo la imagen del Persona exitosamente" });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ mensaje: "Error del servidor" });
    }
};
exports.SubirPhoto = SubirPhoto;
const updatePersona = async ({ IdPersona, Nombre, ApellidoPaterno, ApellidoMaterno, FechaDeNacimiento, IdGenero, email, IdDireccion, BarrioId, Direccion, Referencia, IdImagen, Url }) => {
    const persona = await (0, exports.verifyPersona)({ PersonaId: IdPersona });
    if (Nombre)
        persona.Nombre = Nombre;
    if (ApellidoPaterno)
        persona.ApellidoPaterno = ApellidoPaterno;
    if (ApellidoMaterno)
        persona.ApellidoMaterno = ApellidoMaterno;
    if (FechaDeNacimiento)
        persona.FechaDeNacimiento = new Date(FechaDeNacimiento);
    persona.FechaActualizacion = new Date();
    if (IdDireccion || BarrioId || Direccion || Referencia)
        persona.Direccion = await (0, Direccion_controllers_1.updateDireccion)({ IdDireccion: IdDireccion, BarrioId: BarrioId, Direccions: Direccion, Referencia: Referencia, Ubicacion: '' });
    persona.Genero = IdGenero;
    persona.Imagen = Url;
    if (email)
        persona.Email = email;
    // if(Salario)
    // nueva.Salario=await verifySalario({SalarioId:Salario});
    await persona.save();
    return persona;
};
exports.updatePersona = updatePersona;
const getPersona = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        p.idpersona,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.email,
        p.imagen,
        p.fechadenacimiento,

        -- 📄 Documento
        json_build_object(
          'iddocumento', d.iddocumento,
          'documento', d.documento,
          'complemento', row_to_json(cmp)
        ) AS documento,

        -- 📱 Celulares
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'idcelular', cel.idcelular,
              'numero', cel.numero
            )
          ) FILTER (WHERE cel.idcelular IS NOT NULL),
          '[]'
        ) AS celulares,

        -- 📍 Dirección
        json_build_object(
          'iddireccion', dir.iddireccion,
          'direccion', dir.direccion,
           'referencia' , dir.referencia,
           'ubicacion' , dir.ubicacion,
          'barrio', row_to_json(b)
        ) AS direccion,

        -- 👤 Usuario + Rol
       json_build_object(
  'idusuario', u.idusuario,
  'roles',
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'idrol', r.idrol,
        'nombre', r.nombre
      )
    ) FILTER (WHERE r.idrol IS NOT NULL),
    '[]'
  )
) AS usuario

      FROM persona p

      LEFT JOIN usuario u 
        ON u.idpersona = p.idpersona

      LEFT JOIN rolusuario ru 
        ON ru.idusuario = u.idusuario

      LEFT JOIN rol r 
        ON r.idrol = ru.idrol

      LEFT JOIN documento d 
        ON d.idpersona = p.idpersona

      LEFT JOIN complemento cmp 
        ON cmp.idcomplemento = d.idcomplemento

      LEFT JOIN celular cel 
        ON cel.idpersona = p.idpersona

      LEFT JOIN direccion dir 
        ON dir.iddireccion = p.iddireccion

      LEFT JOIN barrio b 
        ON b.idbarrio = dir.idbarrio

      WHERE u.idusuario = $1

      GROUP BY 
        p.idpersona, d.iddocumento, cmp.idcomplemento,
        dir.iddireccion, b.idbarrio,
        u.idusuario;
      `, [id]);
        if (result.length === 0) {
            return res.json(null); // o [] si prefieres
        }
        return res.json(result[0]);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getPersona = getPersona;
const CreatePersona = async (req, res) => {
    try {
        const { Personas } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('PER');
        const persona = new Persona_1.Persona();
        persona.IdPersona = nuevoId;
        persona.Nombre = Personas.Nombre;
        persona.ApellidoPaterno = Personas.ApellidoPaterno;
        if (persona.ApellidoMaterno)
            persona.ApellidoMaterno = Personas.ApellidoMaterno;
        if (persona.FechaDeNacimiento)
            persona.FechaDeNacimiento = new Date(Personas.FechaDeNacimiento);
        persona.FechaRegistro = new Date();
        persona.Direccion = await (0, Direccion_controllers_1.createDireccion)({ BarrioId: Personas.IdBarrio, Direccions: Personas.Direccion, Referencia: Personas.Referencia, Ubicacion: Personas?.Ubicacion });
        ;
        persona.Genero = Personas.IdGenero;
        persona.Email = Personas.Email;
        persona.Imagen = Personas.Url;
        persona.Tipo = Personas.Tipo;
        await persona.save();
        if (Personas.Celulares.length > 0)
            for (const celules of Personas.Celulares)
                await (0, Celular_controllers_1.createCelular)({ Numero: celules.Numero, PersonaId: nuevoId });
        if (Personas.Documento.length > 0)
            for (const documento of Personas.Documento)
                await (0, Documento_controllers_1.createDocumento)({ IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: nuevoId });
        // ─── Crear Empleado ───────────────────────────────────────────────
        if (Personas.crearEmpleado) {
            const empId = await (0, idGenerator_1.generarIdSecuencial)('EMPL');
            const empleado = new Empleado_1.Empleado();
            empleado.IdEmpleado = empId;
            empleado.Persona = persona;
            empleado.FechaIngreso = Personas.FechaIngreso ? new Date(Personas.FechaIngreso) : new Date();
            await empleado.save();
            if (Personas.Cargos && Personas.Cargos.length) {
                for (const cargo of Personas.Cargos) {
                    await (0, Cargo_controllers_1.createEmpleadoCargo)({ Idempleado: empId, idcargo: cargo });
                }
            }
            if (Personas.Salario > 0) {
                await (0, Salario_controllers_1.createSalario)({ salario: Personas.Salario, fecha: Personas.fecha, idempleado: empId });
            }
            if (Personas.IdSucursal) {
                await (0, Empleado_controllers_1.createEmpleadoSucursal)({ Idempleado: empId, idSucursal: Personas.IdSucursal });
            }
        }
        // ─── Crear Proveedor ─────────────────────────────────────────────
        if (Personas.crearProveedor) {
            const provId = await (0, idGenerator_1.generarIdSecuencial)('PROV');
            const proveedor = new Proveedor_1.Proveedor();
            proveedor.IdProveedor = provId;
            proveedor.Persona = persona;
            if (Personas.RazonSocial)
                proveedor.RazonSocial = Personas.RazonSocial;
            if (Personas.Nit)
                proveedor.Nit = Personas.Nit;
            if (Personas.IdTipoProveedor) {
                proveedor.Tipoproveedor = await (0, TipoProveedor_controllers_1.verifyTipoproveedor)({ TipoproveedorId: Personas.IdTipoProveedor });
            }
            await proveedor.save();
        }
        // ─── Crear Usuario ───────────────────────────────────────────────
        if (Personas.crearUsuario && Personas.Contrasena) {
            const usuId = await (0, idGenerator_1.generarIdSecuencial)('U');
            const usuario = new Usuario_1.Usuario();
            usuario.IdUsuario = usuId;
            const salt = await bcryptjs_1.default.genSalt(10);
            usuario.Contrasena = await bcryptjs_1.default.hash(Personas.Contrasena, salt);
            usuario.Username = persona.Email;
            usuario.Persona = persona;
            await usuario.save();
        }
        return res.status(200).json({ message: "Se registro los datos del cliente exitosamente",
            idpersona: nuevoId
        });
    }
    catch (error) {
        console.error("Error al obtener los menús del rol:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
exports.CreatePersona = CreatePersona;
const deletePersona = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE persona 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdPersona = $1
   RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Persona no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del Cliente correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Persona:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deletePersona = deletePersona;
const UpdatePersona = async (req, res) => {
    try {
        const { id } = req.params;
        const { Personas } = req.body;
        const persona = await Persona_1.Persona.findOneBy({ IdPersona: id });
        if (!persona)
            return res.status(404).json({ message: "El cliente no existe" });
        // 🔥 normalización simple
        const data = Personas;
        persona.Nombre = data.Nombre ?? data.nombre;
        persona.ApellidoPaterno = data.ApellidoPaterno ?? data.apellidopaterno;
        if (data.ApellidoMaterno ?? data.apellidomaterno)
            persona.ApellidoMaterno = data.ApellidoMaterno ?? data.apellidomaterno;
        // 🔥 FIX fecha
        const fecha = data.FechaDeNacimiento ?? data.fechadenacimiento;
        if (fecha)
            persona.FechaDeNacimiento = new Date(fecha);
        persona.FechaActualizacion = new Date();
        persona.Direccion = await (0, Direccion_controllers_1.updateDireccion)({
            IdDireccion: data.IdDireccion ?? data.iddireccion,
            BarrioId: data.IdBarrio ?? data.idbarrio,
            Direccions: data.Direccion ?? data.direccion,
            Referencia: data?.Referencia ?? data?.referencia,
            Ubicacion: data?.Ubicacion ?? data?.ubicacion
        });
        persona.Genero = data.IdGenero ?? data.idgenero;
        persona.Email = data.Email ?? data.email;
        persona.Imagen = data.Url ?? data.url;
        await persona.save();
        // 🔥 CELULARES (UNIFICADO)
        const celularesInput = data.Celulares ?? data.celulares ?? [];
        if (celularesInput.length > 0) {
            const celularesActuales = await Celular_1.Celular.find({
                where: { Persona: { IdPersona: id } }
            });
            // 🔥 ids enviados correctamente
            const idsEnviados = celularesInput
                .filter((c) => c.IdCelular ?? c.idcelular)
                .map((c) => c.IdCelular ?? c.idcelular);
            // 🔥 eliminar SOLO los que ya no vienen
            for (const celularExistente of celularesActuales) {
                if (!idsEnviados.includes(celularExistente.IdCelular)) {
                    await celularExistente.remove();
                }
            }
            // 🔥 actualizar / crear
            for (const celules of celularesInput) {
                await (0, Celular_controllers_1.updateCelular)({
                    CelularId: celules.IdCelular ?? celules.idcelular,
                    Numero: celules.Numero ?? celules.numero,
                    PersonaId: id
                });
            }
        }
        // 🔥 DOCUMENTO
        const documentosInput = data.Documento ?? data.documento ?? [];
        for (const documento of documentosInput) {
            await (0, Documento_controllers_1.updateDocumento)({
                DocumentoId: documento.IdDocumento ?? documento.iddocumento,
                IdComplemento: documento.Complemento ?? documento.idcomplemento,
                Documentos: documento.Documento ?? documento.documento,
                PersonaId: id
            });
        }
        return res.status(200).json({
            message: "Se actualizó correctamente"
        });
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(500).json({ message: error.message });
    }
};
exports.UpdatePersona = UpdatePersona;
const getClientes = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT 
        p.idpersona,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.estado,
        p.email,
        p.genero,
        p.imagen,
        p.fechadenacimiento,
        p.fecharegistro,

        d.iddocumento,
        d.documento,
        c.idcomplemento,
        c.nombre AS complemento

      FROM persona p
      INNER JOIN documento d 
        ON d.idpersona = p.idpersona
        INNER JOIN complemento c 
        ON c.idcomplemento = d.idcomplemento

      WHERE p.estado = 1
    `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getClientes = getClientes;
const getPersonas = async (req, res) => {
    try {
        const { search = "", estado, page = 1, limit = 8, usuario, rol, proveedor, tipoproveedor, empleado, idcargo } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;
        let where = `WHERE 1=1`;
        const baseParams = [];
        // búsqueda
        const searchText = (search ?? "").toString().trim();
        if (searchText.length > 0) {
            baseParams.push(`%${searchText}%`);
            where += ` AND (
        p.nombre ILIKE $${baseParams.length} OR 
        p.apellidopaterno ILIKE $${baseParams.length} OR 
        p.apellidomaterno ILIKE $${baseParams.length}
      )`;
        }
        // estado
        if (estado !== undefined && estado !== "-1") {
            const estadoNum = Number(estado);
            if (!isNaN(estadoNum)) {
                baseParams.push(estadoNum);
                where += ` AND p.estado = $${baseParams.length}`;
            }
        }
        // 🔥 filtro empleado
        if (empleado !== undefined && empleado !== "-1") {
            if (empleado === "1") {
                where += ` AND EXISTS (
          SELECT 1 FROM empleado e WHERE e.idpersona = p.idpersona
        )`;
            }
            else if (empleado === "0") {
                where += ` AND NOT EXISTS (
          SELECT 1 FROM empleado e WHERE e.idpersona = p.idpersona
        )`;
            }
        }
        // 🔥 filtro cargo
        if (idcargo !== undefined && idcargo !== "-1") {
            baseParams.push(idcargo);
            where += ` AND EXISTS (
        SELECT 1
        FROM empleado e
        JOIN empleado_cargo ec ON ec.idempleado = e.idempleado
        WHERE e.idpersona = p.idpersona
        AND ec.idcargo = $${baseParams.length}
        AND ec.fechafin IS NULL
      )`;
        }
        // usuario
        if (usuario !== undefined && usuario !== "-1") {
            if (usuario === "1") {
                where += ` AND EXISTS (SELECT 1 FROM usuario u WHERE u.idpersona = p.idpersona)`;
            }
            else if (usuario === "0") {
                where += ` AND NOT EXISTS (SELECT 1 FROM usuario u WHERE u.idpersona = p.idpersona)`;
            }
        }
        // rol
        if (rol !== undefined && rol !== "-1" && rol !== "todos") {
            baseParams.push(rol);
            where += ` AND EXISTS (
        SELECT 1 FROM usuario u 
        JOIN rolusuario ru ON u.idusuario = ru.idusuario 
        WHERE u.idpersona = p.idpersona AND ru.idrol = $${baseParams.length}
      )`;
        }
        // proveedor
        if (proveedor !== undefined && proveedor !== "-1") {
            if (proveedor === "1") {
                where += ` AND EXISTS (SELECT 1 FROM proveedor prov WHERE prov.idpersona = p.idpersona)`;
            }
            else if (proveedor === "0") {
                where += ` AND NOT EXISTS (SELECT 1 FROM proveedor prov WHERE prov.idpersona = p.idpersona)`;
            }
        }
        // tipo proveedor
        if (tipoproveedor !== undefined && tipoproveedor !== "-1" && tipoproveedor !== "todos") {
            baseParams.push(tipoproveedor);
            where += ` AND EXISTS (
        SELECT 1 FROM proveedor prov 
        WHERE prov.idpersona = p.idpersona AND prov.idtipoproveedor = $${baseParams.length}
      )`;
        }
        // TOTAL
        const countResult = await db_1.AppDataSource.query(`SELECT COUNT(*) as total FROM persona p ${where}`, baseParams);
        const total = Number(countResult[0].total);
        const totalPages = Math.ceil(total / limitNum);
        const dataParams = [...baseParams];
        dataParams.push(limitNum);
        dataParams.push(offset);
        const result = await db_1.AppDataSource.query(`
      SELECT 
        p.idpersona,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.estado,
        p.email,
        p.genero,
        p.tipo,
        p.imagen,
        p.fechadenacimiento,
        p.fecharegistro,
        p.horaregistro,
        p.fechaactualizacion,

        COALESCE(cel.celulares, '[]'::json) AS celulares,
        COALESCE(doc.documentos, '[]'::json) AS documento,
        dir.direccion,
        usu.usuario,
        prov_rel.proveedor,

        -- 🔥 NUEVO: EMPLEADO COMPLETO
        emp_rel.empleado

      FROM persona p

      -- usuario
      LEFT JOIN LATERAL (
        SELECT json_build_object(
          'idusuario', u.idusuario,
          'estado', u.estado,
          'roles', (
            SELECT json_agg(
              json_build_object(
                'idrol', r.idrol,
                'nombre', r.nombre
              )
            )
            FROM rolusuario ru
            JOIN rol r ON ru.idrol = r.idrol
            WHERE ru.idusuario = u.idusuario
          )
        ) AS usuario
        FROM usuario u
        WHERE u.idpersona = p.idpersona
        LIMIT 1
      ) usu ON true

      -- proveedor
      LEFT JOIN LATERAL (
        SELECT json_build_object(
          'idproveedor', prov.idproveedor,
          'razonsocial', prov.razonsocial,
          'nit' , prov.nit,
          'estado', prov.estado,
          'tipoproveedor', (
            SELECT json_build_object(
              'idtipoproveedor', tp.idtipoproveedor,
              'nombre', tp.nombre
            )
            FROM tipoproveedor tp
            WHERE tp.idtipoproveedor = prov.idtipoproveedor
          )
        ) AS proveedor
        FROM proveedor prov
        WHERE prov.idpersona = p.idpersona
        LIMIT 1
      ) prov_rel ON true

      -- 🔥 EMPLEADO
      LEFT JOIN LATERAL (
        SELECT json_build_object(
          'idempleado', e.idempleado,
          'estado', e.estado,
          'fechaingreso', e.fechaingreso,

          'cargos', (
            SELECT json_agg(
              json_build_object(
                'idcargo', c.idcargo,
                'nombre', c.nombre
              )
            )
            FROM empleado_cargo ec
            JOIN cargo c ON c.idcargo = ec.idcargo
            WHERE ec.idempleado = e.idempleado
            AND ec.fechafin IS NULL
          ),

          'salario', (
            SELECT json_build_object(
              'monto', s.salario
            )
            FROM salario s
            WHERE s.idempleado = e.idempleado
            AND s.fechafin IS NULL
            LIMIT 1
          ),

          'sucursal', (
            SELECT json_build_object(
              'idsucursal', suc.idsucursal,
              'nombre', suc.nombre
            )
            FROM empleado_sucursal es
            JOIN sucursal suc ON suc.idsucursal = es.idsucursal
            WHERE es.idempleado = e.idempleado
            AND es.fechafin IS NULL
            LIMIT 1
          )
        ) AS empleado
        FROM empleado e
        WHERE e.idpersona = p.idpersona
        LIMIT 1
      ) emp_rel ON true

      -- celulares
      LEFT JOIN LATERAL (
        SELECT json_agg(c) AS celulares
        FROM celular c
        WHERE c.idpersona = p.idpersona
      ) cel ON true

      -- documentos
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'iddocumento', d.iddocumento,
            'documento', d.documento
          )
        ) AS documentos
        FROM documento d
        WHERE d.idpersona = p.idpersona
      ) doc ON true

      -- dirección
      LEFT JOIN LATERAL (
        SELECT json_build_object(
          'iddireccion', dir.iddireccion,
          'direccion', dir.direccion
        ) AS direccion
        FROM direccion dir
        WHERE dir.iddireccion = p.iddireccion
        LIMIT 1
      ) dir ON true

      ${where}
      ORDER BY p.idpersona DESC
      LIMIT $${dataParams.length - 1}
      OFFSET $${dataParams.length};
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
exports.getPersonas = getPersonas;
const getEmail = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT p.email
      FROM persona p;
    `);
        return res.json(result); // ya es un array de objetos
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getEmail = getEmail;
