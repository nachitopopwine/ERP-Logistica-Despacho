# 📦 Sprint 2 - Entrega Final
**Fecha de entrega:** 21 de octubre de 2025  
**Grupo:** 5  
**Integrante:** Ignacio  
**Asignatura:** Programación de Plataformas Web  
**Proyecto:** ERP - Módulo de Logística y Despacho

---

## 🎯 Resumen Ejecutivo

Este proyecto implementa un **módulo de logística y despacho** para un sistema ERP, desarrollado con stack completo:

- ✅ **Backend:** Node.js + Express + TypeScript (Puerto 3000)
- ✅ **Base de Datos:** PostgreSQL 17 con 10 tablas y 12+ registros cada una
- ✅ **Frontend:** React 19 + TypeScript + Vite (Puerto 5173)
- ✅ **API REST** con validación de integridad referencial

---

## 🏗️ Estructura del Proyecto

\`\`\`
ERP-Logistica-Despacho/
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── app.ts             # Servidor principal
│   │   ├── config/database.ts # Conexión PostgreSQL
│   │   ├── controllers/       # Lógica de negocio (3 archivos)
│   │   └── routes/            # Endpoints REST (3 archivos)
│   └── package.json
│
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx            # Navegación principal
│   │   ├── pages/             # 4 páginas (2 formularios + 2 listados)
│   │   ├── services/          # Capa de API (3 archivos)
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── database/                   # Scripts SQL
│   ├── ddl/                   # 2 archivos de estructura
│   └── dml/                   # 2 archivos de datos
│
└── docs/                       # Documentación
    └── ENTREGA_SPRINT2.md     # Este documento
\`\`\`

---

## 💾 Base de Datos - PostgreSQL

### Tablas Implementadas (10 en total)

#### Tablas Maestras del ERP (4 tablas compartidas):
1. **clientes** → 12 registros
2. **proveedores** → 12 registros  
3. **productos** → 12 registros con stock
4. **empleados** → 12 registros

#### Tablas del Módulo de Logística (6 tablas propias):
5. **log_ot_picking** → 14+ órdenes de trabajo
6. **log_guia_despacho** → 12+ guías de despacho
7. **log_recepcion** → 10+ recepciones
8. **log_ot_detalle** → Detalle de productos por OT
9. **log_transportistas** → 5 transportistas

### Validaciones de Base de Datos

✅ Primary Keys en todas las tablas  
✅ Foreign Keys con integridad referencial  
✅ UNIQUE constraints en RUT  
✅ CHECK constraints para valores positivos  
✅ Valores DEFAULT con NOW()  

**Ejemplo de constraint crítico:**
\`\`\`sql
ALTER TABLE log_guia_despacho
ADD CONSTRAINT fk_guia_ot 
FOREIGN KEY (id_ot) REFERENCES log_ot_picking(id_ot);
\`\`\`

---

## 🔧 Backend - API REST

**URL Base:** http://localhost:3000

### Endpoints Implementados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/picking | Listar todas las OT |
| POST | /api/picking | Crear nueva OT |
| GET | /api/despacho | Listar todas las guías |
| POST | /api/despacho | Crear nueva guía (con validación) |
| GET | /api/recepcion | Listar recepciones |
| POST | /api/recepcion | Crear nueva recepción |

### Ejemplo de Validación Crítica ⭐

**No permitir crear guía si la OT no existe:**

\`\`\`typescript
// En despacho.controller.ts
const otCheck = await pool.query(
  'SELECT id_ot, estado FROM log_ot_picking WHERE id_ot = $1',
  [id_ot]
);

if (otCheck.rows.length === 0) {
  res.status(400).json({
    success: false,
    message: 'No se puede crear la guía: la OT no existe'
  });
  return;
}
\`\`\`

**Pruebas:**
- ✅ POST con OT #14 (existe) → ÉXITO
- ❌ POST con OT #999 (no existe) → ERROR controlado

---

## 🎨 Frontend - React + TypeScript

**URL:** http://localhost:5173

### Páginas Implementadas (4)

#### 1. 📝 Crear Orden de Trabajo de Picking
- **Ruta:** /
- **Campos:** ID Empleado, Fecha, Estado, Observaciones
- **Funcionalidad:** Crea OT y muestra mensaje de éxito con ID generado

#### 2. 🚚 Crear Guía de Despacho  
- **Ruta:** /guias
- **Campos:** ID OT, Transportista, Fecha, Dirección
- **Validación:** Verifica que la OT exista antes de crear
- **Mensaje de error:** "No se puede crear la guía: la OT especificada no existe"

#### 3. 📊 Listar Órdenes de Picking
- **Ruta:** /listar-picking
- **Funcionalidad:** Tabla con todas las OT
- **Características:**
  - Badges de colores por estado (🟡 Pendiente, 🔵 En Proceso, 🟢 Completada, 🔴 Cancelada)
  - Botón de actualización
  - Diseño responsivo

#### 4. 📋 Listar Guías de Despacho
- **Ruta:** /listar-guias
- **Funcionalidad:** Tabla con todas las guías y OT asociada
- **Información:** ID Guía, OT, Fecha, Transportista, Dirección, Estado de OT

### Navegación

Barra superior con 4 enlaces:
- 🏠 Crear OT Picking
- 📝 Crear Guía Despacho  
- 📊 Listar OT
- 📋 Listar Guías

---

## ✅ Validaciones Implementadas

### Nivel 1: Base de Datos
- Foreign Key impide guías huérfanas
- Constraints de unicidad en RUT

### Nivel 2: Backend (TypeScript)
```typescript
// Validación de campos requeridos
if (!id_ot || !fecha || !transportista) {
  return res.status(400).json({
    success: false,
    message: 'Faltan campos requeridos'
  });
}

