# 🏗️ Arquitectura de Base de Datos - ERP Logística

**Fecha de limpieza:** 28 de octubre de 2025

---

## ✅ Estructura Final (Limpia)

### 📦 **Esquema: `Logistica`** (TU MÓDULO)
Tablas propias del módulo de Logística:

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `log_ot_picking` | Órdenes de Trabajo de Picking | 11 |
| `log_ot_detalle` | Detalles de las OT | 12 |
| `log_guia_despacho` | Guías de Despacho | 11 |
| `log_recepcion` | Recepciones de mercadería | 10 |
| `log_transportistas` | Transportistas disponibles | 10 |

---

### 🔗 **Esquema: `Ventas`** (INTEGRACIÓN)
Tablas del módulo de Ventas (otros equipos):

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `ventas` | Pedidos de ventas | 17 |
| `detalle_venta` | Productos por pedido | 31 |

**Backend consulta:** `integracion.controller.ts` → `listarPedidosVentas()`

---

### 🛒 **Esquema: `Compras`** (INTEGRACIÓN)
Tablas del módulo de Compras (otros equipos):

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `compras_oc` | Órdenes de Compra | 11 |
| `compras_detalle` | Productos por OC | 12 |

**Backend consulta:** `integracion.controller.ts` → `listarOrdenesCompra()`

---

### 🌐 **Esquema: `public`** (COMPARTIDO)
Tablas maestras compartidas entre todos los módulos:

| Tabla | Descripción | Uso en Logística |
|-------|-------------|------------------|
| `cliente` | Clientes de la empresa | JOIN con Ventas para direcciones |
| `producto` | Catálogo de productos | JOIN con detalles de OT/OC |
| `empleado` | Empleados de la empresa | Asignación de OT de Picking |
| `proveedor` | Proveedores | JOIN con Órdenes de Compra |

---


## 📊 Estado Dinámico de Pedidos

Los pedidos de venta tienen **estado calculado dinámicamente** en tiempo real:

```typescript
CASE 
  WHEN EXISTS (
    SELECT 1 FROM "Logistica".log_ot_picking 
    WHERE observaciones LIKE '%PV-' || LPAD(id_venta::text, 6, '0') || '%'
  ) THEN 'PROCESADO'
  ELSE 'PENDIENTE'
END
```

- **PENDIENTE:** Pedido sin OT de Picking asociada
- **PROCESADO:** Pedido con OT de Picking ya creada

---

## 🎯 Buenas Prácticas Aplicadas

✅ **Un solo esquema por módulo** (no duplicados)  
✅ **Integración con otros módulos** mediante consultas directas  
✅ **No duplicar datos** entre esquemas  
✅ **Estado dinámico** basado en relaciones reales  
✅ **Tablas maestras compartidas** en esquema `public`  

---

## 🔧 Variables de Entorno

```env
DB_SCHEMA=Logistica  # Esquema principal del módulo
```

El `search_path` se configura automáticamente en `database.ts`:
```typescript
await client.query(`SET search_path TO Logistica, public`);
```

Esto permite:
- Consultar `log_ot_picking` sin prefijo (usa `Logistica` por defecto)
- Consultar `empleado` sin prefijo (busca en `public`)
- Consultar otros esquemas con prefijo explícito: `"Ventas".ventas`
