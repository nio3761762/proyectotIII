CREATE TABLE Administrardatos (
    iddatos INTEGER PRIMARY KEY,
    nombre VARCHAR(100),
    celular VARCHAR(20),
    foto VARCHAR(255),
    idpropietario VARCHAR(150),
    idemail VARCHAR(150),
    FOREIGN KEY (foto) REFERENCES Imagen(idimagen),
    FOREIGN KEY (idpropietario) REFERENCES Persona(idpersona),
    FOREIGN KEY (idemail) REFERENCES Email(idemail)
);

CREATE TABLE Barrio (
    idbarrio VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    iddistrito VARCHAR(50),
    FOREIGN KEY (iddistrito) REFERENCES Distritos(iddistrito)
);

CREATE TABLE Categoria (
    idcategoria VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    fecharegistro DATE,
    fechaactualizacion DATE,
    idestado INTEGER,
    idimagen VARCHAR(255),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idimagen) REFERENCES Imagen(idimagen)
);

CREATE TABLE Categoriamedida (
    idcategoriamedida VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    fecharegistro DATE,
    fechaactualizacion DATE,
    idestado INTEGER,
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Celular (
    idcelular VARCHAR(50) PRIMARY KEY,
    numero VARCHAR(20),
    idpersona VARCHAR(150),
    idestado INTEGER,
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Ciudad (
    idciudad VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    iddepto VARCHAR(50),
    FOREIGN KEY (iddepto) REFERENCES Departamento(iddepto)
);

CREATE TABLE Cliente (
    idcliente VARCHAR(150) PRIMARY KEY
);

CREATE TABLE Comision (
    idcomision VARCHAR(100) PRIMARY KEY,
    cantidad INTEGER,
    porcentaje NUMERIC(10, 2),
    idproducto VARCHAR(100),
    idestado INTEGER,
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Complemento (
    idcomplemento VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE Compra (
    idcompra VARCHAR(50) PRIMARY KEY,
    nrocomprobante VARCHAR(100),
    fechacompra DATE,
    horacompra TIME,
    idcomprobante VARCHAR(50),
    idproveedor VARCHAR(50),
    idestado INTEGER,
    FOREIGN KEY (idcomprobante) REFERENCES Comprobante(idcomprobante),
    FOREIGN KEY (idproveedor) REFERENCES Proveedor(idproveedor),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Comprobante (
    idcomprobante VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE ContadorSecuencias (
    prefijo VARCHAR(5) PRIMARY KEY,
    fecha DATE,
    ultima_secuencia INTEGER
);

CREATE TABLE Direccion (
    iddireccion VARCHAR(255) PRIMARY KEY,
    direccion VARCHAR(255),
    referencia VARCHAR(120),
    ubicacion VARCHAR(255),
    idbarrio VARCHAR(50),
    FOREIGN KEY (idbarrio) REFERENCES Barrio(idbarrio)
);

CREATE TABLE Departamento (
    iddepto VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    idpais VARCHAR(50),
    FOREIGN KEY (idpais) REFERENCES Pais(idpais)
);

CREATE TABLE Detallecompra (
    iddetallecompra VARCHAR(50) PRIMARY KEY,
    descripcion VARCHAR(255),
    cantidad INTEGER,
    precio NUMERIC(10, 2),
    fechavencimiento DATE,
    idmedida VARCHAR(50),
    idcompra VARCHAR(50),
    FOREIGN KEY (idmedida) REFERENCES Productomedida(idproductomedida),
    FOREIGN KEY (idcompra) REFERENCES Compra(idcompra)
);

CREATE TABLE Detallepedido (
    iddetallepedido VARCHAR(100) PRIMARY KEY,
    cantidad INTEGER,
    precio NUMERIC(10, 2),
    modo INTEGER,
    idpedido VARCHAR(100),
    idproducto VARCHAR(100),
    idpromocion VARCHAR(100),
    idpaquete VARCHAR(50),
    FOREIGN KEY (idpedido) REFERENCES Pedido(idpedido),
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idpromocion) REFERENCES Promocion(idpromocion),
    FOREIGN KEY (idpaquete) REFERENCES Presentacionproducto(idpaquete)
);

CREATE TABLE Detalleventa (
    iddetalleventa VARCHAR(100) PRIMARY KEY,
    cantidad INTEGER,
    precio NUMERIC(10, 2),
    modo INTEGER,
    idventa VARCHAR(100),
    idproducto VARCHAR(100),
    idpromocion VARCHAR(100),
    idpaquete VARCHAR(50),
    descuento NUMERIC(10, 2),
    FOREIGN KEY (idventa) REFERENCES Venta(idventa),
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idpromocion) REFERENCES Promocion(idpromocion),
    FOREIGN KEY (idpaquete) REFERENCES Presentacionproducto(idpaquete)
);

CREATE TABLE Detalledistribucion (
    iddetalledistribucion VARCHAR(100) PRIMARY KEY,
    cantidad INTEGER,
    precio NUMERIC(10, 2),
    cantidaddevueltas INTEGER,
    modo INTEGER,
    iddistribucion VARCHAR(100),
    idproducto VARCHAR(100),
    idpaquete VARCHAR(50),
    FOREIGN KEY (iddistribucion) REFERENCES Distribucion(iddistribucion),
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idpaquete) REFERENCES Presentacionproducto(idpaquete)
);

CREATE TABLE Distribucion (
    iddistribucion VARCHAR(100) PRIMARY KEY,
    fecha_distribucion DATE,
    hora_distribucion TIME,
    origen VARCHAR(50),
    idestado INTEGER,
    idpedido VARCHAR(50),
    idsucursal VARCHAR(100),
    observacion VARCHAR(255),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idpedido) REFERENCES Pedido(idpedido),
    FOREIGN KEY (idsucursal) REFERENCES Sucursal(idsucursal)
);

CREATE TABLE Distritos (
    iddistrito VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    idciudad VARCHAR(50),
    FOREIGN KEY (idciudad) REFERENCES Ciudad(idciudad)
);

CREATE TABLE Documento (
    iddocumento VARCHAR(50) PRIMARY KEY,
    documento VARCHAR(100),
    idtipodocumento VARCHAR(50),
    idcomplemento VARCHAR(50),
    idpersona VARCHAR(150),
    FOREIGN KEY (idtipodocumento) REFERENCES Tipodocumento(idtipodocumento),
    FOREIGN KEY (idcomplemento) REFERENCES Complemento(idcomplemento),
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona)
);

CREATE TABLE Email (
    idemail VARCHAR(150) PRIMARY KEY,
    email VARCHAR(255),
    idpersona VARCHAR(150),
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona)
);

