# 📋 DOCUMENTACIÓN TÉCNICA - DATOS Y BASE DE DATOS

## 🗄️ BASE DE DATOS COMPARTIDA (Neon PostgreSQL)

**Conexión:** Base de datos compartida en la nube entre 5 grupos UCN

### ✅ TABLAS QUE SÍ EXISTEN EN BD COMPARTIDA Y SE USAN:

#### 1. `public.empleado` 
- **Uso:** Selector de empleados en "Crear OT"
- **Consulta:** `SELECT id_empleado, nombre, apellido, rol FROM public.empleado WHERE estado='ACTIVO'`
- **Cantidad:** 12 empleados activos
- **Estado:** ✅ FUNCIONAL - Se consulta directamente desde BD

#### 2. `Logistica.log_ot_picking` (Órdenes de Trabajo)
- **Uso:** Listar OT, selector en "Crear Guía"
- **Consulta:** `SELECT * FROM Logistica.log_ot_picking`
- **Estado:** ✅ FUNCIONAL - Se consulta directamente desde BD

#### 3. `Logistica.log_guia_despacho` (Guías de Despacho)
- **Uso:** Listar guías de despacho
- **Consulta:** `SELECT * FROM Logistica.log_guia_despacho`
- **Estado:** ✅ FUNCIONAL - Se consulta directamente desde BD

---

## 🧪 DATOS DE PRUEBA LOCALES (NO ESTÁN EN BD)

**⚠️ IMPORTANTE:** Los siguientes datos NO modifican la base de datos compartida. Son datos simulados que viven solo en el código del backend para demostración.

### 1. 📦 PEDIDOS DE VENTA (Integración con ERP Ventas)

**Ubicación:** `backend/src/controllers/integracion.controller.ts` → función `listarPedidosVentas()`

**Datos de prueba:**
```javascript
[
  {
    id: 1,
    numero_pedido: 'PV-2025-001',
    cliente: 'Comercial Norte S.A.',
    direccion_despacho: 'Av. Angamos 0610, Antofagasta',
    estado: 'PENDIENTE'
  },
  {
    id: 2,
    numero_pedido: 'PV-2025-002',
    cliente: 'Distribuidora del Sur Ltda.',
    direccion_despacho: 'Calle Prat 1234, Santiago',
    estado: 'PENDIENTE'
  },
  {
    id: 3,
    numero_pedido: 'PV-2025-003',
    cliente: 'Retail Express S.A.',
    direccion_despacho: 'Av. Libertador Bernardo O\'Higgins 3450, Santiago',
    estado: 'PENDIENTE'
  },
  {
    id: 4,
    numero_pedido: 'PV-2025-004',
    cliente: 'Supermercados Unidos',
    direccion_despacho: 'Av. Providencia 2290, Santiago',
    estado: 'PROCESADO'
  }
]
```

**Endpoints:**
- `GET /api/integracion/pedidos-ventas` → Retorna estos datos
- `GET /api/integracion/pedidos-ventas/:id` → Retorna un pedido específico

**Usado en:**
- Página "📥 Ver Pedidos"
- Selector de pedidos en "📝 Crear OT"

---

### 2. 📋 ÓRDENES DE COMPRA (Integración con ERP Compras)

**Ubicación:** `backend/src/controllers/integracion.controller.ts` → función `listarOrdenesCompra()`

**Datos de prueba:**
```javascript
[
  {
    id: 1,
    numero_orden: 'OC-2025-001',
    proveedor: 'Proveedor Tech Ltda.',
    estado: 'PENDIENTE',
    fecha_esperada_entrega: '2025-10-30'
  },
  {
    id: 2,
    numero_orden: 'OC-2025-002',
    proveedor: 'Distribuidora Industrial S.A.',
    estado: 'PENDIENTE',
    fecha_esperada_entrega: '2025-11-05'
  },
  {
    id: 3,
    numero_orden: 'OC-2025-003',
    proveedor: 'Importadora Global',
    estado: 'RECEPCIONADA',
    fecha_esperada_entrega: '2025-10-25'
  }
]
```

**Endpoints:**
- `GET /api/integracion/ordenes-compra` → Retorna estos datos
- `GET /api/integracion/ordenes-compra/:id` → Retorna una OC específica

**Usado en:**
- Página "📦 Ver OC"

---

### 3. 🚚 TRANSPORTISTAS

**Ubicación:** `backend/src/controllers/recursos.controller.ts` → función `listarTransportistas()`

**Datos de prueba:**
```javascript
[
  {
    id: 1,
    nombre: 'Transportes Rápidos S.A.',
    rut: '76.123.456-7',
    telefono: '+56912345678',
    email: 'contacto@rapidos.cl'
  },
  {
    id: 2,
    nombre: 'LogiExpress Ltda.',
    rut: '77.234.567-8',
    telefono: '+56923456789',
    email: 'info@logiexpress.cl'
  },
  {
    id: 3,
    nombre: 'Cargo Norte',
    rut: '78.345.678-9',
    telefono: '+56934567890',
    email: 'ventas@cargonorte.cl'
  },
  {
    id: 4,
    nombre: 'Transportes del Sur',
    rut: '79.456.789-0',
    telefono: '+56945678901',
    email: 'contacto@delsur.cl'
  },
  {
    id: 5,
    nombre: 'Express Delivery',
    rut: '80.567.890-1',
    telefono: '+56956789012',
    email: 'info@express.cl'
  }
]
```

