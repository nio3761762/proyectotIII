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
import promocion from './routes/Promocion.routes'
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
import direccion from './routes/Direccion.routes'
import olap from './routes/Olap.routes'
import reporte from './routes/Reporte.routes'
import reporteSemanal from './routes/ReporteSemanal.routes'
import notificacion from './routes/Notificacion.routes'
import ingredientes from './routes/Ingredientes.routes'
import produccion from './routes/Produccion.routes'
import insumo from './routes/Insumo.routes'
import empleado from './routes/Empleado.routes'
import empleadoSucursal from './routes/EmpleadoSucursal.routes'
import inventario from './routes/Inventario.routes'
import transferencia from './routes/Transferencia.routes'
import revendedorControl from './routes/RevendedorControl.routes'
import { errorHandler } from './middleware/error.middleware';


import cron from 'node-cron';
import { actualizarPromociones } from './controllers/Promocion.controllers';

const app = express();
app.use(morgan('dev'));
app.use(cors());
dotenv.config();
app.use(express.json())

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
app.use(promocion);
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
app.use(direccion);
app.use(olap);
app.use(reporte);
app.use(reporteSemanal);
app.use(ingredientes);
app.use(produccion);
app.use(comprobante);
app.use(insumo);
app.use(errorHandler);
app.use(empleado);
app.use(empleadoSucursal);
app.use(inventario)
app.use(transferencia)
app.use(revendedorControl)

cron.schedule("* * * * *", async () => {
  try {
    // Llamamos las funciones directamente, sin req ni res
    await actualizarPromociones();
  } catch (error) {
    console.error("❌ Error procesando promociones:", error);
  }
});
// });
 

export default app;