CREATE TABLE EmpresaReparto (
    idempresareparto VARCHAR(150) PRIMARY KEY,
    nombreempresa VARCHAR(100) UNIQUE
);

CREATE TABLE Enlace (
    idenlace VARCHAR(50) PRIMARY KEY,
    enlace VARCHAR(255)
);

CREATE TABLE Entrega (
    identrega VARCHAR(50) PRIMARY KEY,
    fechaentrega DATE,
    horaentrega TIME,
    costoentrega NUMERIC(10, 2),
    iddireccion VARCHAR(255),
    idtipoentrega VARCHAR(50),
    idpedido VARCHAR(50),
    iddistribucion VARCHAR(100),
    idestado INTEGER,
    idrepartidor VARCHAR(150),
    FOREIGN KEY (iddireccion) REFERENCES Direccion(iddireccion),
    FOREIGN KEY (idtipoentrega) REFERENCES Tipoentrega(idtipoentrega),
    FOREIGN KEY (idpedido) REFERENCES Pedido(idpedido),
    FOREIGN KEY (iddistribucion) REFERENCES Distribucion(iddistribucion),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idrepartidor) REFERENCES Repartidor(idrepartidor)
);

CREATE TABLE Estado (
    idestado INTEGER PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE Factura (
    idfactura VARCHAR(100) PRIMARY KEY,
    nrofactura VARCHAR(255),
    fechaemicion DATE,
    horaemicion TIME,
    aprobado VARCHAR(10),
    idventa VARCHAR(100),
    idenlace VARCHAR(50),
    FOREIGN KEY (idventa) REFERENCES Venta(idventa),
    FOREIGN KEY (idenlace) REFERENCES Enlace(idenlace)
);

CREATE TABLE Genero (
    idgenero INTEGER PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE Horario (
    idhorario VARCHAR(150) PRIMARY KEY,
    horaentrada TIME,
    horasalida TIME
);

CREATE TABLE Icono (
    idicono VARCHAR(50) PRIMARY KEY,
    icono VARCHAR(255)
);

CREATE TABLE Imagen (
    idimagen VARCHAR(255) PRIMARY KEY,
    url VARCHAR(255)
);

CREATE TABLE Ingrediente (
    idingrediente VARCHAR(100) PRIMARY KEY,
    peso NUMERIC(10, 3),
    idproductoingrediente VARCHAR(100),
    idproducto VARCHAR(100),
    idunidadmedida INTEGER,
    FOREIGN KEY (idproductoingrediente) REFERENCES Producto(idproducto),
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idunidadmedida) REFERENCES Unidadmedida(idunidadmedida)
);

CREATE TABLE Marca (
    idmarca VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE Menu (
    idmenu VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    visible INTEGER,
    idicono VARCHAR(50),
    idenlace VARCHAR(50),
    FOREIGN KEY (idicono) REFERENCES Icono(idicono),
    FOREIGN KEY (idenlace) REFERENCES Enlace(idenlace)
);

CREATE TABLE Menupermiso (
    idmenupermiso VARCHAR(50) PRIMARY KEY,
    idmenu VARCHAR(50),
    idpermiso VARCHAR(50),
    FOREIGN KEY (idmenu) REFERENCES Menu(idmenu),
    FOREIGN KEY (idpermiso) REFERENCES Permiso(idpermiso)
);

CREATE TABLE Metodopago (
    idmetodopago INTEGER PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE Pago (
    idpago VARCHAR(100) PRIMARY KEY,
    monto NUMERIC(10, 2),
    cambio NUMERIC(10, 2),
    fechapago DATE,
    horapago TIME,
    idmetodopago INTEGER,
    idventa VARCHAR(100),
    FOREIGN KEY (idmetodopago) REFERENCES Metodopago(idmetodopago),
    FOREIGN KEY (idventa) REFERENCES Venta(idventa)
);

CREATE TABLE Pais (
    idpais VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE Pedido (
    idpedido VARCHAR(50) PRIMARY KEY,
    fecharegistro DATE,
    hora TIME,
    detalle VARCHAR(255),
    idventa VARCHAR(100),
    idtipopedido VARCHAR(50),
    idestado INTEGER,
    FOREIGN KEY (idventa) REFERENCES Venta(idventa),
    FOREIGN KEY (idtipopedido) REFERENCES Tipopedido(idtipopedido),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Permiso (
    idpermiso VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE Persona (
    idpersona VARCHAR(150) PRIMARY KEY,
    nombre VARCHAR(100),
    apellidopaterno VARCHAR(100),
    apellidomaterno VARCHAR(100),
    fechadenacimiento DATE,
    fecharegistro DATE,
    fechaactualizacion DATE,
    horaregistro TIME,
    idimagen VARCHAR(255),
    iddireccion VARCHAR(255),
    idgenero INTEGER,
    idestado INTEGER,
    idsalario VARCHAR(150),
    FOREIGN KEY (idimagen) REFERENCES Imagen(idimagen),
    FOREIGN KEY (iddireccion) REFERENCES Direccion(iddireccion),
    FOREIGN KEY (idgenero) REFERENCES Genero(idgenero),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idsalario) REFERENCES Salario(idsalario)
);

CREATE TABLE Precio (
    idprecio VARCHAR(100) PRIMARY KEY,
    precio NUMERIC(10, 2),
    fecharegistro DATE,
    idestado INTEGER,
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Presentacion (
    idpresentacion VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50),
    fecharegistro DATE,
    fechaactualizacion DATE,
    idestado INTEGER,
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Presentacionproducto (
    idpaquete VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150),
    cantidad INTEGER,
    fecharegistro DATE,
    precioventa NUMERIC(10, 2),
    preciomayor NUMERIC(10, 2),
    idproducto VARCHAR(100),
    idunidadmedida INTEGER,
    idestado INTEGER,
    idpresentacion VARCHAR(50),
    idimagen VARCHAR(255),
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idunidadmedida) REFERENCES Unidadmedida(idunidadmedida),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idpresentacion) REFERENCES Presentacion(idpresentacion),
    FOREIGN KEY (idimagen) REFERENCES Imagen(idimagen)
);

CREATE TABLE Producto (
    idproducto VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(255),
    fecharegistro DATE,
    horaregistro TIME,
    fechaactualizacion DATE,
    fechavencimiento DATE,
    stockminimo INTEGER,
    idsubcategoria VARCHAR(50),
    idestado INTEGER,
    idmarca VARCHAR(50),
    idtipoproducto VARCHAR(50),
    idimagen VARCHAR(255),
    FOREIGN KEY (idsubcategoria) REFERENCES Subcategoria(idsubcategoria),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idmarca) REFERENCES Marca(idmarca),
    FOREIGN KEY (idtipoproducto) REFERENCES Tipoproducto(idtipoproducto),
    FOREIGN KEY (idimagen) REFERENCES Imagen(idimagen)
);

CREATE TABLE Productomedida (
    idproductomedida VARCHAR(50) PRIMARY KEY,
    fecharegistro DATE,
    cantidad NUMERIC(10, 3),
    precioventa NUMERIC(10, 2),
    preciomayor NUMERIC(10, 2),
    idproducto VARCHAR(100),
    idunidadmedida INTEGER,
    idprecio VARCHAR(100),
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idunidadmedida) REFERENCES Unidadmedida(idunidadmedida),
    FOREIGN KEY (idprecio) REFERENCES Precio(idprecio)
);

CREATE TABLE Productosucursal (
    idproductosucursal VARCHAR(100) PRIMARY KEY,
    fecha DATE,
    cantidad INTEGER,
    idproducto VARCHAR(100),
    idpaquete VARCHAR(50),
    idsucursal VARCHAR(100),
    stockminimo INTEGER,
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idpaquete) REFERENCES Presentacionproducto(idpaquete),
    FOREIGN KEY (idsucursal) REFERENCES Sucursal(idsucursal)
);

