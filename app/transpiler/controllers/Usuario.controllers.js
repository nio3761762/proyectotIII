"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsuariosVentas = exports.getEmpleadosBySucursal = exports.getNoAdmin = exports.getUsuarioSucursal = exports.getUsuarioRol = exports.getUsuario = exports.verificarPin = exports.deleteUsuario = exports.updateUsuario = exports.getUsuarios = exports.createUsuario = exports.CambiarContrasenia = exports.RecuperarContrasena = exports.logout = exports.refreshToken = exports.verifyUsuario = exports.login = exports.ActualizarPassword = void 0;
const Usuario_1 = require("../entities/Usuario");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Persona_controllers_1 = require("./Persona.controllers");
const mailer_1 = require("../config/mailer");
const idGenerator_1 = require("../utils/idGenerator"); // Importar la función
const Persona_1 = require("../entities/Persona");
const db_1 = require("../db");
//
const ActualizarPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const existEmail = await Persona_1.Persona.findOne({ where: { Email: email }, relations: ["Usuario"] });
        if (!existEmail || !existEmail.Usuario) {
            return res.status(404).json({ message: 'Cuenta de Usuario Inexistente' });
        }
        const usuario = existEmail.Usuario;
        // Generar un PIN de 6 dígitos
        const pin = Math.floor(100000 + Math.random() * 9000).toString();
        // Guardar el PIN en el usuario
        usuario.PinRecuperacion = pin;
        await usuario.save();
        // Envía el correo con el PIN
        await mailer_1.transporter.sendMail({
            from: '"Recuperación de contraseña" <antoniofernandezt134@gmail.com>',
            to: email,
            subject: 'Tu PIN de recuperación de contraseña',
            html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Usa el siguiente PIN para continuar:</p>
        <h2 style="text-align: center; font-size: 24px; margin: 20px 0;">${pin}</h2>
        <p>Este PIN es válido por 1 hora.</p>
        <p>Si no fuiste tú quien lo solicitó, puedes ignorar este mensaje.</p>
      `,
        });
        return res.json({
            message: 'Correo enviado con el PIN. Revisa tu bandeja de entrada.',
            PinRecuperar: pin
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al enviar el correo' });
    }
};
exports.ActualizarPassword = ActualizarPassword;
const login = async (req, res) => {
    try {
        const { login, Password } = req.body;
        const usuario = await Usuario_1.Usuario.findOne({ where: { Username: login } });
        if (!usuario) {
            return res.status(401).json({ message: 'Email invalido' });
        }
        // 🔥 VALIDACIÓN DE CONTRASEÑA (PLANO + BCRYPT)
        let passwordValida = false;
        if (usuario.Contrasena && usuario.Contrasena.startsWith("$2")) {
            // contraseña encriptada
            passwordValida = await bcryptjs_1.default.compare(Password, usuario.Contrasena);
        }
        else {
            // contraseña en texto plano
            passwordValida = Password === usuario.Contrasena;
            // 🔥 migración automática a bcrypt
            if (passwordValida) {
                const hash = await bcryptjs_1.default.hash(Password, 10);
                usuario.Contrasena = hash;
                await usuario.save();
            }
        }
        if (!passwordValida) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        // 🔥 VALIDACIÓN PIN
        // if (Pin.toString() !== usuario.Pin.toString()) {
        //   return res.status(401).json({ message: 'PIN inválido' });
        // }
        // 🔥 TOKEN
        const token = jsonwebtoken_1.default.sign({ id: usuario.IdUsuario, Correo: usuario.Username }, 'your_secret_key', { expiresIn: '1d' });
        const Rtoken = jsonwebtoken_1.default.sign({ id: usuario.IdUsuario, Correo: usuario.Username }, 'your_Refresh_secret_key', { expiresIn: '2d' });
        // 🔥 RELACIÓN USUARIO
        const RelatioUsuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: usuario.IdUsuario },
            relations: ["Persona"]
        });
        return res.json({ RelatioUsuario, token, Rtoken });
    }
    catch (error) {
        console.error("Error real:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.login = login;
const verifyUsuario = async ({ UsuarioId }) => {
    const existusuario = await Usuario_1.Usuario.findOne({ where: { IdUsuario: UsuarioId } });
    if (!existusuario) {
        throw new Error(`El usuario con ID ${existusuario} no existe.`);
    }
    return existusuario;
};
exports.verifyUsuario = verifyUsuario;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }
        console.log(refreshToken, 'token a refrescar');
        // Verificar el refresh token
        const payload = jsonwebtoken_1.default.verify(refreshToken, 'your_Refresh_secret_key');
        console.log(payload);
        console.log(payload.id);
        // Buscar al usuario con el id del payload
        const usuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: payload.id },
            relations: ["Persona"]
        });
        console.log('Usuario encontrado:', usuario);
        if (!usuario) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        // Generar nuevo token de acceso
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: usuario.IdUsuario,
            Correo: usuario.Username
        }, 'your_secret_key', { expiresIn: '1d' });
        console.log('Usuario para respuesta:', usuario);
        return res.json({ RelatioUsuario: usuario, token: newAccessToken });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: 'Refresh token expired' });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        // For stateless JWT, the client is responsible for deleting the token.
        // The server can't do much here without a token blacklist.
        return res.json({ message: 'Cerro Exitosamente su sesion' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error during logout' });
    }
};
exports.logout = logout;
const RecuperarContrasena = async (req, res) => {
    try {
        const { login, Password } = req.body; // 'login' puede ser Correo o Usuario
        const email = await Persona_1.Persona.findOne({
            where: { Email: login },
            relations: ["Usuario"]
        });
        if (!email) {
            return res.status(404).json({ message: 'Usuario not found' });
        }
        const usuario = email.Usuario;
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario sin cuenta asociada' });
        }
        // const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        // Enviar correo de confirmación con las nuevas credenciales (SIN ENCRIPTAR)
        await mailer_1.transporter.sendMail({
            from: '"Credenciales Actualizadas" <antoniofernandezt134@gmail.com>',
            to: login, // El email del usuario
            subject: 'Tus credenciales han sido actualizadas',
            html: `
                <p>Hola,${email.Nombre} ${email.ApellidoPaterno}</p>
                <p>Tus credenciales de acceso han sido actualizadas exitosamente.</p>
                <p>Aquí están tus nuevos datos:</p>
                <ul>
                    <li><strong>Nueva Contraseña:</strong> ${Password}</li>
                
                </ul>
                <p>Te recomendamos guardar esta información en un lugar seguro.</p>
                <p>Si no solicitaste este cambio, por favor, contacta a soporte inmediatamente.</p>
            `,
        });
        // Actualizar y encriptar contraseña y PIN, y limpiar el PIN de recuperación
        const salt = await bcryptjs_1.default.genSalt(10);
        usuario.Contrasena = await bcryptjs_1.default.hash(Password, salt);
        // usuario.Pin = Pin;
        usuario.PinRecuperacion = null; // Limpiar el PIN de recuperación
        await usuario.save();
        return res.json({ message: "La contraseña y el PIN se actualizaron y se envió un correo de confirmación." });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error en RecuperarContrasena:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.RecuperarContrasena = RecuperarContrasena;
const CambiarContrasenia = async (req, res) => {
    try {
        const { login, Password } = req.body; // 'login' puede ser Correo o Usuario
        const email = await Persona_1.Persona.findOne({
            where: { Email: login },
            relations: ["Usuario"]
        });
        if (!email) {
            return res.status(404).json({ message: 'Usuario not found' });
        }
        const usuario = email.Usuario;
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario sin cuenta asociada' });
        }
        // const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        // Enviar correo de confirmación con las nuevas credenciales (SIN ENCRIPTAR)
        await mailer_1.transporter.sendMail({
            from: '"Credenciales Actualizadas" <antoniofernandezt134@gmail.com>',
            to: login, // El email del usuario
            subject: 'Tus credenciales han sido actualizadas',
            html: `
                <p>Hola,${email.Nombre} ${email.ApellidoPaterno}</p>
                <p>Tus credenciales de acceso han sido actualizadas exitosamente.</p>
                <p>Aquí están tus nuevos datos:</p>
                <ul>
                    <li><strong>Nueva Contraseña:</strong> ${Password}</li>
                
                </ul>
                <p>Te recomendamos guardar esta información en un lugar seguro.</p>
                <p>Si no solicitaste este cambio, por favor, contacta a soporte inmediatamente.</p>
            `,
        });
        // Actualizar y encriptar contraseña y PIN, y limpiar el PIN de recuperación
        const salt = await bcryptjs_1.default.genSalt(10);
        usuario.Contrasena = await bcryptjs_1.default.hash(Password, salt);
        // usuario.Pin = Pin;
        usuario.PinRecuperacion = null; // Limpiar el PIN de recuperación
        await usuario.save();
        return res.json({ message: "La contraseña y el PIN se actualizaron y se envió un correo de confirmación." });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error en RecuperarContrasena:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.CambiarContrasenia = CambiarContrasenia;
const createUsuario = async (req, res) => {
    try {
        const { Personas } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('U'); // Generar el ID secuencial
        //  const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        const plainPassword = Personas.Contrasena;
        const usuario = new Usuario_1.Usuario();
        usuario.IdUsuario = nuevoId;
        // Encriptar contraseña y PIN
        const persona = await (0, Persona_controllers_1.verifyPersona)({ PersonaId: Personas.IdPersona });
        const salt = await bcryptjs_1.default.genSalt(10);
        usuario.Contrasena = await bcryptjs_1.default.hash(plainPassword, salt);
        usuario.Username = persona.Email;
        usuario.Persona = persona;
        //  usuario.Pin = Pin;
        await usuario.save();
        // Enviar correo de bienvenida con las credenciales
        await mailer_1.transporter.sendMail({
            from: '"Bienvenido a Nuestro Sistema" <antoniofernandezt134@gmail.com>',
            to: persona.Email,
            subject: 'Tus credenciales de acceso',
            html: `
        <p>Hola, ${persona.Nombre} ${persona.ApellidoPaterno}</p>
        <p>¡Bienvenido! Tu cuenta ha sido creada exitosamente.</p>
        <p>Aquí están tus datos de acceso:</p>
        <ul>
            <li><strong>Usuario:</strong> ${persona.Email}</li>
            <li><strong>Contraseña:</strong> ${plainPassword}</li>
           
        </ul>
        <p>Te recomendamos guardar esta información en un lugar seguro.</p>
      `,
        });
        return res.json({ message: "El usuario se registro correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al crear usuario:", error);
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.createUsuario = createUsuario;
const getUsuarios = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
  SELECT 
    u.idusuario,
    u.contrasena,
    u.estado,
    -- persona (OBJETO)
    (
      SELECT json_build_object(
        'idpersona', p.idpersona,
        'nombre', p.nombre,
        'apellidopaterno', p.apellidopaterno,
        'apellidomaterno', p.apellidomaterno,
        'imagen', p.imagen,
        'email', p.email
      )
      FROM persona p
      WHERE u.idpersona = p.idpersona
      AND u.estado = 1
      LIMIT 1
    ) AS persona

  FROM usuario u;
`);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuarios = getUsuarios;
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { Persona } = req.body;
        const usuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: id },
            relations: ['Persona'], // Cargar el email para enviar correo
        });
        if (!usuario)
            return res.status(404).json({ message: 'Usuario no existe' });
        // const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        const salt = await bcryptjs_1.default.genSalt(10);
        // Siempre se actualiza y encripta el PIN
        //  usuario.Pin = Pin
        if (Persona.Contrasena) {
            const plainPassword = Persona.Contrasena;
            // Enviar correo solo si la contraseña cambia
            await mailer_1.transporter.sendMail({
                from: '"Credenciales Actualizadas" <antoniofernandezt134@gmail.com>',
                to: usuario.Persona.Email, // Usar el email existente del usuario
                subject: 'Tus credenciales han sido actualizadas',
                html: `
          <p>Hola, ${usuario.Persona.Nombre} ${usuario.Persona.ApellidoPaterno}</p>
          <p>Tus credenciales de acceso han sido actualizadas exitosamente.</p>
          <p>Aquí están tus nuevos datos:</p>
          <ul>
              <li><strong>Nueva Contraseña:</strong> ${plainPassword}</li>
    
          </ul>
          <p>Te recomendamos guardar esta información en un lugar seguro.</p>
        `,
            });
            // Encriptar la nueva contraseña
            usuario.Contrasena = await bcryptjs_1.default.hash(plainPassword, salt);
        }
        //  usuario.Contrasena = await bcrypt.hash(usuario.Contrasena, salt);
        await usuario.save();
        return res.json({ message: "El usuario se actualizo correctamente" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.updateUsuario = updateUsuario;
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`UPDATE usuario 
   SET estado = CASE WHEN estado = 1 THEN 0 ELSE 1 END
   WHERE IdUsuario = $1
   RETURNING estado AS estado`, [id]);
        // ✅ aquí está el cambio
        if (result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const nuevoEstado = Number(result[0][0].estado);
        const mensajeAccion = nuevoEstado === 1 ? "habilitaron" : "eliminaron";
        return res.json({
            message: `Se ${mensajeAccion} los datos del Usuario correctamente`,
        });
    }
    catch (error) {
        console.error("Error al cambiar el estado del Persona:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteUsuario = deleteUsuario;
const verificarPin = async (req, res) => {
    try {
        const { email, pin } = req.body;
        const existEmail = await Persona_1.Persona.findOne({ where: { Email: email }, relations: ["Usuario"] });
        if (!existEmail || !existEmail.Usuario) {
            return res.status(404).json({ message: 'Cuenta de Usuario Inexistente' });
        }
        const usuario = existEmail.Usuario;
        if (usuario.PinRecuperacion !== pin) {
            return res.status(400).json({ message: 'PIN incorrecto' });
        }
        // Opcional: Limpiar el PIN después de usarlo
        usuario.PinRecuperacion = null;
        await usuario.save();
        return res.json({ message: 'PIN verificado correctamente' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaj: 'Error al verificar el PIN' });
    }
};
exports.verificarPin = verificarPin;
//buscar usuario por id
const getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario_1.Usuario.findOneBy({ IdUsuario: id });
        if (!Usuario_1.Usuario) {
            return res.status(404).json('Usuario not found');
        }
        return res.json({
            //...
            usuario
            // CorreoElectronico: decryptedEmail
        });
        //return res.json(Usuario);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuario = getUsuario;
const getUsuarioRol = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT 
        u.idusuario AS "IdUsuario",
        (
          SELECT json_build_object(
            'NombreCompleto', TRIM(CONCAT_WS(' ', p.nombre, p.apellidopaterno, p.apellidomaterno)),
            'Imagen', p.imagen
          )
          FROM persona p
          WHERE p.idpersona = u.idpersona
        ) AS "Persona",
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'IdRol', r.idrol,
              'Nombre', r.nombre
            )
          ), '[]'::json)
          FROM rolusuario ru
          INNER JOIN rol r ON ru.idrol = r.idrol
          WHERE ru.idusuario = u.idusuario
        ) AS "Roles"
      FROM usuario u
      WHERE u.idusuario = $1;
    `, [id]);
        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Usuario not found' });
        }
        return res.json(result[0]);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuarioRol = getUsuarioRol;
const getUsuarioSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.AppDataSource.query(`
  SELECT
    s.idsucursal,
    s.nombre,
    ad.nombre AS nombreempresa,
    ad.celular,
    ad.email,
    ad.foto,
    d.direccion,
    d.referencia,
    d.ubicacion,
    b.nombre AS nombrebarrio,
    c.nombre AS nombreciudad,
    dp.nombre AS nombredepartamento
  FROM usuario u
  JOIN persona p ON u.idpersona = p.idpersona
  JOIN empleado e ON p.idpersona = e.idpersona 
  JOIN empleado_sucursal es ON es.idempleado = e.idempleado
  JOIN sucursal s ON es.idsucursal = s.idsucursal
  JOIN administrardatos ad ON ad.iddatos = s.iddatos
  JOIN direccion d ON d.iddireccion = s.iddireccion
  JOIN barrio b ON b.idbarrio = d.idbarrio
  JOIN distritos ds ON ds.iddistrito = b.iddistrito
  JOIN ciudad c ON c.idciudad = ds.idciudad
  JOIN departamento dp ON dp.iddepto = c.iddepto
  WHERE u.idusuario = $1
    AND es.estado = 1
    AND es.fechafin IS NULL;
