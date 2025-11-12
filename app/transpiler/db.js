"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./entities/Usuario");
const Rol_1 = require("./entities/Rol");
const RolMenu_1 = require("./entities/RolMenu");
const Menu_1 = require("./entities/Menu");
const AdmDatos_1 = require("./entities/AdmDatos");
const TipoDocumento_1 = require("./entities/TipoDocumento");
const Complemento_1 = require("./entities/Complemento");
const TipoProveedor_1 = require("./entities/TipoProveedor");
const Proveedor_1 = require("./entities/Proveedor");
const Persona_1 = require("./entities/Persona");
const Celular_1 = require("./entities/Celular");
const Pais_1 = require("./entities/Pais");
const Departamento_1 = require("./entities/Departamento");
const Ciudad_1 = require("./entities/Ciudad");
const Barrio_1 = require("./entities/Barrio");
const DIreccion_1 = require("./entities/DIreccion");
const Sucursal_1 = require("./entities/Sucursal");
const Estado_1 = require("./entities/Estado");
const Enlace_1 = require("./entities/Enlace");
const Icono_1 = require("./entities/Icono");
const Imagen_1 = require("./entities/Imagen");
const Genero_1 = require("./entities/Genero");
const Email_1 = require("./entities/Email");
const Salario_1 = require("./entities/Salario");
const Distritos_1 = require("./entities/Distritos");
const RolUsuario_1 = require("./entities/RolUsuario");
const Horario_1 = require("./entities/Horario");
const Permiso_1 = require("./entities/Permiso");
const Documento_1 = require("./entities/Documento");
const MenuPermiso_1 = require("./entities/MenuPermiso");
const Producto_1 = require("./entities/Producto");
const Comision_1 = require("./entities/Comision");
const Promocion_1 = require("./entities/Promocion");
const UnidadMedida_1 = require("./entities/UnidadMedida");
const Precio_1 = require("./entities/Precio");
const Categoria_1 = require("./entities/Categoria");
const SubCategoria_1 = require("./entities/SubCategoria");
const PromocionProducto_1 = require("./entities/PromocionProducto");
const TipoProducto_1 = require("./entities/TipoProducto");
const Tipopromocion_1 = require("./entities/Tipopromocion");
const Marca_1 = require("./entities/Marca");
const Ingrediente_1 = require("./entities/Ingrediente");
const ProductoSucursal_1 = require("./entities/ProductoSucursal");
const UsuarioSucursal_1 = require("./entities/UsuarioSucursal");
const Presentacionproducto_1 = require("./entities/Presentacionproducto");
const ProductoMedida_1 = require("./entities/ProductoMedida");
const Rango_1 = require("./entities/Rango");
const Factura_1 = require("./entities/Factura");
const Venta_1 = require("./entities/Venta");
const DetalleVenta_1 = require("./entities/DetalleVenta");
const MetodoPago_1 = require("./entities/MetodoPago");
const Pago_1 = require("./entities/Pago");
const Presentacion_1 = require("./entities/Presentacion");
const ContadorSecuencias_1 = require("./entities/ContadorSecuencias");
const TipoEntrega_1 = require("./entities/TipoEntrega");
const TipoPedido_1 = require("./entities/TipoPedido");
const Entrega_1 = require("./entities/Entrega");
const Pedido_1 = require("./entities/Pedido");
const CategoriaMedida_1 = require("./entities/CategoriaMedida");
const Compra_1 = require("./entities/Compra");
const Comprobante_1 = require("./entities/Comprobante");
const DetalleCompra_1 = require("./entities/DetalleCompra");
const Distribucion_1 = require("./entities/Distribucion");
const Repartidor_1 = require("./entities/Repartidor");
const TrackingLink_1 = require("./entities/TrackingLink");
const SeguimientoRepartidor_1 = require("./entities/SeguimientoRepartidor");
const EmpresaReparto_1 = require("./entities/EmpresaReparto");
const TipoLicencia_1 = require("./entities/TipoLicencia");
const DetallePedido_1 = require("./entities/DetallePedido");
const Detalledistribucion_1 = require("./entities/Detalledistribucion");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345678",
    database: "TallerIII",
    logging: true,
    entities: [
        Rol_1.Rol,
        Estado_1.Estado,
        Icono_1.Icono,
        Enlace_1.Enlace,
        Menu_1.Menu,
        RolMenu_1.Rolmenu,
        Permiso_1.Permiso,
        Imagen_1.Imagen,
        Genero_1.Genero,
        Email_1.Email,
        Salario_1.Salario,
        Usuario_1.Usuario,
        RolUsuario_1.Rolusuario,
        AdmDatos_1.Administrardatos,
        Horario_1.Horario,
        TipoDocumento_1.Tipodocumento,
        TipoProveedor_1.Tipoproveedor,
        Proveedor_1.Proveedor,
        Documento_1.Documento,
        Complemento_1.Complemento,
        Persona_1.Persona,
        Celular_1.Celular,
        Pais_1.Pais,
        DIreccion_1.Direccion,
        Distritos_1.Distritos,
        Barrio_1.Barrio,
        Ciudad_1.Ciudad,
        Departamento_1.Departamento,
        MenuPermiso_1.Menupermiso,
        Ingrediente_1.Ingrediente,
        Producto_1.Producto,
        Precio_1.Precio,
        UnidadMedida_1.Unidadmedida,
        Promocion_1.Promocion,
        PromocionProducto_1.Promocionproducto,
        Marca_1.Marca,
        TipoProducto_1.Tipoproducto,
        Tipopromocion_1.Tipopromocion,
        Categoria_1.Categoria,
        SubCategoria_1.Subcategoria,
        Comision_1.Comision,
        Sucursal_1.Sucursal,
        UsuarioSucursal_1.Usuariosucursal,
        ProductoSucursal_1.Productosucursal,
        Presentacionproducto_1.Presentacionproducto,
        ProductoMedida_1.Productomedida,
        Rango_1.Rango,
        Venta_1.Venta,
        DetalleVenta_1.Detalleventa,
        Pago_1.Pago,
        MetodoPago_1.Metodopago,
        Factura_1.Factura,
        ContadorSecuencias_1.ContadorSecuencias,
        Presentacion_1.Presentacion,
        TipoEntrega_1.Tipoentrega,
        TipoPedido_1.Tipopedido,
        Pedido_1.Pedido,
        Entrega_1.Entrega,
        CategoriaMedida_1.Categoriamedida,
        Compra_1.Compra,
        Comprobante_1.Comprobante,
        DetalleCompra_1.Detallecompra,
        Repartidor_1.Repartidor,
        Distribucion_1.Distribucion,
        SeguimientoRepartidor_1.SeguimientoEntrega,
        TrackingLink_1.TrackingLink,
        EmpresaReparto_1.EmpresaReparto,
        TipoLicencia_1.TipoLicencia,
        DetallePedido_1.Detallepedido,
        Detalledistribucion_1.Detalledistribucion
    ],
    synchronize: true
});