CREATE TABLE Promocion (
    idpromocion VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(255),
    fecharegistro DATE,
    fechaactualizacion DATE,
    idestado INTEGER,
    idtipopromocion INTEGER,
    idimagen VARCHAR(255),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idtipopromocion) REFERENCES Tipopromocion(idtipopromocion),
    FOREIGN KEY (idimagen) REFERENCES Imagen(idimagen)
);

CREATE TABLE Promocionproducto (
    idpromocionproducto VARCHAR(100) PRIMARY KEY,
    cantidad INTEGER,
    descuento NUMERIC(10, 2),
    idproducto VARCHAR(100),
    idpaquete VARCHAR(50),
    idpromocion VARCHAR(100),
    idestado INTEGER,
    FOREIGN KEY (idproducto) REFERENCES Producto(idproducto),
    FOREIGN KEY (idpaquete) REFERENCES Presentacionproducto(idpaquete),
    FOREIGN KEY (idpromocion) REFERENCES Promocion(idpromocion),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Proveedor (
    idproveedor VARCHAR(50) PRIMARY KEY,
    razonsocial VARCHAR(255),
    idtipoproveedor INTEGER,
    idpersona VARCHAR(150),
    idestado INTEGER,
    FOREIGN KEY (idtipoproveedor) REFERENCES Tipoproveedor(idtipoproveedor),
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Rango (
    idrango VARCHAR(50) PRIMARY KEY,
    horainicio TIME,
    horafin TIME,
    fechainicio DATE,
    fechafin DATE,
    idpromocion VARCHAR(100),
    FOREIGN KEY (idpromocion) REFERENCES Promocion(idpromocion)
);

CREATE TABLE Repartidor (
    idrepartidor VARCHAR(150) PRIMARY KEY,
    idestado INTEGER,
    tipovehiculo VARCHAR(100),
    placavehiculo VARCHAR(20) UNIQUE,
    numerolicencia VARCHAR(50),
    idempresareparto VARCHAR(150),
    idtipolicencia VARCHAR(150),
    idpersona VARCHAR(150),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idempresareparto) REFERENCES EmpresaReparto(idempresareparto),
    FOREIGN KEY (idtipolicencia) REFERENCES TipoLicencia(idtipolicencia),
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona)
);

