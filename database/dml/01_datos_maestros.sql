-- ===================================================================
-- SCRIPT DML - DATOS INICIALES PARA TABLAS MAESTRAS
-- Módulo: Logística/Despacho - ERP
-- Base de Datos: PostgreSQL
-- Descripción: Inserción de datos de prueba para tablas maestras
-- ===================================================================

-- ============================================
-- TABLA: EMPLEADOS (Mínimo 10 registros)
-- ============================================
INSERT INTO empleados (rut, nombre, apellido, email, telefono, cargo, departamento) VALUES
('12345678-9', 'Juan', 'Pérez', 'juan.perez@erp.com', '+56912345678', 'Operador de Bodega', 'Logística'),
('98765432-1', 'María', 'González', 'maria.gonzalez@erp.com', '+56998765432', 'Jefe de Bodega', 'Logística'),
('11111111-1', 'Pedro', 'Martínez', 'pedro.martinez@erp.com', '+56911111111', 'Operador de Picking', 'Logística'),
('22222222-2', 'Ana', 'López', 'ana.lopez@erp.com', '+56922222222', 'Coordinador de Despacho', 'Logística'),
('33333333-3', 'Carlos', 'Rodríguez', 'carlos.rodriguez@erp.com', '+56933333333', 'Operador de Bodega', 'Logística'),
('44444444-4', 'Laura', 'Fernández', 'laura.fernandez@erp.com', '+56944444444', 'Supervisor de Inventario', 'Inventario'),
('55555555-5', 'Diego', 'Silva', 'diego.silva@erp.com', '+56955555555', 'Operador de Recepción', 'Logística'),
('66666666-6', 'Sofía', 'Torres', 'sofia.torres@erp.com', '+56966666666', 'Vendedor', 'Ventas'),
('77777777-7', 'Javier', 'Muñoz', 'javier.munoz@erp.com', '+56977777777', 'Comprador', 'Compras'),
('88888888-8', 'Valentina', 'Campos', 'valentina.campos@erp.com', '+56988888888', 'Operador de Bodega', 'Logística'),
('99999999-9', 'Andrés', 'Rojas', 'andres.rojas@erp.com', '+56999999999', 'Jefe de Logística', 'Logística'),
('10101010-1', 'Camila', 'Soto', 'camila.soto@erp.com', '+56910101010', 'Operador de Picking', 'Logística');