`, [id]);
        if (result.length === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado o sin sucursal activa"
            });
        }
        return res.json(result[0]);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getUsuarioSucursal = getUsuarioSucursal;
const getNoAdmin = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT 
          u.idusuario,
          row_to_json(p) AS persona,
          json_build_object(
              'idrol', r.idrol,
              'nombre', r.nombre
          ) AS rol
      FROM usuario u
      JOIN persona p 
          ON p.idpersona = u.idpersona
      JOIN rolusuario ru 
          ON ru.idusuario = u.idusuario
      JOIN rol r 
          ON r.idrol = ru.idrol
      WHERE r.idrol != 'ROL-1'
      AND NOT EXISTS (
          SELECT 1
          FROM usuariosucursal us
          WHERE us.idusuario = u.idusuario
          AND us.estado = 1
      );
    `);
        //  siempre devuelve array
        return res.json(result.length > 0 ? result : []);
    }
    catch (error) {
        console.error("Error real:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.getNoAdmin = getNoAdmin;
const getEmpleadosBySucursal = async (req, res) => {
    try {
        const { idsucursal } = req.params;
        const result = await db_1.AppDataSource.query(`
      SELECT
        u.idusuario AS "IdUsuario",
        e.idempleado AS "IdEmpleado",
        json_build_object(
          'idpersona', p.idpersona,
          'nombre', p.nombre,
          'apellidopaterno', p.apellidopaterno,
          'apellidomaterno', p.apellidomaterno,
          'imagen', p.imagen,
          'email', p.email,
          'celular', (
            SELECT json_build_object('numero', c.numero)
            FROM celular c
            WHERE c.idpersona = p.idpersona
            LIMIT 1
          )
        ) AS "Persona",
        e.fechaingreso AS "FechaIngreso",
        e.estado AS "Estado",
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'idcargo', c.idcargo,
              'nombre', c.nombre
            )
          ), '[]'::json)
          FROM empleado_cargo ec
          INNER JOIN cargo c ON ec.idcargo = c.idcargo
          WHERE ec.idempleado = e.idempleado
        ) AS "Cargos"
      FROM empleado e
      INNER JOIN persona p ON p.idpersona = e.idpersona
      INNER JOIN empleado_sucursal es ON es.idempleado = e.idempleado
      INNER JOIN usuario u ON u.idpersona = p.idpersona
      WHERE es.idsucursal = $1
        AND es.estado = 1
        AND es.fechafin IS NULL
        AND e.estado = 1
      ORDER BY p.nombre, p.apellidopaterno;
    `, [idsucursal]);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getEmpleadosBySucursal = getEmpleadosBySucursal;
const getUsuariosVentas = async (req, res) => {
    try {
        const result = await db_1.AppDataSource.query(`
      SELECT DISTINCT
        u.idusuario,
        p.nombre,
        p.apellidopaterno,
        p.apellidomaterno,
        p.imagen

      FROM usuario u

      INNER JOIN persona p
        ON p.idpersona = u.idpersona

      INNER JOIN rolusuario ru
        ON ru.idusuario = u.idusuario

      WHERE
        u.estado = 1
        AND ru.idrol IN ('ROL-1', 'ROL-2')

      ORDER BY
        p.nombre,
        p.apellidopaterno
    `);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};
exports.getUsuariosVentas = getUsuariosVentas;