CREATE TABLE Rol (
    idrol VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    fecharegistro DATE,
    fechaactualizacion DATE,
    idestado INTEGER,
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Rolmenu (
    idrolmenu VARCHAR(50) PRIMARY KEY,
    fecharegistro DATE,
    idrol VARCHAR(50),
    idpermiso VARCHAR(50),
    idmenu VARCHAR(50),
    permitido INTEGER,
    FOREIGN KEY (idrol) REFERENCES Rol(idrol),
    FOREIGN KEY (idpermiso) REFERENCES Permiso(idpermiso),
    FOREIGN KEY (idmenu) REFERENCES Menu(idmenu)
);

CREATE TABLE Rolusuario (
    idrolusuario VARCHAR(50) PRIMARY KEY,
    fecharegistro DATE,
    fechaactualizacion DATE,
    idusuario VARCHAR(150),
    FOREIGN KEY (idrol) REFERENCES Rol(idrol),
    FOREIGN KEY (idusuario) REFERENCES Usuario(idusuario)
);

CREATE TABLE Salario (
    idsalario VARCHAR(150) PRIMARY KEY,
    salario DECIMAL(10, 2) DEFAULT 0.00,
    moneda VARCHAR(10),
    fecha DATE
);

CREATE TABLE SeguimientoEntrega (
    idseguimiento VARCHAR(100) PRIMARY KEY,
    identrega VARCHAR(50),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    fecha_hora_ubicacion TIMESTAMP,
    FOREIGN KEY (identrega) REFERENCES Entrega(identrega)
);

CREATE TABLE Subcategoria (
    idsubcategoria VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    idcategoria VARCHAR(50),
    idestado INTEGER,
    FOREIGN KEY (idcategoria) REFERENCES Categoria(idcategoria),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Sucursal (
    idsucursal VARCHAR(100) PRIMARY KEY,
    nombre VARCHAR(100),
    nro INTEGER,
    fecharegistro DATE,
    fechaactualizacion DATE,
    celular VARCHAR(100),
    central INTEGER,
    iddireccion VARCHAR(255),
    iddatos INTEGER,
    idestado INTEGER,
    idhorario VARCHAR(150),
    FOREIGN KEY (iddireccion) REFERENCES Direccion(iddireccion),
    FOREIGN KEY (iddatos) REFERENCES Administrardatos(iddatos),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idhorario) REFERENCES Horario(idhorario)
);

CREATE TABLE Tipodocumento (
    idtipodocumento VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE Tipoentrega (
    idtipoentrega VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE TipoLicencia (
    idtipolicencia VARCHAR(150) PRIMARY KEY,
    nombretipolicencia VARCHAR(100) UNIQUE
);

CREATE TABLE Tipopedido (
    idtipopedido VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE Tipoproducto (
    idtipoproducto VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE Tipoproveedor (
    idtipoproveedor INTEGER PRIMARY KEY,
    nombre VARCHAR(150)
);

CREATE TABLE Tipopromocion (
    idtipopromocion INTEGER PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE TrackingLink (
    idtracking VARCHAR(50) PRIMARY KEY,
    token VARCHAR(255),
    idrepartidor VARCHAR(150),
    fechaexpiracion DATE,
    idestado INTEGER,
    fechacreacion DATE,
    FOREIGN KEY (idrepartidor) REFERENCES Repartidor(idrepartidor),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Unidadmedida (
    idunidadmedida INTEGER PRIMARY KEY,
    nombre VARCHAR(100),
    abreviatura VARCHAR(100),
    cantidad NUMERIC(10, 3),
    fecharegistro DATE,
    idestado INTEGER,
    idcategoriamedida VARCHAR(50),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idcategoriamedida) REFERENCES Categoriamedida(idcategoriamedida)
);

CREATE TABLE Usuario (
    idusuario VARCHAR(150) PRIMARY KEY,
    contrasena VARCHAR(150),
    pin VARCHAR(150),
    pinrecuperacion VARCHAR(10),
    idpersona VARCHAR(150),
    idestado INTEGER,
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado)
);

CREATE TABLE Usuariosucursal (
    idusuariosucursal VARCHAR(100) PRIMARY KEY,
    fechaasignado DATE,
    fechaactualizacion DATE,
    idestado INTEGER,
    idusuario VARCHAR(150),
    idsucursal VARCHAR(100),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idusuario) REFERENCES Usuario(idusuario),
    FOREIGN KEY (idsucursal) REFERENCES Sucursal(idsucursal)
);

CREATE TABLE Venta (
    idventa VARCHAR(100) PRIMARY KEY,
    fechaventa DATE,
    horaventa TIME,
    idestado INTEGER,
    idusuario VARCHAR(150),
    idpersona VARCHAR(150),
    idsucursal VARCHAR(100),
    FOREIGN KEY (idestado) REFERENCES Estado(idestado),
    FOREIGN KEY (idusuario) REFERENCES Usuario(idusuario),
    FOREIGN KEY (idpersona) REFERENCES Persona(idpersona),
    FOREIGN KEY (idsucursal) REFERENCES Sucursal(idsucursal)
);