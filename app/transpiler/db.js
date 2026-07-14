"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./entities/Usuario");
const Rol_1 = require("./entities/Rol");
const RolMenu_1 = require("./entities/RolMenu");
const Menu_1 = require("./entities/Menu");
const AdmDatos_1 = require("./entities/AdmDatos");
const Complemento_1 = require("./entities/Complemento");
const TipoProveedor_1 = require("./entities/TipoProveedor");
const Insumo_1 = require("./entities/Insumo");
const Proveedor_1 = require("./entities/Proveedor");
const Persona_1 = require("./entities/Persona");
const Celular_1 = require("./entities/Celular");
const Pais_1 = require("./entities/Pais");
const Departamento_1 = require("./entities/Departamento");
const Ciudad_1 = require("./entities/Ciudad");
const Barrio_1 = require("./entities/Barrio");
const DIreccion_1 = require("./entities/DIreccion");
const Sucursal_1 = require("./entities/Sucursal");
const Enlace_1 = require("./entities/Enlace");
const Icono_1 = require("./entities/Icono");
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
const Categoria_1 = require("./entities/Categoria");
const SubCategoria_1 = require("./entities/SubCategoria");
const PromocionProducto_1 = require("./entities/PromocionProducto");
const Tipopromocion_1 = require("./entities/Tipopromocion");
const Marca_1 = require("./entities/Marca");
const Ingrediente_1 = require("./entities/Ingrediente");
const ProductoMedida_1 = require("./entities/ProductoMedida");
const Rango_1 = require("./entities/Rango");
const Factura_1 = require("./entities/Factura");
const Venta_1 = require("./entities/Venta");
const DetalleVenta_1 = require("./entities/DetalleVenta");
const MetodoPago_1 = require("./entities/MetodoPago");
const Pago_1 = require("./entities/Pago");
const Presentacion_1 = require("./entities/Presentacion");
const ContadorSecuencias_1 = require("./entities/ContadorSecuencias");
const TipoPedido_1 = require("./entities/TipoPedido");
const Pedido_1 = require("./entities/Pedido");
const CategoriaMedida_1 = require("./entities/CategoriaMedida");
const Compra_1 = require("./entities/Compra");
const Comprobante_1 = require("./entities/Comprobante");
const DetalleCompra_1 = require("./entities/DetalleCompra");
const DetallePedido_1 = require("./entities/DetallePedido");
const Produccion_1 = require("./entities/Produccion");
const InsumoMedida_1 = require("./entities/InsumoMedida");
const Empleado_1 = require("./entities/Empleado");
const Cargo_1 = require("./entities/Cargo");
const EmpleadoSucursal_1 = require("./entities/EmpleadoSucursal");
const EmpleadoCargo_1 = require("./entities/EmpleadoCargo");
const Inventario_1 = require("./entities/Inventario");
const MovimientoInventario_1 = require("./entities/MovimientoInventario");
const Transferencia_1 = require("./entities/Transferencia");
const DetalleTransferencia_1 = require("./entities/DetalleTransferencia");
const Gastos_1 = require("./entities/Gastos");
const Detalleproduccuin_1 = require("./entities/Detalleproduccuin");
const Horno_1 = require("./entities/Horno");
const HornoEnergia_1 = require("./entities/HornoEnergia");
const ProduccionEmpleado_1 = require("./entities/ProduccionEmpleado");
const Receta_1 = require("./entities/Receta");
const Produccionhornodetalle_1 = require("./entities/Produccionhornodetalle");
const HornoProduccto_1 = require("./entities/HornoProduccto");
const ConfiguracionEnergia_1 = require("./entities/ConfiguracionEnergia");
const Productomedidaprecio_1 = require("./entities/Productomedidaprecio");
const RevendedorControl_1 = require("./entities/RevendedorControl ");
const RevendedorControlDetalle_1 = require("./entities/RevendedorControlDetalle ");
const RevendedorControlPrecio_1 = require("./entities/RevendedorControlPrecio");
const GastoGeneral_1 = require("./entities/GastoGeneral");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: true,
    entities: [
        Rol_1.Rol,
        Icono_1.Icono,
        Enlace_1.Enlace,
        Menu_1.Menu,
        RolMenu_1.Rolmenu,
        Permiso_1.Permiso,
        Salario_1.Salario,
        Usuario_1.Usuario,
        RolUsuario_1.Rolusuario,
        AdmDatos_1.Administrardatos,
        Horario_1.Horario,
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
        UnidadMedida_1.Unidadmedida,
        Promocion_1.Promocion,
        PromocionProducto_1.Promocionproducto,
        Marca_1.Marca,
        Tipopromocion_1.Tipopromocion,
        Categoria_1.Categoria,
        SubCategoria_1.Subcategoria,
        Comision_1.Comision,
        Sucursal_1.Sucursal,
        ProductoMedida_1.Productomedida,
        Rango_1.Rango,
        Venta_1.Venta,
        DetalleVenta_1.Detalleventa,
        Pago_1.Pago,
        MetodoPago_1.Metodopago,
        Factura_1.Factura,
        ContadorSecuencias_1.ContadorSecuencias,
        Presentacion_1.Presentacion,
        TipoPedido_1.Tipopedido,
        Pedido_1.Pedido,
        CategoriaMedida_1.Categoriamedida,
        Compra_1.Compra,
        Comprobante_1.Comprobante,
        DetalleCompra_1.Detallecompra,
        DetallePedido_1.Detallepedido,
        Produccion_1.Produccion,
        Insumo_1.Insumo,
        InsumoMedida_1.Insumomedida,
        Empleado_1.Empleado,
        EmpleadoSucursal_1.EmpleadoSucursal,
        Cargo_1.Cargo,
        EmpleadoCargo_1.EmpleadoCargo,
        Inventario_1.Inventario,
        MovimientoInventario_1.MovimientoInventario,
        Transferencia_1.Transferencia,
        DetalleTransferencia_1.DetalleTransferencia,
        Gastos_1.Gasto,
        Detalleproduccuin_1.DetalleProduccion,
        ProduccionEmpleado_1.ProduccionEmpleado,
        Horno_1.Horno,
        HornoEnergia_1.HornoEnergia,
        Receta_1.Receta,
        Produccionhornodetalle_1.ProduccionHornoDetalle,
        HornoProduccto_1.Hornoproducto,
        ConfiguracionEnergia_1.ConfiguracionEnergia,
        Productomedidaprecio_1.Productomedidaprecio,
        RevendedorControlDetalle_1.Revendedorcontroldetalle,
        RevendedorControl_1.Revendedorcontrol,
        RevendedorControlPrecio_1.Revendedorcontrolprecio,
        GastoGeneral_1.GastoGeneral
    ],
    synchronize: true
});