-- ============================================
-- TABLA: CLIENTES (Mínimo 10 registros)
-- ============================================
INSERT INTO clientes (rut, nombre, email, telefono, direccion, ciudad, region) VALUES
('76543210-k', 'Supermercado Central', 'ventas@supercentral.cl', '+56232456789', 'Av. Libertador 123', 'Santiago', 'Metropolitana'),
('87654321-2', 'Distribuidora Norte', 'contacto@disnorte.cl', '+56951234567', 'Calle Copiapó 456', 'La Serena', 'Coquimbo'),
('76123456-3', 'Minimarket Los Angeles', 'info@minilosangeles.cl', '+56943210987', 'Los Angeles 789', 'Concepción', 'Biobío'),
('65432198-4', 'Almacén Don Pedro', 'almacen@donpedro.cl', '+56965432109', 'Pedro de Valdivia 321', 'Valparaíso', 'Valparaíso'),
('54321987-5', 'Comercial del Sur', 'ventas@comsur.cl', '+56987654321', 'Av. Alemania 654', 'Temuco', 'Araucanía'),
('43219876-6', 'Supermercado Familiar', 'contacto@superfamiliar.cl', '+56976543210', 'Av. España 987', 'Antofagasta', 'Antofagasta'),
('32198765-7', 'Distribuidora Central', 'compras@discent.cl', '+56965432198', 'Calle Maipú 147', 'Santiago', 'Metropolitana'),
('21987654-8', 'Tienda La Esquina', 'info@laesquina.cl', '+56954321987', 'Esquina Norte 258', 'Viña del Mar', 'Valparaíso'),
('19876543-9', 'Mayorista Atacama', 'ventas@mayoratacama.cl', '+56943219876', 'Av. Copayapu 369', 'Copiapó', 'Atacama'),
('18765432-0', 'Comercial Express', 'contacto@comexpress.cl', '+56932198765', 'Av. Vicuña Mackenna 741', 'Santiago', 'Metropolitana'),
('17654321-1', 'Minimarket del Barrio', 'info@minibarrio.cl', '+56921987654', 'Calle Los Olivos 852', 'Quilpué', 'Valparaíso'),
('16543210-2', 'Supermercado Ahorro', 'ventas@superahorro.cl', '+56919876543', 'Av. San Martín 963', 'Rancagua', 'O'Higgins');

-- ============================================
-- TABLA: PROVEEDORES (Mínimo 10 registros)
-- ============================================
INSERT INTO proveedores (rut, nombre, email, telefono, direccion, ciudad, contacto_principal) VALUES
('90123456-7', 'Proveedor Alimentos Frescos S.A.', 'ventas@alimentosfrescos.cl', '+56223456789', 'Parque Industrial 100', 'Santiago', 'Roberto Muñoz'),
('91234567-8', 'Distribuidora Bebidas Chile', 'contacto@bebidaschile.cl', '+56234567890', 'Av. Industrial 200', 'Valparaíso', 'Claudia Vargas'),
('92345678-9', 'Importadora Tecnología Global', 'info@tecglobal.cl', '+56245678901', 'Zona Franca 300', 'Iquique', 'Fernando Díaz'),
('93456789-0', 'Productora Lácteos del Sur', 'ventas@lacteossur.cl', '+56256789012', 'Camino Rural 400', 'Osorno', 'Patricia Morales'),
('94567890-1', 'Distribuidora Limpieza Pro', 'contacto@limpiepro.cl', '+56267890123', 'Av. Comercial 500', 'Concepción', 'Miguel Ángel Castro'),
('95678901-2', 'Proveedor Carnes Premium', 'ventas@carnespremium.cl', '+56278901234', 'Matadero Central 600', 'Talca', 'Andrea Sánchez'),
('96789012-3', 'Importadora Frutas del Mundo', 'info@frutasmundo.cl', '+56289012345', 'Puerto Comercial 700', 'Valparaíso', 'José Luis Ramírez'),
('97890123-4', 'Distribuidora Panadería Artesanal', 'contacto@panarte.cl', '+56290123456', 'Calle Horno 800', 'Viña del Mar', 'Lorena Vega'),
('98901234-5', 'Proveedor Verduras Orgánicas', 'ventas@verdorganicas.cl', '+56201234567', 'Fundo El Verde 900', 'Chillán', 'Eduardo Pinto'),
('99012345-6', 'Importadora Electrónica Asia', 'info@electroasia.cl', '+56212345678', 'Zona Franca 1000', 'Antofagasta', 'Sandra Flores'),
('90234567-7', 'Distribuidora Papel y Cartón', 'contacto@papelcarton.cl', '+56223456780', 'Parque Industrial 1100', 'Quilicura', 'Héctor Bravo'),
('91345678-8', 'Proveedor Insumos Industriales', 'ventas@insindustriales.cl', '+56234567891', 'Av. Industria 1200', 'Rancagua', 'Carolina Medina');

-- ============================================
-- TABLA: PRODUCTOS (Mínimo 10 registros)
-- ============================================
INSERT INTO productos (codigo_sku, nombre, descripcion, categoria, unidad_medida, stock_actual, stock_minimo, precio_unitario) VALUES
('PROD-001', 'Leche Entera 1L', 'Leche entera pasteurizada 1 litro', 'Lácteos', 'LITRO', 150, 50, 990),
('PROD-002', 'Pan Hallulla', 'Pan hallulla tradicional', 'Panadería', 'UNIDAD', 200, 100, 500),
('PROD-003', 'Arroz Grado 1 5kg', 'Arroz blanco grado 1 saco de 5kg', 'Abarrotes', 'KILOGRAMO', 80, 20, 4500),
('PROD-004', 'Aceite Vegetal 1L', 'Aceite vegetal comestible 1 litro', 'Abarrotes', 'LITRO', 120, 30, 2990),
('PROD-005', 'Detergente en Polvo 1kg', 'Detergente en polvo para ropa 1kg', 'Limpieza', 'KILOGRAMO', 90, 25, 3490),
('PROD-006', 'Yogurt Natural 1L', 'Yogurt natural sin azúcar 1 litro', 'Lácteos', 'LITRO', 110, 40, 1790),
('PROD-007', 'Papel Higiénico 12 Rollos', 'Papel higiénico doble hoja pack 12 unidades', 'Higiene', 'PACK', 75, 20, 5990),
('PROD-008', 'Galletas Surtidas 200g', 'Galletas dulces surtidas 200 gramos', 'Snacks', 'GRAMO', 160, 60, 1490),
('PROD-009', 'Jugo de Naranja 1.5L', 'Jugo de naranja natural 1.5 litros', 'Bebidas', 'LITRO', 95, 30, 2190),
('PROD-010', 'Fideos Spaguetti 400g', 'Fideos tipo spaguetti 400 gramos', 'Abarrotes', 'GRAMO', 140, 50, 890),
('PROD-011', 'Shampoo Familiar 750ml', 'Shampoo para toda la familia 750ml', 'Higiene', 'MILILITRO', 65, 15, 4990),
('PROD-012', 'Atún en Agua 170g', 'Atún en agua lata 170 gramos', 'Conservas', 'GRAMO', 180, 70, 1990);

-- Verificación de registros insertados
SELECT 'Empleados insertados:' AS tabla, COUNT(*) AS total FROM empleados
UNION ALL
SELECT 'Clientes insertados:', COUNT(*) FROM clientes
UNION ALL
SELECT 'Proveedores insertados:', COUNT(*) FROM proveedores
UNION ALL
SELECT 'Productos insertados:', COUNT(*) FROM productos;