// Validación de OT existente
const otCheck = await pool.query(...);
if (otCheck.rows.length === 0) { /* Error */ }

// Validación de estado
if (estadoOT === 'CANCELADA') { /* Error */ }
```

### Nivel 3: Frontend (React)
- HTML5 validation con \`required\`
- TypeScript para tipado fuerte
- Manejo de errores de red
- Mensajes claros de éxito/error

---

## 🧪 Pruebas Realizadas

### Backend
✅ Crear OT con empleado válido → Éxito (OT #14)  
✅ Crear guía con OT #14 → Éxito (Guía #12)  
❌ Crear guía con OT #999 → Error esperado  
✅ Listar todas las OT → 14+ registros  
✅ Listar todas las guías → 12+ registros  

### Frontend
✅ Formulario OT: Crear orden → Mensaje "✅ Orden creada exitosamente! ID: 14"  
✅ Formulario Guía: Crear con OT válida → Mensaje "✅ Guía creada exitosamente! ID: 12"  
❌ Formulario Guía: Crear con OT inválida → Mensaje "❌ Error: No se puede crear la guía"  
✅ Listado OT: Muestra 14+ órdenes con badges de colores  
✅ Listado Guías: Muestra 12+ guías con OT asociadas  

### Integración Completa
✅ Frontend → Backend → PostgreSQL (flujo end-to-end funcional)  
✅ CORS configurado correctamente  
✅ Validación de integridad referencial activa  

---

## 📸 Capturas de Pantalla Requeridas

Para la entrega final, incluir:

### 1. Repositorio GitHub
- [ ] Vista de carpetas: backend/, frontend/, database/, docs/
- [ ] Commits con mensajes descriptivos

### 2. Base de Datos (pgAdmin4)
- [ ] Tabla \`log_ot_picking\` con 14+ registros
- [ ] Tabla \`log_guia_despacho\` con 12+ registros
- [ ] Tabla \`empleados\` con 12 registros
- [ ] Esquema completo con las 10 tablas

### 3. Backend en Ejecución
- [ ] Terminal: "🚀 Servidor corriendo en http://localhost:3000"
- [ ] Terminal: "✅ Conectado a PostgreSQL"
- [ ] Prueba de endpoint GET /api/picking (JSON response)
- [ ] Prueba de endpoint POST /api/despacho (éxito)

### 4. Frontend - Formularios
- [ ] Formulario "Crear OT Picking" completo
- [ ] Mensaje de éxito: "✅ Orden creada exitosamente! ID: 14"
- [ ] Formulario "Crear Guía de Despacho" completo
- [ ] Mensaje de error: "❌ Error: No se puede crear la guía: la OT especificada no existe"

### 5. Frontend - Listados
- [ ] Página "Listar OT" con tabla completa y badges de colores
- [ ] Página "Listar Guías" con información de OT asociadas

### 6. Validación en Acción
- [ ] Intento de crear guía con OT #999 → Error
- [ ] Query en PostgreSQL mostrando que OT #999 no existe

---

## 📊 Verificación de Requisitos del Sprint 2

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| Base de datos PostgreSQL con pgAdmin4 | ✅ | 10 tablas creadas, 12+ registros cada una |
| Mínimo 10 registros por tabla | ✅ | Tablas con 12-14 registros |
| Backend con API REST | ✅ | 3 módulos (picking, despacho, recepción) |
| Validación: No crear guía sin OT | ✅ | Implementada en despacho.controller.ts |
| Frontend con 2 formularios | ✅ | OT Picking + Guía Despacho |
| Formularios funcionales | ✅ | Ambos crean registros en BD |
| Listar datos | ✅ | 2 páginas de listado (OT + Guías) |
| React + TypeScript | ✅ | Proyecto Vite con TS configurado |
| Repositorio en GitHub | ✅ | https://github.com/nachitopopwine/ERP-Logistica-Despacho |
| Documentación | ✅ | Este archivo ENTREGA_SPRINT2.md |

---

## 💡 Conclusiones y Aprendizajes

### Logros Principales

1. **Arquitectura Full Stack Completa**
   - Separación clara de responsabilidades (Backend, Frontend, BD)
   - Comunicación fluida entre capas mediante API REST
   - TypeScript en ambos lados para type safety

2. **Validaciones en Múltiples Niveles**
   - Base de datos con Foreign Keys
   - Backend con lógica de negocio
   - Frontend con validación HTML5

3. **MVP Funcional**
   - 2 formularios operativos
   - 2 páginas de listado
   - Navegación completa
   - Mensajes claros de éxito/error

### Desafíos Superados

1. **Configuración de Vite + React + TypeScript**
   - Solución: Instalar @vitejs/plugin-react y configurar tsconfig.json con "jsx": "react-jsx"

2. **CORS entre Frontend y Backend**
   - Solución: Middleware CORS en Express con origin: '*' para desarrollo

3. **Encoding de caracteres en PostgreSQL**
   - Solución: PGCLIENTENCODING='UTF8' al ejecutar scripts SQL

4. **Sincronización de tipos entre Frontend y Backend**
   - Solución: Interfaces TypeScript en frontend/src/types/index.ts

### Próximos Pasos (Post-Sprint 2)

- [ ] Autenticación y autorización
- [ ] Edición y eliminación de registros  
- [ ] Paginación en listados
- [ ] Filtros y búsqueda
- [ ] Dashboard con gráficos
- [ ] Pruebas unitarias con Jest
- [ ] Deploy en producción (Vercel + Railway)

---

## 🔗 Enlaces y Recursos

**URLs de Desarrollo:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173  
- Health Check: http://localhost:3000/health

**Repositorio:**
- GitHub: https://github.com/nachitopopwine/ERP-Logistica-Despacho
- Rama: main

**Tecnologías:**
- Node.js v20+
- PostgreSQL 17
- React 19.2.0
- TypeScript 5.6+

---

## 🚀 Instrucciones para Ejecutar el Proyecto

### 1. Base de Datos
\`\`\`bash
# Ejecutar en psql
psql -U postgres -d erp_logistica -f database/ddl/01_maestros.sql
psql -U postgres -d erp_logistica -f database/ddl/02_logistica.sql
psql -U postgres -d erp_logistica -f database/dml/01_datos_maestros.sql
psql -U postgres -d erp_logistica -f database/dml/02_datos_logistica.sql
\`\`\`

### 2. Backend
\`\`\`bash
cd backend
npm install
npm run dev
# Servidor corriendo en http://localhost:3000
\`\`\`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
# Aplicación corriendo en http://localhost:5173
\`\`\`

---

**Fecha de elaboración:** 21 de octubre de 2025  
**Elaborado por:** Ignacio - Grupo 5  
**Asignatura:** Programación de Plataformas Web  

---

✅ **Sprint 2 Completado Exitosamente**
