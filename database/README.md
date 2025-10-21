# Scripts de Base de Datos - Módulo Logística/Despacho

## Estructura de la Base de Datos

La base de datos está organizada en dos conjuntos de scripts:

### DDL (Data Definition Language)
Scripts para crear la estructura de tablas:
- `01_maestros.sql` - Tablas maestras compartidas entre módulos
- `02_logistica.sql` - Tablas propias del módulo de Logística

### DML (Data Manipulation Language)
Scripts para insertar datos iniciales:
- `01_datos_maestros.sql` - Datos de tablas maestras
- `02_datos_logistica.sql` - Datos del módulo de Logística

## Orden de Ejecución

**⚠️ IMPORTANTE**: Los scripts deben ejecutarse en el siguiente orden:

```sql
-- 1. Crear tablas maestras
\i ddl/01_maestros.sql

-- 2. Crear tablas de logística
\i ddl/02_logistica.sql

-- 3. Insertar datos maestros
\i dml/01_datos_maestros.sql

-- 4. Insertar datos de logística
\i dml/02_datos_logistica.sql
```

## Tablas Maestras (Compartidas)

### `clientes`
- **Dueño**: Módulo Ventas
- **Descripción**: Registro de clientes de la organización
- **Registros iniciales**: 12

### `proveedores`
- **Dueño**: Módulo Compras
- **Descripción**: Registro de proveedores
- **Registros iniciales**: 12

### `productos`
- **Dueño**: Módulo Inventario
- **Descripción**: Catálogo de productos
- **Registros iniciales**: 12

### `empleados`
- **Dueño**: Módulo RRHH
- **Descripción**: Empleados de la organización
- **Registros iniciales**: 12

## Tablas del Módulo Logística

### `log_ot_picking`
- **Descripción**: Órdenes de Trabajo de Picking
- **Estados**: PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA
- **Relaciones**: → empleados
- **Registros iniciales**: 12

### `log_ot_detalle`
- **Descripción**: Detalle de productos en cada OT
- **Relaciones**: → log_ot_picking, → productos
- **Registros iniciales**: 25+

### `log_guia_despacho`
- **Descripción**: Guías de despacho emitidas
- **Relaciones**: → log_ot_picking
- **Registros iniciales**: 10

### `log_recepcion`
- **Descripción**: Recepciones de mercadería
- **Relaciones**: → proveedores, → productos
- **Registros iniciales**: 12

### `log_transportistas`
- **Descripción**: Maestro de transportistas
- **Registros iniciales**: 12

## Diagrama Entidad-Relación

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│  empleados  │◄────────│log_ot_picking│────────►│log_guia_despacho│
└─────────────┘         └──────────────┘         └────────────────┘
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │log_ot_detalle│
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  productos   │◄──────┐
                        └──────────────┘       │
                                               │
┌─────────────┐         ┌──────────────┐      │
│ proveedores │◄────────│log_recepcion │──────┘
└─────────────┘         └──────────────┘
```

## Validaciones e Integridad

### Claves Primarias
Todas las tablas tienen claves primarias auto-incrementales (SERIAL)

### Claves Foráneas
- `log_ot_picking.id_empleado` → `empleados.id_empleado`
- `log_guia_despacho.id_ot` → `log_ot_picking.id_ot`
- `log_ot_detalle.id_ot` → `log_ot_picking.id_ot`
- `log_ot_detalle.id_producto` → `productos.id_producto`
- `log_recepcion.id_proveedor` → `proveedores.id_proveedor`
- `log_recepcion.id_producto` → `productos.id_producto`

### Constraints
- `CHECK (cantidad > 0)` en recepciones y detalles
- `CHECK (stock_actual >= 0)` en productos
- `CHECK (estado IN (...))` en órdenes de picking
- `UNIQUE (id_ot, id_producto)` en detalle de OT

### Índices
Se crearon índices en:
- Claves foráneas (mejorar JOIN)
- Campos de búsqueda frecuente (fecha, estado)
- Campos únicos (RUT, SKU)

## Consultas Útiles

### Verificar cantidad de registros
```sql
SELECT 
    'clientes' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'proveedores', COUNT(*) FROM proveedores
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'empleados', COUNT(*) FROM empleados
UNION ALL
SELECT 'log_ot_picking', COUNT(*) FROM log_ot_picking
UNION ALL
SELECT 'log_guia_despacho', COUNT(*) FROM log_guia_despacho
UNION ALL
SELECT 'log_recepcion', COUNT(*) FROM log_recepcion;
```

### Listar OT con empleado responsable
```sql
SELECT 
    op.id_ot,
    e.nombre || ' ' || e.apellido as empleado,
    op.fecha,
    op.estado
FROM log_ot_picking op
JOIN empleados e ON op.id_empleado = e.id_empleado
ORDER BY op.fecha DESC;
```

### Listar guías con información completa
```sql
SELECT 
    gd.id_guia,
    gd.fecha,
    gd.transportista,
    op.id_ot,
    op.estado,
    e.nombre || ' ' || e.apellido as responsable
FROM log_guia_despacho gd
JOIN log_ot_picking op ON gd.id_ot = op.id_ot
JOIN empleados e ON op.id_empleado = e.id_empleado
ORDER BY gd.fecha DESC;
```

### Consultar recepciones con proveedor y producto
```sql
SELECT 
    r.id_recepcion,
    r.fecha,
    prov.nombre as proveedor,
    prod.nombre as producto,
    r.cantidad,
    r.observaciones
FROM log_recepcion r
JOIN proveedores prov ON r.id_proveedor = prov.id_proveedor
JOIN productos prod ON r.id_producto = prod.id_producto
ORDER BY r.fecha DESC;
```

## Respaldo y Restauración

### Crear respaldo
```bash
pg_dump -U postgres -d erp_logistica > backup_erp_logistica.sql
```

### Restaurar desde respaldo
```bash
psql -U postgres -d erp_logistica < backup_erp_logistica.sql
```

## Notas Importantes

1. **Convenciones de nombres**: Todas las tablas usan minúsculas con guiones bajos
2. **Prefijos**: Tablas del módulo de logística usan prefijo `log_`
3. **IDs canónicos**: Se respetan los nombres estándar (id_cliente, id_proveedor, etc.)
4. **Timestamps**: Todas las tablas principales tienen `fecha_creacion`
5. **Soft delete**: Campo `activo` en tablas maestras para eliminación lógica

## Para Sprint 3

- [ ] Agregar tabla de usuarios y roles
- [ ] Implementar triggers para auditoría
- [ ] Crear vistas para reportes
- [ ] Agregar stored procedures para procesos complejos