**Endpoints:**
- `GET /api/recursos/transportistas` → Retorna estos datos

**Usado en:**
- Selector de transportistas en "🚚 Crear Guía"

---

## 🔄 FLUJO DE INTEGRACIÓN SIMULADO

### Escenario 1: Crear Orden de Trabajo desde Pedido de Venta

1. **Usuario va a "📝 Crear OT"**
2. **Selector "Empleado":** Consulta BD real → `public.empleado`
3. **Selector "Pedido":** Usa datos de prueba locales (PV-2025-001, PV-2025-002, etc.)
4. **Al seleccionar pedido:** Dirección se auto-llena desde datos de prueba
5. **Al crear OT:** Se guarda en BD real → `Logistica.log_ot_picking` con la dirección en campo `observaciones`

### Escenario 2: Crear Guía de Despacho

1. **Usuario va a "🚚 Crear Guía"**
2. **Selector "OT":** Consulta BD real → `Logistica.log_ot_picking`
3. **Al seleccionar OT:** Lee campo `observaciones` y extrae dirección
4. **Selector "Transportista":** Usa datos de prueba locales
5. **Campo "Dirección":** Se auto-llena y queda read-only
6. **Al crear guía:** Se guarda en BD real → `Logistica.log_guia_despacho`

---

## 📝 FORMATO DE OBSERVACIONES EN OT

Cuando se crea una OT desde un pedido, el campo `observaciones` guarda:

```
Pedido: PV-2025-001 | Cliente: Comercial Norte S.A. | Dirección: Av. Angamos 0610, Antofagasta
```

Este formato permite:
1. Trazabilidad del pedido origen
2. Extraer dirección automáticamente en "Crear Guía"
3. Ver información del cliente

**Regex para extraer dirección:**
```javascript
const direccionMatch = observaciones.match(/Dirección:\s*(.+?)(?:\||$)/);
const direccion = direccionMatch[1].trim();
```

---

## 🎯 ENDPOINTS DEL BACKEND

### Recursos (Datos reales y de prueba)
- `GET /api/recursos/empleados` → ✅ BD Real
- `GET /api/recursos/transportistas` → 🧪 Datos de prueba

### Integración (Todos datos de prueba)
- `GET /api/integracion/pedidos-ventas` → 🧪 Datos de prueba
- `GET /api/integracion/pedidos-ventas/:id` → 🧪 Datos de prueba
- `GET /api/integracion/ordenes-compra` → 🧪 Datos de prueba
- `GET /api/integracion/ordenes-compra/:id` → 🧪 Datos de prueba

### Picking (BD Real)
- `GET /api/picking` → ✅ BD Real
- `POST /api/picking` → ✅ BD Real

### Despacho (BD Real)
- `GET /api/despacho` → ✅ BD Real
- `POST /api/despacho` → ✅ BD Real

---

## 🚀 PARA PRODUCCIÓN REAL

Cuando la BD compartida tenga las tablas necesarias, cambiar en:

**`backend/src/controllers/integracion.controller.ts`:**

```typescript
// REEMPLAZAR datos de prueba con queries reales:
export const listarPedidosVentas = async (_req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT * FROM Logistica.pedidos_ventas WHERE estado = 'PENDIENTE'
  `);
  res.json({ success: true, data: result.rows });
};
```

**`backend/src/controllers/recursos.controller.ts`:**

```typescript
// REEMPLAZAR datos de prueba con query real:
export const listarTransportistas = async (_req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT * FROM Logistica.transportistas WHERE activo = true
  `);
  res.json({ success: true, data: result.rows });
};
```

---

## 📊 RESUMEN

| Recurso | Origen | Estado |
|---------|--------|--------|
| Empleados | BD Real (`public.empleado`) | ✅ Funcional |
| Órdenes de Trabajo | BD Real (`Logistica.log_ot_picking`) | ✅ Funcional |
| Guías de Despacho | BD Real (`Logistica.log_guia_despacho`) | ✅ Funcional |
| Pedidos de Venta | Datos de Prueba Locales | 🧪 Simulado |
| Órdenes de Compra | Datos de Prueba Locales | 🧪 Simulado |
| Transportistas | Datos de Prueba Locales | 🧪 Simulado |

---

## ✅ VERIFICACIÓN

Para verificar que todo funciona:

1. **Backend:** `http://localhost:3000/api/recursos/empleados` → Debe mostrar empleados reales
2. **Backend:** `http://localhost:3000/api/integracion/pedidos-ventas` → Debe mostrar 4 pedidos de prueba
3. **Frontend:** Abrir "📥 Ver Pedidos" → Debe mostrar los 4 pedidos
4. **Frontend:** Crear OT → Debe mostrar empleados reales y pedidos de prueba
5. **Frontend:** Crear Guía → Debe mostrar OTs reales y transportistas de prueba

---

**Última actualización:** 28 de Octubre 2025
**Responsable:** Sistema ERP Logística - Módulo Despacho
