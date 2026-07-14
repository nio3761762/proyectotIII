
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: jwt.JwtPayload; // Definir la propiedad user como opcional y del tipo jwt.JwtPayload
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // // 1. SIEMPRE permite peticiones OPTIONS (evita el problema del 204/401 en CORS)
         if (req.method === 'OPTIONS') {
            return next();
         }
    
         // 2. Define tus rutas públicas (asegúrate de que coincidan exactamente con la URL)
         const publicRoutes = ["/login", "/Cambiar", "/verificar-pin","/productos-vista", "/promociones-vista","/mensaje"];
    
        // 3. Verifica usando originalUrl (que es la ruta completa desde la raíz)
        // Usamos .some para verificar si la URL actual empieza con alguna de las públicas
       const isPublic = publicRoutes.some(route => req.originalUrl.includes(route));
   
        if (isPublic) {
            return next();
        }
   
    
     
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];


    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key') as jwt.JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.warn("AuthMiddleware: Token expired");
            return res.status(401).json({ message: "Token expired." });
        }
        console.error("AuthMiddleware: Invalid token", error);
        return res.status(401).json({ message: "Invalid token." });
    }
};
export const publicAccessMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
if (req.method === 'OPTIONS') {
             return next();
         }
        // 1. Definir las rutas que no necesitan autenticación
         const publicRoutes = ["/login", "/RegUsuarios", "/verificar-pin","/mensaje"];
    
         // 2. Si la ruta actual está en la lista, saltar la verificación
    if (publicRoutes.includes(req.path)) {
           return next();
      }
   
       const authHeader = req.header("Authorization");
      const token = authHeader?.split(" ")[1];
    ;
};