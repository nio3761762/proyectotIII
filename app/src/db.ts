import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { Usuario } from './entities/Usuario'
import { Rol } from './entities/Rol'
import { Rolmenu } from "./entities/RolMenu";
import { Menu } from "./entities/Menu";
import { Administrardatos } from "./entities/AdmDatos";
import { Complemento } from "./entities/Complemento";
import { Tipoproveedor } from "./entities/TipoProveedor";
import { Insumo } from "./entities/Insumo";
import { Proveedor } from "./entities/Proveedor";
import { Persona } from "./entities/Persona";
import { Celular } from "./entities/Celular";
import { Pais } from "./entities/Pais";
import { Departamento } from "./entities/Departamento";
import { Ciudad } from "./entities/Ciudad";
import { Barrio } from "./entities/Barrio";
import { Direccion } from "./entities/DIreccion";
import { Sucursal } from "./entities/Sucursal";
import { Enlace } from "./entities/Enlace";
import { Icono } from "./entities/Icono";
import { Salario } from "./entities/Salario";
import { Distritos } from "./entities/Distritos";
import { Rolusuario } from "./entities/RolUsuario";
import { Horario } from "./entities/Horario";
import { Permiso } from "./entities/Permiso";
import { Documento } from "./entities/Documento";
import { Menupermiso } from "./entities/MenuPermiso";
import { Producto } from "./entities/Producto";
import { Comision } from "./entities/Comision";
import { Promocion } from "./entities/Promocion";
import { Unidadmedida } from "./entities/UnidadMedida";
import { Categoria } from "./entities/Categoria";
import { Subcategoria } from "./entities/SubCategoria";
import { Promocionproducto } from "./entities/PromocionProducto";
import { Tipopromocion } from "./entities/Tipopromocion";
import { Marca } from "./entities/Marca";
import { Ingrediente } from "./entities/Ingrediente";
import { Productomedida } from "./entities/ProductoMedida";
import { Rango } from "./entities/Rango";
import { Factura } from "./entities/Factura";
import { Venta } from "./entities/Venta";
import { Detalleventa } from "./entities/DetalleVenta";
import { Metodopago } from "./entities/MetodoPago";
import { Pago } from "./entities/Pago";
import { Presentacion } from "./entities/Presentacion";
import { ContadorSecuencias } from "./entities/ContadorSecuencias";
import { Tipopedido } from "./entities/TipoPedido";
import { Pedido } from "./entities/Pedido";
import { Categoriamedida } from "./entities/CategoriaMedida";
import { Compra } from "./entities/Compra";
import { Comprobante } from "./entities/Comprobante";
import { Detallecompra } from "./entities/DetalleCompra";
import { Detallepedido } from "./entities/DetallePedido";
import { Produccion } from "./entities/Produccion";
import { Insumomedida } from "./entities/InsumoMedida";
import { Empleado } from "./entities/Empleado";
import { Cargo } from "./entities/Cargo";
import { EmpleadoSucursal } from "./entities/EmpleadoSucursal";
import { EmpleadoCargo } from "./entities/EmpleadoCargo";
import { Inventario } from "./entities/Inventario";
import { MovimientoInventario } from "./entities/MovimientoInventario";
import { Transferencia } from "./entities/Transferencia";
import { DetalleTransferencia } from "./entities/DetalleTransferencia";
import { Gasto } from "./entities/Gastos";
import { DetalleProduccion } from "./entities/Detalleproduccuin";
import { Horno } from "./entities/Horno";
import { HornoEnergia } from "./entities/HornoEnergia";
import { ProduccionEmpleado } from "./entities/ProduccionEmpleado";
import { Receta } from "./entities/Receta";
import { ProduccionHornoDetalle } from "./entities/Produccionhornodetalle";
import { Hornoproducto } from "./entities/HornoProduccto";
import { ConfiguracionEnergia } from "./entities/ConfiguracionEnergia";
import { Productomedidaprecio } from "./entities/Productomedidaprecio";
import { Revendedorcontrol } from "./entities/RevendedorControl ";
import { Revendedorcontroldetalle } from "./entities/RevendedorControlDetalle ";
import { Revendedorcontrolprecio } from "./entities/RevendedorControlPrecio";
import { GastoGeneral } from "./entities/GastoGeneral";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ,
    port: Number(process.env.DB_PORT) ,
    username: process.env.DB_USERNAME ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_DATABASE ,
    logging: true,
    entities: [
        Rol,
        Icono,
        Enlace,
        Menu,
        Rolmenu,
        Permiso,
        Salario,
        Usuario,
        Rolusuario,
        Administrardatos,
        Horario,
        Tipoproveedor,
        Proveedor,
        Documento,
        Complemento,
        Persona,
        Celular,
        Pais,
        Direccion,
        Distritos,
        Barrio,
        Ciudad,
        Departamento,
        Menupermiso,
        Ingrediente,
        Producto,
        Unidadmedida,
        Promocion,
        Promocionproducto,
        Marca,
        Tipopromocion,
        Categoria,
        Subcategoria,
        Comision,
        Sucursal,
        Productomedida,
        Rango,
        Venta,
        Detalleventa,
        Pago,
        Metodopago,
        Factura,
        ContadorSecuencias,
        Presentacion,
        Tipopedido,
        Pedido,   
        Categoriamedida,
        Compra,
        Comprobante,
        Detallecompra,
        Detallepedido,
        Produccion,
        Insumo, 
        Insumomedida,
        Empleado,
        EmpleadoSucursal,
        Cargo,
        EmpleadoCargo,
        Inventario,
        MovimientoInventario,
        Transferencia,
        DetalleTransferencia,
        Gasto,
        DetalleProduccion,
        ProduccionEmpleado,
        Horno,
        HornoEnergia,
        Receta,
        ProduccionHornoDetalle,
        Hornoproducto,
        ConfiguracionEnergia,
        Productomedidaprecio,
        Revendedorcontroldetalle,
        Revendedorcontrol,
        Revendedorcontrolprecio,
        GastoGeneral
    ],
    synchronize: true
})