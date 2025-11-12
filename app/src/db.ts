import { DataSource } from "typeorm";
import { Usuario } from './entities/Usuario'
import { Rol } from './entities/Rol'
import { Rolmenu } from "./entities/RolMenu";
import { Menu } from "./entities/Menu";
import { Administrardatos } from "./entities/AdmDatos";
import { Tipodocumento } from "./entities/TipoDocumento";
import { Complemento } from "./entities/Complemento";
import { Tipoproveedor } from "./entities/TipoProveedor";
import { Proveedor } from "./entities/Proveedor";
import { Persona } from "./entities/Persona";
import { Celular } from "./entities/Celular";
import { Pais } from "./entities/Pais";
import { Departamento } from "./entities/Departamento";
import { Ciudad } from "./entities/Ciudad";
import { Barrio } from "./entities/Barrio";
import { Direccion } from "./entities/DIreccion";
import { Sucursal } from "./entities/Sucursal";
import { Estado } from "./entities/Estado";
import { Enlace } from "./entities/Enlace";
import { Icono } from "./entities/Icono";
import { Imagen } from "./entities/Imagen";
import { Genero } from "./entities/Genero";
import { Email } from "./entities/Email";
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
import { Precio } from "./entities/Precio";
import { Categoria } from "./entities/Categoria";
import { Subcategoria } from "./entities/SubCategoria";
import { Promocionproducto } from "./entities/PromocionProducto";
import { Tipoproducto } from "./entities/TipoProducto";
import { Tipopromocion } from "./entities/Tipopromocion";
import { Marca } from "./entities/Marca";
import { Ingrediente } from "./entities/Ingrediente";
import { Productosucursal } from "./entities/ProductoSucursal";
import { Usuariosucursal } from "./entities/UsuarioSucursal";
import { Presentacionproducto } from "./entities/Presentacionproducto";
import { Productomedida } from "./entities/ProductoMedida";
import { Rango } from "./entities/Rango";
import { Factura } from "./entities/Factura";
import { Venta } from "./entities/Venta";
import { Detalleventa } from "./entities/DetalleVenta";
import { Metodopago } from "./entities/MetodoPago";
import { Pago } from "./entities/Pago";
import { Presentacion } from "./entities/Presentacion";
import { ContadorSecuencias } from "./entities/ContadorSecuencias";
import { Tipoentrega } from "./entities/TipoEntrega";
import { Tipopedido } from "./entities/TipoPedido";
import { Entrega } from "./entities/Entrega";
import { Pedido } from "./entities/Pedido";
import { Categoriamedida } from "./entities/CategoriaMedida";
import { Compra } from "./entities/Compra";
import { Comprobante } from "./entities/Comprobante";
import { Detallecompra } from "./entities/DetalleCompra";
import { Distribucion } from "./entities/Distribucion";
import { Repartidor } from "./entities/Repartidor";
import { TrackingLink } from "./entities/TrackingLink";
import { SeguimientoEntrega } from "./entities/SeguimientoRepartidor";
import { EmpresaReparto } from "./entities/EmpresaReparto";
import { TipoLicencia } from "./entities/TipoLicencia";
import { Detallepedido } from "./entities/DetallePedido";
import { Detalledistribucion } from "./entities/Detalledistribucion";
import { Productostock } from "./entities/ProductoStock";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345678",
    database: "TallerIII",
    logging: true,
    entities: [
        Rol,
        Estado,
        Icono,
        Enlace,
        Menu,
        Rolmenu,
        Permiso,
        Imagen,
        Genero,
        Email,
        Salario,
        Usuario,
        Rolusuario,
        Administrardatos,
        Horario,
        Tipodocumento,
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
        Precio,
        Unidadmedida,
        Promocion,
        Promocionproducto,
        Marca,
        Tipoproducto,
        Tipopromocion,
        Categoria,
        Subcategoria,
        Comision,
        Sucursal,
        Usuariosucursal,
        Productosucursal,
        Presentacionproducto,
        Productomedida,
        Rango,
        Venta,
        Detalleventa,
        Pago,
        Metodopago,
        Factura,
        ContadorSecuencias,
        Presentacion,
        Tipoentrega,
        Tipopedido,
        Pedido,
        Entrega,
        Categoriamedida,
        Compra,
        Comprobante,
        Detallecompra,
        Repartidor,
        Distribucion,
        SeguimientoEntrega,
        TrackingLink, 
        EmpresaReparto,
        TipoLicencia,
        Detallepedido,
        Detalledistribucion,
        Productostock
    ],
    synchronize: true
})