create table Buses(
BusID serial primary key,
	Placa varchar(7),
   Modelo varchar(50),
	Capacidad integer
);

create table Users(
Usuario varchar(8) primary key,
	Password varchar(20),
	Email varchar(100)
);

create table Rutas(
    RutaID serial primary key, 
	Origen varchar(100) not null ,
    Destino varchar(100) not null
);


create table Horarios(
    HorarioID serial primary key,
	RutasID integer,
	BusID integer,
	foreign key (RutasID) references Rutas(RutaID),
	foreign key (BusID) references Buses(BusID),
	FechaSalida date,
	HoraSalida time,
	fechaLlegada date,
	Precio integer
);

create table reservas(
     ReservaID serial primary key,
	FechaReserva date,
	Asientos integer,
	Estado varchar(1),
	RAsientos integer,
	PrecioTotal integer	,
	 UsuarioID varchar(8),
	foreign key(UsuarioID) references Users(Usuario), 
	HorarioID integer,
	foreign key(HorarioID) references Horarios(HorarioID),
);

INSERT INTO Users 
VALUES ('user1', '1234567', 'user1@example.com'),
       ('user2', '1234567', 'user2@example.com'),
       ('user3', '1234567', 'user3@example.com');
	   
	   
	   
INSERT INTO Buses 
VALUES (1,'ABC123', 'Model X', 50),
       (2,'DEF456', 'Model Y', 40),
       (3,'GHI789', 'Model Z', 30);	   
	   
	   INSERT INTO Rutas 
VALUES (1,'Tarija', 'Yacuiba'),
       (2,'Tarija', 'Bermejo'),
       (3,'Tarija', 'Villamontes');
	   select * from horarios

		   INSERT INTO Horarios
VALUES (1,'2024-06-22','13:00:00', '2024-06-22', 50,1,1),
       (2,'2024-06-23', '18:00:00', '2024-06-23', 45,2,2),
       (3, '2024-06-24', '20:00:00', '2024-06-24', 40,3,3);	   
	   
CREATE TABLE IF NOT EXISTS ContadorSecuencias (
    prefijo CHAR(5) NOT NULL,
    fecha DATE NOT NULL,
    ultima_secuencia INT NOT NULL,
    PRIMARY KEY (prefijo, fecha)
);

-- =============================================
-- TABLAS DE LOGÍSTICA Y REPARTO
-- =============================================

-- =============================================
-- TABLA REPARTIDOR
-- Almacena la información específica de los repartidores.
-- Relación 1 a 1 con la tabla 'persona'.
-- =============================================
CREATE TABLE repartidor (
    -- Llave primaria y foránea para la relación 1 a 1 con persona.
    id_persona INT PRIMARY KEY,
    
    -- Estado del repartidor: 'activo', 'inactivo', 'de vacaciones', etc.
    estado VARCHAR(50) NOT NULL DEFAULT 'activo',
    
    -- Información del vehículo de reparto.
    tipo_vehiculo VARCHAR(100), -- E.g., 'Motocicleta', 'Automóvil', 'Bicicleta'
    placa_vehiculo VARCHAR(20) UNIQUE, -- Matrícula del vehículo, debe ser única.
    
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Definición de la llave foránea que establece la relación 1 a 1.
    CONSTRAINT fk_repartidor_persona
        FOREIGN KEY (id_persona)
        REFERENCES persona(id_persona)
        ON DELETE CASCADE -- Si se elimina la persona, se elimina el repartidor.
        ON UPDATE CASCADE
);

-- =============================================
-- TABLA DISTRIBUCION
-- Agrupa un conjunto de envíos para una ruta de reparto.
-- =============================================
CREATE TABLE distribucion (
    id_distribucion INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Repartidor asignado a esta ruta de distribución.
    id_repartidor INT NOT NULL,
    
    -- Fecha en que se realiza la distribución.
    fecha_distribucion DATE NOT NULL,
    
    -- Estado de la ruta: 'planificada', 'en_curso', 'completada', 'cancelada'
    estado VARCHAR(50) NOT NULL DEFAULT 'planificada',
    
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_distribucion_repartidor
        FOREIGN KEY (id_repartidor)
        REFERENCES repartidor(id_persona)
        ON DELETE RESTRICT -- No se puede eliminar un repartidor si tiene distribuciones.
        ON UPDATE CASCADE
);

-- =============================================
-- TABLA ENVIO
-- Representa la entrega de una venta/pedido específico.
-- =============================================
CREATE TABLE envio (
    id_envio INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Venta o pedido que se está enviando.
    id_venta INT NOT NULL,
    
    -- Distribución a la que pertenece este envío.
    id_distribucion INT NOT NULL,
    
    -- Estado del envío: 'pendiente', 'en_camino', 'entregado', 'fallido', 'reprogramado'
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    
    -- Fecha en que se asignó el envío a una distribución.
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Fecha y hora en que se completó la entrega.
    fecha_entrega_real DATETIME,
    
    -- Observaciones sobre la entrega (ej: "Cliente no se encontraba").
    observaciones TEXT,
    
    CONSTRAINT fk_envio_venta
        FOREIGN KEY (id_venta)
        REFERENCES venta(id_venta) -- Asumiendo que tienes una tabla 'venta'.
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_envio_distribucion
        FOREIGN KEY (id_distribucion)
        REFERENCES distribucion(id_distribucion)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- TABLA SEGUIMIENTO_REPARTIDOR (OPCIONAL PERO RECOMENDADA)
-- Almacena un historial de las ubicaciones GPS del repartidor.
-- =============================================
CREATE TABLE seguimiento_repartidor (
    id_seguimiento BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Repartidor que se está rastreando.
    id_repartidor INT NOT NULL,
    
    -- Coordenadas geográficas.
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    
    -- Fecha y hora exactas de la captura de la ubicación.
    fecha_hora_ubicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_seguimiento_repartidor
        FOREIGN KEY (id_repartidor)
        REFERENCES repartidor(id_persona)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- TABLA TRACKING_LINK
-- Almacena tokens únicos para generar enlaces de seguimiento para repartidores.
-- =============================================
CREATE TABLE tracking_link (
    -- Token único que se usará en la URL (ej: un UUID).
    token VARCHAR(255) PRIMARY KEY,
    
    -- Repartidor asociado a este enlace.
    id_repartidor INT NOT NULL,
    
    -- Fecha y hora en que el enlace dejará de ser válido.
    fecha_expiracion DATETIME NOT NULL,
    
    -- Para desactivar un enlace sin eliminarlo.
    esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tracking_link_repartidor
        FOREIGN KEY (id_repartidor)
        REFERENCES repartidor(id_persona)
        ON DELETE CASCADE -- Si se elimina el repartidor, se eliminan sus enlaces.
        ON UPDATE CASCADE
);