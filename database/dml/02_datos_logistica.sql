-- ===================================================================
-- SCRIPT DML - DATOS INICIALES PARA MÓDULO DE LOGÍSTICA
-- Módulo: Logística/Despacho - ERP
-- Base de Datos: PostgreSQL
-- Descripción: Inserción de datos de prueba para tablas de logística
-- ===================================================================

-- ============================================
-- TABLA: LOG_TRANSPORTISTAS (Mínimo 10 registros)
-- ============================================
INSERT INTO log_transportistas (nombre, rut, telefono, email) VALUES
('Transportes Rápidos Chile', '78901234-5', '+56232112233', 'contacto@rapidoschile.cl'),
('Cargo Express Logistics', '79012345-6', '+56233445566', 'ventas@cargoexpress.cl'),
('Distribuciones del Norte', '80123456-7', '+56234556677', 'info@disnorte.cl'),
('Transporte Sur Express', '81234567-8', '+56235667788', 'contacto@surexpress.cl'),
('Logística Central', '82345678-9', '+56236778899', 'ventas@logcentral.cl'),
('FleteChile S.A.', '83456789-0', '+56237889900', 'operaciones@fletechile.cl'),
('Express Courier', '84567890-1', '+56238990011', 'contacto@expresscourier.cl'),
('Transportes Marítimos', '85678901-2', '+56239001122', 'info@transmaritimos.cl'),
('Cargo Aéreo Nacional', '86789012-3', '+56230112233', 'ventas@cargoaereo.cl'),
('Distribuciones Premium', '87890123-4', '+56231223344', 'contacto@dispremium.cl'),
('Transporte Terrestre Total', '88901234-5', '+56232334455', 'info@terrestre.cl'),
('Logística Integrada Chile', '89012345-6', '+56233445567', 'ventas@loginchile.cl');

-- ============================================
-- TABLA: LOG_OT_PICKING (Mínimo 10 registros)
-- ============================================
-- Asumiendo que los empleados con id 1, 3, 5, 8, 10, 12 son operadores de bodega/picking
INSERT INTO log_ot_picking (id_empleado, fecha, estado, observaciones) VALUES
(1, '2025-10-15', 'COMPLETADA', 'Picking completado sin observaciones'),
(3, '2025-10-16', 'COMPLETADA', 'Productos verificados y empacados'),
(1, '2025-10-17', 'EN_PROCESO', 'En proceso de picking'),
(5, '2025-10-18', 'PENDIENTE', 'Esperando confirmación de inventario'),
(3, '2025-10-18', 'COMPLETADA', 'Picking urgente completado'),
(8, '2025-10-19', 'EN_PROCESO', 'Picking en curso'),
(1, '2025-10-19', 'PENDIENTE', 'Pendiente de asignación'),
(10, '2025-10-20', 'COMPLETADA', 'Orden completada y verificada'),
(3, '2025-10-20', 'EN_PROCESO', 'Picking parcial'),
(5, '2025-10-21', 'PENDIENTE', 'Recién creada'),
(12, '2025-10-21', 'PENDIENTE', 'Orden de gran volumen'),
(1, '2025-10-21', 'COMPLETADA', 'Picking express completado');

-- ============================================
-- TABLA: LOG_OT_DETALLE (Detalle de productos en OT)
-- ============================================
-- Detalle para las OT creadas anteriormente
INSERT INTO log_ot_detalle (id_ot, id_producto, cantidad_solicitada, cantidad_pickeada) VALUES
-- OT #1
(1, 1, 20, 20),
(1, 3, 10, 10),
(1, 5, 15, 15),
-- OT #2
(2, 2, 50, 50),
(2, 4, 25, 25),
-- OT #3
(3, 6, 30, 20),
(3, 8, 40, 0),
-- OT #4
(4, 1, 15, 0),
(4, 7, 10, 0),
-- OT #5
(5, 9, 25, 25),
(5, 10, 35, 35),
(5, 11, 20, 20),
-- OT #6
(6, 2, 60, 40),
-- OT #7
(7, 12, 45, 0),
-- OT #8
(8, 1, 30, 30),
(8, 2, 30, 30),
(8, 3, 15, 15),
-- OT #9
(9, 4, 20, 10),
(9, 5, 25, 0),
-- OT #10
(10, 6, 18, 0),
-- OT #11
(11, 7, 50, 0),
(11, 8, 60, 0),
(11, 9, 40, 0),
-- OT #12
(12, 10, 25, 25),
(12, 11, 15, 15);

