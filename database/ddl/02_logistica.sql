-- ===================================================================
-- SCRIPT DDL - TABLAS DEL MÓDULO DE LOGÍSTICA/DESPACHO
-- Módulo: Logística/Despacho - ERP
-- Base de Datos: PostgreSQL
-- Descripción: Tablas propias del módulo de Logística
-- ===================================================================

-- Tabla: LOG_OT_PICKING (Órdenes de Trabajo de Picking)
CREATE TABLE IF NOT EXISTS log_ot_picking (
    id_ot SERIAL PRIMARY KEY,
    id_empleado INTEGER NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relación con tabla maestra empleados
    CONSTRAINT fk_ot_empleado FOREIGN KEY (id_empleado) 
        REFERENCES empleados(id_empleado)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Tabla: LOG_GUIA_DESPACHO (Guías de Despacho)
CREATE TABLE IF NOT EXISTS log_guia_despacho (
    id_guia SERIAL PRIMARY KEY,
    id_ot INTEGER NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    transportista VARCHAR(100) NOT NULL,
    direccion_entrega TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relación con OT de Picking
    CONSTRAINT fk_guia_ot FOREIGN KEY (id_ot) 
        REFERENCES log_ot_picking(id_ot)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Tabla: LOG_RECEPCION (Recepción de Mercadería)
CREATE TABLE IF NOT EXISTS log_recepcion (
    id_recepcion SERIAL PRIMARY KEY,
    id_proveedor INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones con tablas maestras
    CONSTRAINT fk_recepcion_proveedor FOREIGN KEY (id_proveedor) 
        REFERENCES proveedores(id_proveedor)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_recepcion_producto FOREIGN KEY (id_producto) 
        REFERENCES productos(id_producto)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Tabla auxiliar: LOG_OT_DETALLE (Detalle de productos en OT de Picking)
CREATE TABLE IF NOT EXISTS log_ot_detalle (
    id_detalle SERIAL PRIMARY KEY,
    id_ot INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad_solicitada INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_pickeada INTEGER DEFAULT 0 CHECK (cantidad_pickeada >= 0),
    
    -- Relaciones
    CONSTRAINT fk_detalle_ot FOREIGN KEY (id_ot) 
        REFERENCES log_ot_picking(id_ot)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) 
        REFERENCES productos(id_producto)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Una OT no puede tener el mismo producto duplicado
    CONSTRAINT uk_ot_producto UNIQUE (id_ot, id_producto)
);

-- Tabla auxiliar: LOG_TRANSPORTISTAS (Maestro de Transportistas)
CREATE TABLE IF NOT EXISTS log_transportistas (
    id_transportista SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rut VARCHAR(12) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_ot_empleado ON log_ot_picking(id_empleado);
CREATE INDEX idx_ot_estado ON log_ot_picking(estado);
CREATE INDEX idx_ot_fecha ON log_ot_picking(fecha);

CREATE INDEX idx_guia_ot ON log_guia_despacho(id_ot);
CREATE INDEX idx_guia_fecha ON log_guia_despacho(fecha);

CREATE INDEX idx_recepcion_proveedor ON log_recepcion(id_proveedor);
CREATE INDEX idx_recepcion_producto ON log_recepcion(id_producto);
CREATE INDEX idx_recepcion_fecha ON log_recepcion(fecha);

CREATE INDEX idx_detalle_ot ON log_ot_detalle(id_ot);
CREATE INDEX idx_detalle_producto ON log_ot_detalle(id_producto);

-- Comentarios en las tablas
COMMENT ON TABLE log_ot_picking IS 'Órdenes de Trabajo de Picking para preparación de pedidos';
COMMENT ON TABLE log_guia_despacho IS 'Guías de despacho emitidas para entregas a clientes';
COMMENT ON TABLE log_recepcion IS 'Registro de recepciones de mercadería de proveedores';
COMMENT ON TABLE log_ot_detalle IS 'Detalle de productos incluidos en cada OT de picking';
COMMENT ON TABLE log_transportistas IS 'Maestro de transportistas para gestión de despachos';

COMMENT ON COLUMN log_ot_picking.estado IS 'Estados: PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA';
COMMENT ON COLUMN log_ot_detalle.cantidad_pickeada IS 'Cantidad realmente pickeada (puede diferir de la solicitada)';
