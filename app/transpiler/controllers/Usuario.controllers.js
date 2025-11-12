"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNoAdmin = exports.getUsuarioSucursal = exports.getUsuarioRol = exports.getUsuario = exports.verificarPin = exports.deleteUsuario = exports.updateUsuario = exports.getUsuarios = exports.createUsuario = exports.RecuperarContrasena = exports.logout = exports.refreshToken = exports.verifyUsuario = exports.login = exports.ActualizarPassword = void 0;
const Usuario_1 = require("../entities/Usuario");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Estado_controllers_1 = require("./Estado.controllers");
const Email_1 = require("../entities/Email");
const Persona_controllers_1 = require("./Persona.controllers");
const mailer_1 = require("../config/mailer");
const idGenerator_1 = require("../utils/idGenerator"); // Importar la función
const Celular_controllers_1 = require("./Celular.controllers");
const Documento_controllers_1 = require("./Documento.controllers");
const Celular_1 = require("../entities/Celular");
const ActualizarPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const existEmail = await Email_1.Email.findOne({ where: { Email: email }, relations: ["Persona", "Persona.Usuario"] });
        if (!existEmail || !existEmail.Persona || !existEmail.Persona.Usuario) {
            return res.status(404).json({ message: 'Cuenta de Usuario Inexistente' });
        }
        const usuario = existEmail.Persona.Usuario;
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
        return res.json({ message: 'Correo enviado con el PIN. Revisa tu bandeja de entrada.',
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
        const { login, Password, Pin } = req.body; // 'login' puede ser Correo o Usuario
        const email = await Email_1.Email.findOne({
            where: { Email: login },
            relations: ["Persona", "Persona.Usuario",]
        });
        if (!email) {
            return res.status(404).json({
                message: 'Usuario not found'
            });
        }
        const usuario = email.Persona.Usuario;
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario sin cuenta asociada' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(Password, 10);
        const isMatch = await bcryptjs_1.default.compare(usuario.Contrasena, hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales Invalidos' });
        }
        const hashedPin = await bcryptjs_1.default.hash(Pin, 10);
        const isPin = await bcryptjs_1.default.compare(usuario.Pin, hashedPin);
        if (!isPin) {
            return res.status(401).json({ message: 'Credenciales Invalidos pin' });
        }
        // Generar el token JWT
        const token = jsonwebtoken_1.default.sign({ id: usuario.IdUsuario, Correo: email.Email }, // Payload del JWT
        'your_secret_key', // Clave secreta para firmar el token
        { expiresIn: '10s' } // Expiración del token
        );
        const Rtoken = jsonwebtoken_1.default.sign({ id: usuario.IdUsuario, Correo: email.Email }, // Payload del JWT
        'your_Refresh_secret_key', // Clave secreta para firmar el token
        { expiresIn: '2d' } // Expiración del token
        );
        // Guardar el token en el usuario (opcional)
        usuario.Token = token;
        usuario.RToken = Rtoken;
        await Usuario_1.Usuario.save(usuario);
        const RelatioUsuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: usuario.IdUsuario },
            relations: ["Estado", "Persona", "Persona.Email", "Persona.Imagen"]
        });
        return res.json({ RelatioUsuario });
    }
    catch (error) {
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
        // Verificar el refresh token
        const payload = jsonwebtoken_1.default.verify(refreshToken, 'your_Refresh_secret_key');
        // Buscar al usuario con el refresh token válido
        const usuario = await Usuario_1.Usuario.findOne({
            where: { RToken: refreshToken },
            relations: ["Persona", "Persona.Email"]
        });
        if (!usuario) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        // Generar nuevo token de acceso
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: usuario.IdUsuario,
            Password: usuario.Contrasena,
            Correo: usuario.Persona.Email.Email
        }, 'your_secret_key', { expiresIn: '10s' });
        // Opcional: actualizar el token en la base de datos
        usuario.Token = newAccessToken;
        await Usuario_1.Usuario.save(usuario);
        const RelatioUsuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: usuario.IdUsuario },
            relations: ["Estado", "Persona", "Persona.Email"]
        });
        return res.json({ RelatioUsuario });
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
        const { login } = req.body;
        const usuario = await Usuario_1.Usuario.findOne({ where: { IdUsuario: login } });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario not found' });
        }
        usuario.Token = null;
        usuario.RToken = null;
        await usuario.save();
        const RelatioUsuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: usuario.IdUsuario },
            relations: ["Estado", "Persona", "Persona.Email"]
        });
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
        const email = await Email_1.Email.findOne({
            where: { Email: login },
            relations: ["Persona", "Persona.Usuario"]
        });
        if (!email) {
            return res.status(404).json({ message: 'Usuario not found' });
        }
        const usuario = email.Persona.Usuario;
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario sin cuenta asociada' });
        }
        const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        // Actualizar contraseña y PIN, y limpiar el PIN de recuperación
        usuario.Contrasena = Password;
        usuario.Pin = Pin;
        usuario.PinRecuperacion = null; // Limpiar el PIN de recuperación
        await usuario.save();
        // Enviar correo de confirmación con las nuevas credenciales
        await mailer_1.transporter.sendMail({
            from: '"Credenciales Actualizadas" <antoniofernandezt134@gmail.com>',
            to: login, // El email del usuario
            subject: 'Tus credenciales han sido actualizadas',
            html: `
                <p>Hola,${email.Persona.Nombre} ${email.Persona.ApellidoPaterno}</p>
                <p>Tus credenciales de acceso han sido actualizadas exitosamente.</p>
                <p>Aquí están tus nuevos datos:</p>
                <ul>
                    <li><strong>Nueva Contraseña:</strong> ${Password}</li>
                    <li><strong>Nuevo PIN:</strong> ${Pin}</li>
                </ul>
                <p>Te recomendamos guardar esta información en un lugar seguro.</p>
                <p>Si no solicitaste este cambio, por favor, contacta a soporte inmediatamente.</p>
            `,
        });
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
const createUsuario = async (req, res) => {
    try {
        const { Persona } = req.body;
        const nuevoId = await (0, idGenerator_1.generarIdSecuencial)('U'); // Generar el ID secuencial
        const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        const usuario = new Usuario_1.Usuario();
        usuario.IdUsuario = nuevoId;
        usuario.Contrasena = Persona.Contrasena;
        usuario.Pin = Pin;
        usuario.Persona = await (0, Persona_controllers_1.createPersona)({
            Nombre: Persona.Nombre,
            ApellidoPaterno: Persona.ApellidoPaterno,
            ApellidoMaterno: Persona.ApellidoMaterno,
            FechaDeNacimiento: Persona.FechaDeNacimiento,
            IdGenero: Persona.IdGenero,
            email: Persona.Email,
            // Salario, 
            BarrioId: Persona.IdBarrio,
            Direccion: Persona.Direccion,
            Referencia: Persona.Referencia,
            Url: Persona.Url,
        });
        usuario.Estado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: 1 });
        await usuario.save();
        const persona = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: nuevoId },
            relations: ['Persona'],
        });
        if (!persona) {
            return res.status(404).json('Usuario no encontrado');
        }
        if (Persona.Celulares.length > 0)
            for (const celules of Persona.Celulares)
                await (0, Celular_controllers_1.createCelular)({ Numero: celules.Numero, PersonaId: persona.Persona.IdPersona });
        if (Persona.Documento.length > 0)
            for (const documento of Persona.Documento)
                await (0, Documento_controllers_1.createDocumento)({ IdTipoDocumento: documento.IdTipodocumento, IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: persona.Persona.IdPersona });
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
        const Usuarios = await Usuario_1.Usuario.find({ relations: [
                "Estado",
                "Persona",
                "Persona.Email", "Persona.Estado", "Persona.Genero",
                "Persona.Imagen", "Persona.Celulares", "Persona.Documento",
                "Persona.Documento.Tipodocumento", "Persona.Documento.Complemento",
                "Persona.Direccion.Barrio",
                "Rolusuario.Rol"
            ] });
        return res.json(Usuarios);
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
            relations: ['Persona'],
        });
        if (!usuario)
            return res.status(404).json({ message: 'Usuario no existe' });
        const Pin = Math.floor(1000 + Math.random() * 9000).toString();
        if (Persona.Contrasena)
            usuario.Contrasena = Persona.Contrasena;
        usuario.Pin = Pin;
        usuario.Persona = await (0, Persona_controllers_1.updatePersona)({
            IdPersona: usuario.Persona.IdPersona,
            Nombre: Persona.Nombre,
            ApellidoPaterno: Persona.ApellidoPaterno,
            ApellidoMaterno: Persona.ApellidoMaterno,
            FechaDeNacimiento: Persona.FechaDeNacimiento,
            IdGenero: Persona.IdGenero,
            IdEmail: Persona.IdEmail,
            email: Persona.Email,
            // Salario, 
            IdDireccion: Persona.IdDireccion,
            BarrioId: Persona.IdBarrio,
            Direccion: Persona.Direccion,
            Referencia: Persona.Referencia,
            IdImagen: Persona.IdImagen,
            Url: Persona.Url,
        });
        await usuario.save();
        if (Persona.Celulares && Persona.Celulares.length > 0) {
            const celularesActuales = await Celular_1.Celular.find({
                where: { Persona: { IdPersona: usuario.Persona.IdPersona } }
            });
            const idsEnviados = Persona.Celulares
                .filter((c) => c.IdCelular) // solo los que tienen ID
                .map((c) => c.IdCelular);
            for (const celularExistente of celularesActuales) {
                if (!idsEnviados.includes(celularExistente.IdCelular)) {
                    await celularExistente.remove(); // o .destroy() si usas Sequelize
                }
            }
            for (const celules of Persona.Celulares) {
                await (0, Celular_controllers_1.updateCelular)({
                    CelularId: celules.IdCelular,
                    Numero: celules.Numero,
                    PersonaId: usuario.Persona.IdPersona
                });
            }
        }
        if (Persona.Documento.length > 0)
            for (const documento of Persona.Documento)
                await (0, Documento_controllers_1.updateDocumento)({ DocumentoId: documento.IdDocumento, IdTipoDocumento: documento.IdTipodocumento, IdComplemento: documento.Complemento, Documentos: documento.Documento, PersonaId: id });
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
        const usuario = await Usuario_1.Usuario.findOne({
            where: { IdUsuario: id },
            relations: ['Estado']
        });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const esActivo = usuario.Estado?.IdEstado === 1;
        const nuevoEstadoId = esActivo ? 2 : 1;
        const mensajeAccion = esActivo ? 'eliminaron' : 'habilitaron';
        const nuevoEstado = await (0, Estado_controllers_1.verifyEstado)({ EstadoId: nuevoEstadoId });
        if (!nuevoEstado) {
            return res.status(500).json({ message: "No se pudo obtener el estado requerido." });
        }
        usuario.Estado = nuevoEstado;
        await usuario.save();
        return res.json({ message: `Se ${mensajeAccion} los datos del usuario correctamente` });
    }
    catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.deleteUsuario = deleteUsuario;
