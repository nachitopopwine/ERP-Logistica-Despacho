-- Script DDL para tablas de integración con otros ERPs
-- Esquema: Logistica
-- Tablas: pedidos_ventas, detalles_pedido_venta, ordenes_compra, detalles_orden_compra

-- ==================== PEDIDOS DE VENTAS ====================

-- Tabla principal de pedidos recibidos desde el ERP de Ventas
CREATE TABLE IF NOT EXISTS Logistica.pedidos_ventas (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    cliente VARCHAR(255) NOT NULL,
    direccion_despacho TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PROCESADO', 'RECHAZADO')),
    fecha_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalles de productos por pedido
CREATE TABLE IF NOT EXISTS Logistica.detalles_pedido_venta (
    id SERIAL PRIMARY KEY,
    pedido_venta_id INTEGER NOT NULL REFERENCES Logistica.pedidos_ventas(id) ON DELETE CASCADE,
    producto_id INTEGER,
    producto_nombre VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ÓRDENES DE COMPRA ====================

-- Tabla principal de órdenes de compra recibidas desde el ERP de Compras
CREATE TABLE IF NOT EXISTS Logistica.ordenes_compra (
    id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    proveedor VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'RECEPCIONADA', 'RECHAZADA')),
    fecha_orden TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_esperada_entrega TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalles de productos por orden de compra
CREATE TABLE IF NOT EXISTS Logistica.detalles_orden_compra (
    id SERIAL PRIMARY KEY,
    orden_compra_id INTEGER NOT NULL REFERENCES Logistica.ordenes_compra(id) ON DELETE CASCADE,
    producto_id INTEGER,
    producto_nombre VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_pedidos_ventas_estado ON Logistica.pedidos_ventas(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_ventas_fecha ON Logistica.pedidos_ventas(fecha_recepcion);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido_venta_pedido ON Logistica.detalles_pedido_venta(pedido_venta_id);

CREATE INDEX IF NOT EXISTS idx_ordenes_compra_estado ON Logistica.ordenes_compra(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_fecha ON Logistica.ordenes_compra(fecha_recepcion);
CREATE INDEX IF NOT EXISTS idx_detalles_orden_compra_orden ON Logistica.detalles_orden_compra(orden_compra_id);

-- ==================== COMENTARIOS ====================

COMMENT ON TABLE Logistica.pedidos_ventas IS 'Pedidos de venta recibidos desde el ERP de Ventas';
COMMENT ON TABLE Logistica.detalles_pedido_venta IS 'Detalle de productos por cada pedido de venta';
COMMENT ON TABLE Logistica.ordenes_compra IS 'Órdenes de compra recibidas desde el ERP de Compras';
COMMENT ON TABLE Logistica.detalles_orden_compra IS 'Detalle de productos por cada orden de compra';
