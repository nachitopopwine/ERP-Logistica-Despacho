-- ===================================================================
-- SCRIPT DDL - TABLAS MAESTRAS COMPARTIDAS
-- Módulo: Logística/Despacho - ERP
-- Base de Datos: PostgreSQL
-- Descripción: Creación de tablas maestras compartidas entre módulos
-- ===================================================================

-- Tabla: CLIENTES (Maestro compartido - Dueño: Módulo Ventas)
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(50),
    region VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: PROVEEDORES (Maestro compartido - Dueño: Módulo Compras)
CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(50),
    contacto_principal VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: PRODUCTOS (Maestro compartido - Dueño: Módulo Inventario)
CREATE TABLE IF NOT EXISTS productos (
    id_producto SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    unidad_medida VARCHAR(20) DEFAULT 'UNIDAD',
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 10,
    precio_unitario DECIMAL(10,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_stock_positivo CHECK (stock_actual >= 0),
    CONSTRAINT chk_precio_positivo CHECK (precio_unitario >= 0)
);

-- Tabla: EMPLEADOS (Maestro compartido - Dueño: Módulo RRHH)
CREATE TABLE IF NOT EXISTS empleados (
    id_empleado SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    cargo VARCHAR(50),
    departamento VARCHAR(50),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para mejorar rendimiento en consultas frecuentes
CREATE INDEX idx_clientes_rut ON clientes(rut);
CREATE INDEX idx_proveedores_rut ON proveedores(rut);
CREATE INDEX idx_productos_codigo ON productos(codigo_sku);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_empleados_rut ON empleados(rut);
CREATE INDEX idx_empleados_cargo ON empleados(cargo);

-- Comentarios en las tablas
COMMENT ON TABLE clientes IS 'Maestro de clientes compartido - Dueño: Módulo Ventas';
COMMENT ON TABLE proveedores IS 'Maestro de proveedores compartido - Dueño: Módulo Compras';
COMMENT ON TABLE productos IS 'Maestro de productos compartido - Dueño: Módulo Inventario';
COMMENT ON TABLE empleados IS 'Maestro de empleados compartido - Dueño: Módulo RRHH';

COMMENT ON COLUMN productos.stock_actual IS 'Stock disponible en inventario';
COMMENT ON COLUMN productos.stock_minimo IS 'Nivel de stock mínimo antes de generar alerta';