const verificarPin = async (req, res) => {
    try {
        const { email, pin } = req.body;
        const existEmail = await Email_1.Email.findOne({ where: { Email: email }, relations: ["Persona", "Persona.Usuario"] });
        if (!existEmail || !existEmail.Persona || !existEmail.Persona.Usuario) {
            return res.status(404).json({ message: 'Cuenta de Usuario Inexistente' });
        }
        const usuario = existEmail.Persona.Usuario;
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
        if (Usuario_1.Usuario) {
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
        const usuario = await Usuario_1.Usuario.findOne({ where: { IdUsuario: id },
            relations: [
                "Persona",
                "Persona.Imagen",
                "Persona.Email",
                "Rolusuario",
                "Rolusuario.Rol"
            ]
        });
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
exports.getUsuarioRol = getUsuarioRol;
const getUsuarioSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario_1.Usuario.findOne({ where: { IdUsuario: id,
                Usuariosucursal: { Estado: { IdEstado: 1 } }
            },
            relations: ["Usuariosucursal", "Usuariosucursal.Sucursal"]
        });
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
exports.getUsuarioSucursal = getUsuarioSucursal;
const getNoAdmin = async (req, res) => {
    try {
        // Caso 1: usuarios con sucursal inactiva
        const usuarios = await Usuario_1.Usuario.find({
            where: {
                Rolusuario: {
                    Rol: {
                        IdRol: "ROL-2"
                    }
                },
                Estado: { IdEstado: 1 }
            },
            relations: ["Persona", "Rolusuario", "Rolusuario.Rol", "Usuariosucursal", "Usuariosucursal.Estado"]
        });
        if (usuarios.length === 0) {
            return res.status(404).json("Usuarios not found");
        }
        return res.json(usuarios);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
exports.getNoAdmin = getNoAdmin;