-- ============================================
-- TABLA: LOG_GUIA_DESPACHO (Mínimo 10 registros)
-- ============================================
-- Solo se crean guías para OT completadas o en proceso avanzado
INSERT INTO log_guia_despacho (id_ot, fecha, transportista, direccion_entrega) VALUES
(1, '2025-10-15', 'Transportes Rápidos Chile', 'Av. Libertador 123, Santiago'),
(2, '2025-10-16', 'Cargo Express Logistics', 'Calle Copiapó 456, La Serena'),
(5, '2025-10-18', 'Distribuciones del Norte', 'Pedro de Valdivia 321, Valparaíso'),
(8, '2025-10-20', 'Transporte Sur Express', 'Av. España 987, Antofagasta'),
(12, '2025-10-21', 'Logística Central', 'Av. Vicuña Mackenna 741, Santiago'),
(1, '2025-10-15', 'FleteChile S.A.', 'Los Angeles 789, Concepción'),
(2, '2025-10-16', 'Express Courier', 'Esquina Norte 258, Viña del Mar'),
(5, '2025-10-18', 'Cargo Aéreo Nacional', 'Av. Copayapu 369, Copiapó'),
(8, '2025-10-20', 'Distribuciones Premium', 'Calle Los Olivos 852, Quilpué'),
(12, '2025-10-21', 'Transporte Terrestre Total', 'Av. San Martín 963, Rancagua');

-- ============================================
-- TABLA: LOG_RECEPCION (Mínimo 10 registros)
-- ============================================
-- Recepciones de proveedores (productos ingresando a inventario)
INSERT INTO log_recepcion (id_proveedor, id_producto, cantidad, fecha, observaciones) VALUES
(1, 1, 100, '2025-10-10', 'Recepción de leche fresca, temperatura correcta'),
(2, 9, 80, '2025-10-11', 'Jugo de naranja recibido en buen estado'),
(3, 11, 50, '2025-10-12', 'Shampoo recibido, empaque intacto'),
(4, 1, 75, '2025-10-13', 'Recepción parcial, falta completar orden'),
(5, 5, 60, '2025-10-14', 'Detergente recibido correctamente'),
(6, 12, 120, '2025-10-15', 'Atún en conserva, lote verificado'),
(7, 6, 90, '2025-10-16', 'Yogurt natural recibido'),
(8, 2, 150, '2025-10-17', 'Pan recibido y almacenado'),
(9, 10, 110, '2025-10-18', 'Fideos en buen estado'),
(10, 7, 70, '2025-10-19', 'Papel higiénico recibido completo'),
(11, 8, 130, '2025-10-20', 'Galletas recibidas, verificar fecha vencimiento'),
(12, 3, 95, '2025-10-21', 'Arroz recibido, saco en perfectas condiciones');

-- Verificación de registros insertados
SELECT 'Transportistas insertados:' AS tabla, COUNT(*) AS total FROM log_transportistas
UNION ALL
SELECT 'OT Picking insertadas:', COUNT(*) FROM log_ot_picking
UNION ALL
SELECT 'Detalles OT insertados:', COUNT(*) FROM log_ot_detalle
UNION ALL
SELECT 'Guías Despacho insertadas:', COUNT(*) FROM log_guia_despacho
UNION ALL
SELECT 'Recepciones insertadas:', COUNT(*) FROM log_recepcion;

-- Consulta de verificación de integridad referencial
SELECT 'Verificación de integridad:' AS resultado;

SELECT 
    'OT sin empleado asignado:' AS verificacion,
    COUNT(*) AS problemas
FROM log_ot_picking ot
LEFT JOIN empleados e ON ot.id_empleado = e.id_empleado
WHERE e.id_empleado IS NULL

UNION ALL

SELECT 
    'Guías sin OT válida:',
    COUNT(*)
FROM log_guia_despacho gd
LEFT JOIN log_ot_picking ot ON gd.id_ot = ot.id_ot
WHERE ot.id_ot IS NULL

UNION ALL

SELECT 
    'Recepciones sin proveedor válido:',
    COUNT(*)
FROM log_recepcion r
LEFT JOIN proveedores p ON r.id_proveedor = p.id_proveedor
WHERE p.id_proveedor IS NULL;
