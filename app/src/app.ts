import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggwer';
import Usuario from './routes/Usuario.routes';
import AdmDatos from './routes/AdmDatos.routes'
import rol from './routes/Rol.routes';
import sucursal  from './routes/Sucursal.routes';
import barrio from './routes/Barrio.routes'
import rolmenu from './routes/RolMenu.routes'
import menu from './routes/Menu.routes'
import dotenv from 'dotenv';
import persona from './routes/Persona.routes'
import uploadRoutes from './routes/upload.routes';
import Rolusuario from './routes/RolUsuario.routes'
import producto from './routes/Producto.routes' 
import marca from './routes/Marca.routes'
import medida from './routes/Medida.routes'
import categoria from './routes/Categoria.routes'
import usuarioSucursal from './routes/UsuarioSucursal.routes'
import promocion from './routes/Promocion.routes'
import sucursalProducto from './routes/SucursalProducto.routes'
import tipopromocion from './routes/TipoPromocion.routes'
import complemento from './routes/Complemento.routes'
import proveedor from './routes/Proveedor.routes'
import venta from './routes/Venta.routes'
import pago from './routes/Pago.routes'
import fileRoutes from './routes/File.routes';
import factura from './routes/Factura.routes'
import presentacion from './routes/Presentacion.routes'
import comision from './routes/Comision.routes'
import pedido from './routes/Pedido.routes'
import categoriarmediad from './routes/CategoriaMedida.routes'
import compra from './routes/Compra.routes'
import comprobante from './routes/Comprobante.routes'
import entrega from './routes/Entrega.routes'
import direccion from './routes/Direccion.routes'
import repartidor from './routes/Repartidor.routes'
import empresareparto from './routes/EmpresaReparto.routes'
import tipolicencia from './routes/TipoLicencia.routes'
import distribucion from './routes/Distribucion.routes'
import olap from './routes/Olap.routes'
import reporte from './routes/Reporte.routes'
import notificacion from './routes/Notificacion.routes'
import ingredientes from './routes/Ingredientes.routes'

import { errorHandler } from './middleware/error.middleware';
import { actualizarPromociones } from './controllers/Promocion.controllers';
import cron from "node-cron";
import { TipoLicencia } from './entities/TipoLicencia';

import { ActualizarPassword, login } from './controllers/Usuario.controllers';

const app = express();
//aqui decimos que utile el module morgan y quiero su propiedad dev del modulo
app.use(morgan('dev'));
//tambien que utilice el modulo cors
app.use(cors());
dotenv.config();



app.use(express.json())

app.post("/login", login)
app.post("/mensaje", ActualizarPassword)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', uploadRoutes);
app.use('/uploads', express.static('uploads')); 
app.use(uploadRoutes);
app.use(Usuario);
app.use(Rolusuario);
app.use(AdmDatos);
app.use(rol);
app.use(rolmenu);
app.use(menu);
app.use(producto);
app.use(marca);
app.use(medida);
app.use(categoria);
app.use(sucursal);
app.use(barrio);
app.use(usuarioSucursal);
app.use(promocion);
app.use(sucursalProducto);
app.use(tipopromocion);
app.use(complemento);
app.use(persona);
app.use(proveedor);
app.use(venta);
app.use(pago);
app.use(fileRoutes);
app.use(factura);
app.use(presentacion);
app.use(comision);
app.use(pedido);
app.use(categoriarmediad);
app.use(compra);
app.use(entrega);
app.use(direccion);
app.use(repartidor);
app.use(empresareparto);
app.use(tipolicencia);
app.use(distribucion);
app.use(olap);
app.use(reporte);
app.use(ingredientes);


app.use(comprobante);
app.use(errorHandler);

// cada minuto (puedes ajustar según necesites)
cron.schedule("* * * * *", async () => {
  console.log("⏰ Verificando promociones...");

  try {
    // Llamamos las funciones directamente, sin req ni res
    await actualizarPromociones();
    console.log("✔ Promociones procesadas automáticamente");
  } catch (error) {
    console.error("❌ Error procesando promociones:", error);
  }
});
 

export default app;