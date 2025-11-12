"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser1 = exports.getUser = exports.ActivarUser = exports.deleteUser = exports.updateUser = exports.getUsers = exports.createUser = exports.createUser1 = exports.logout = exports.refreshToken = exports.login = void 0;
const Users_1 = require("../entities/Users");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPT_KEY, 'hex'); // Clave secreta de 32 bytes en formato hexadecimal
const iv = Buffer.from(process.env.ENCRYPT_IV, 'hex'); // IV de 16 bytes en formato hexadecimal
function encrypt(text) {
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function decrypt(encryptedText) {
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login, Password } = req.body; // 'login' puede ser Correo o Usuario
        // Buscar el usuario por correo electrónico o nombre de usuario
        // const user = await Usuario.findOne({
        //     where: [
        //         { Usuario: login },  // Buscar por correo
        //         { CorreoElectronico: login }  // Buscar por nombre de usuario
        //     ]
        // });
        const user = yield Users_1.Usuario.createQueryBuilder("Usuario")
            .where("Usuario.CorreoElectronico = :login OR Usuario.Usuario = :login", { login })
            .getOne();
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        // Comparar la contraseña enviada con la almacenada
        const hashedPassword = yield bcryptjs_1.default.hash(user.Contrasena, 10);
        const isMatch = yield bcryptjs_1.default.compare(Password, hashedPassword);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        // Generar el token JWT
        const token = jsonwebtoken_1.default.sign({ id: user.Usuario, Password: user.Contrasena, Correo: user.CorreoElectronico }, // Payload del JWT
        'your_secret_key', // Clave secreta para firmar el token
        { expiresIn: '15m' } // Expiración del token
        );
        const Rtoken = jsonwebtoken_1.default.sign({ id: user.Usuario, Password: user.Contrasena, Correo: user.CorreoElectronico }, // Payload del JWT
        'your_Refresh_secret_key', // Clave secreta para firmar el token
        { expiresIn: '7d' } // Expiración del token
        );
        // Guardar el token en el usuario (opcional)
        user.Token = token;
        user.RToken = Rtoken;
        yield Users_1.Usuario.save(user);
        return res.json({ user });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }
        // Verificar el refresh token
        const payload = jsonwebtoken_1.default.verify(refreshToken, 'your_Refresh_secret_key');
        // Buscar al usuario con el refresh token válido
        const user = yield Users_1.Usuario.findOne({
            where: { RToken: refreshToken }
        });
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        // Generar nuevo token de acceso
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: user.Usuario,
            Password: user.Contrasena,
            Correo: user.CorreoElectronico
        }, 'your_secret_key', { expiresIn: '15m' });
        // Opcional: actualizar el token en la base de datos
        user.Token = newAccessToken;
        yield Users_1.Usuario.save(user);
        return res.json({ token: newAccessToken });
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
});
exports.refreshToken = refreshToken;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { login } = req.body;
        const user = yield Users_1.Usuario.findOne({ where: { Usuario: login } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.Token = null;
        user.RToken = null;
        yield Users_1.Usuario.save(user);
        return res.json({ message: 'Logout successful', user });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error during logout' });
    }
});
exports.logout = logout;
// export const refreshToken = async (req: Request, res: Response) => {
//     const  refreshToken = req.headers.refresh as string;
//     if (!refreshToken) {
//         return res.status(401).json({ message: "Refresh token required" });
//     }
//     try {
//         const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
//         // Validar que el token esté en la BD
//         const user = await Usuario.findOne({ where: { Usuario: decoded.id } });
//         if (!user || user.RToken !== refreshToken) {
//             return res.status(403).json({ message: "Refresh token not valid" });
//         }
//         // Crear un nuevo access token
//         const newAccessToken = jwt.sign(
//             { id: user.Usuario, correo: user.CorreoElectronico },
//             ACCESS_TOKEN_SECRET,
//             { expiresIn: "15m" }
//         );
//         res.json({ accessToken: newAccessToken });
//     } catch (err) {
//         return res.status(403).json({ message: "Invalid refresh token" });
//     }
// };
// export const login = async (req: Request, res: Response) => {
//     try {
//         const { login, Password } = req.body;
//         const user = await Usuario.findOne({
//             where: [
//                 { CorreoElectronico: login },
//                 { Usuario: login }
//             ]
//         });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         const hashedPassword = await bcrypt.hash(user.Contrasena, 10);
//         const isMatch = await bcrypt.compare(Password,hashedPassword);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }
//         // 👉 Payload común para ambos tokens
//         const payload = {
//             id: user.Usuario,
//             correo: user.CorreoElectronico,
//             Password: user.Contrasena
//         };
//         // 👉 Generar tokens
//         const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
//         const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
//         // Puedes guardar el refresh token en la BD si quieres
//         user.Token = accessToken;
//         user.RToken = refreshToken; // Esto depende de cómo gestiones el campo Token
//         await Usuario.save(user);
//     } catch (error) {
//         if (error instanceof Error) {
//             return res.status(500).json({ message: error.message });
//         }
//     }
// };
// export const login = async (req: Request, res: Response) => {
//      try {
//         const { Usuario, Password } = req.body;
//         const user = await Usuario.findOneBy({ Usuario });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         const hashedPassword = await bcrypt.hash(user.Password, 10);
//         const isMatch = await bcrypt.compare(Password, hashedPassword);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }
//         const token = jwt.sign(
//             { id: user.Usuario, Usuario: user.Usuario }, // Payload del JWT (puedes incluir cualquier dato relevante)
//             'your_secret_key', // Clave secreta para firmar el token (deberías guardarla de manera segura)
//             { expiresIn: '1h' } // Opciones del token, como el tiempo de expiración
//         ); 
//         user.Token=token
//         return res.json(user);
//     } catch (error) {
//         if (error instanceof Error) {
//             return res.status(500).json({ message: error.message });
//         }
//     }
// };
const createUser1 = (_a) => __awaiter(void 0, [_a], void 0, function* ({ Usuarioid, Password, CorreoElectronico }) {
    // Verificar si el usuario ya existe
    // const {Usuario, Password, CorreoElectronico} = req.body;
    const existingUser = yield Users_1.Usuario.findOne({ where: { Usuario: Usuarioid } });
    if (existingUser) {
        throw new Error("El nombre de usuario ya está en uso");
    }
    // Crear el usuario
    const user = new Users_1.Usuario();
    user.Usuario = Usuarioid;
    user.Contrasena = Password;
    user.CorreoElectronico = CorreoElectronico;
    user.Estado = 1; // Usuario activo
    yield user.save();
    return user;
});
exports.createUser1 = createUser1;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Usuarioid, Contrasena, CorreoElectronico } = req.body;
        const existingUser = yield Users_1.Usuario.findOne({ where: { Usuario: Usuarioid } });
        if (existingUser) {
            return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
        }
        const user = new Users_1.Usuario();
        user.Usuario = Usuarioid;
        user.Contrasena = Contrasena;
        user.CorreoElectronico = CorreoElectronico;
        user.Estado = 1;
        yield user.save();
        return res.json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.createUser = createUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield Users_1.Usuario.find();
        return res.json(users);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getUsers = getUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Usuarioid, Contrasena, CorreoElectronico } = req.body;
        const user = yield Users_1.Usuario.findOneBy({ Usuario: id });
        if (!user)
            return res.status(404).json({ message: 'User does not exists' });
        user.Contrasena = Contrasena;
        user.CorreoElectronico = CorreoElectronico;
        user.Estado = user.Estado;
        user.save();
        return res.json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.updateUser = updateUser;
// export const deleteUser = async (req:Request, res:Response) => {
//     try {
//         const {id} = req.params;
//     const result = await Usuario.delete({Usuario: id})
//     if(result.affected === 0){
//         return res.status(404).json({message: 'user not found'})
//     }
//     return res.sendStatus(204)
//     } catch (error) {
//         if (error instanceof Error) {
//             return res.status(500).json({message: error.message})
//         }
//     }
// }
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield Users_1.Usuario.findOne({ where: { Usuario: id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.Estado = 0;
        yield Users_1.Usuario.save(user);
        return res.json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.deleteUser = deleteUser;
const ActivarUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield Users_1.Usuario.findOne({ where: { Usuario: id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.Estado = 1;
        yield Users_1.Usuario.save(user);
        return res.json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.ActivarUser = ActivarUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield Users_1.Usuario.findOneBy({ Usuario: id });
        if (user === null) {
            return res.status(404).json('user not found');
        }
        return res.json(user);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getUser = getUser;
const getUser1 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Buscar el usuario y sus relaciones
        const user = yield Users_1.Usuario.findOne({
            where: { Usuario: id },
            relations: ["empleado"], // Incluye las relaciones
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Retornar la información del cliente o empleado asociado
        const userDetails = {
            empleado: user.empleado || null,
        };
        return res.json(userDetails);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
});
exports.getUser1 = getUser1;
