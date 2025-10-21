# Documentación del Proyecto - Sprint 2

## Estado Actual del Proyecto

### ✅ Completado

1. **Estructura del Repositorio**
   - Carpetas organizadas: `backend/`, `frontend/`, `database/`, `docs/`
   - Archivos de configuración base
   - `.gitignore` configurado

2. **Base de Datos PostgreSQL**
   - **5 tablas maestras compartidas** (clientes, proveedores, productos, empleados)
   - **5 tablas del módulo** (log_ot_picking, log_ot_detalle, log_guia_despacho, log_recepcion, log_transportistas)
   - **Scripts DDL** para creación de estructura
   - **Scripts DML** con datos iniciales (12+ registros por tabla)
   - Integridad referencial implementada
   - Índices para optimización

3. **Backend (Node.js + Express + TypeScript)**
   - Servidor Express configurado
   - Conexión a PostgreSQL mediante `pg`
   - **3 módulos principales**:
     - Picking (Órdenes de Trabajo)
     - Despacho (Guías de Despacho)
     - Recepción (Registro de Mercadería)
   - **Endpoints REST implementados**:
     - `GET /api/picking` - Listar OT
     - `POST /api/picking` - Crear OT
     - `PUT /api/picking/:id` - Actualizar OT
     - `GET /api/despacho` - Listar guías
     - `POST /api/despacho` - Crear guía (con validación)
     - `GET /api/recepcion` - Listar recepciones
     - `POST /api/recepcion` - Registrar recepción
   - **Validación implementada**: No se puede crear guía de despacho sin OT válida
   - Health check endpoint

### 🚧 En Progreso

4. **Frontend (React + TypeScript)**
   - Pendiente de inicialización
   - Estructura planificada

### 📋 Próximos Pasos Inmediatos

#### Sprint 2 (HOY - 21/10/2025)

**Paso 1: Instalar dependencias del backend**
```bash
cd backend
npm install
```

**Paso 2: Configurar `.env`**
```bash
# Copiar .env.example a .env y configurar credenciales
cp .env.example .env
# Editar .env con credenciales de PostgreSQL
```

**Paso 3: Crear y poblar base de datos**
```sql
-- En pgAdmin4 o psql:
CREATE DATABASE erp_logistica;
-- Ejecutar scripts en orden:
\i database/ddl/01_maestros.sql
\i database/ddl/02_logistica.sql
\i database/dml/01_datos_maestros.sql
\i database/dml/02_datos_logistica.sql
```

**Paso 4: Iniciar backend**
```bash
cd backend
npm run dev
```

**Paso 5: Crear frontend React + TypeScript**
```bash
# Desde la raíz del proyecto
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios react-router-dom
npm install -D @types/react-router-dom
```

**Paso 6: Crear formularios básicos**
- Formulario OT de Picking
- Formulario Guía de Despacho
- Lista de OT existentes
- Lista de Guías existentes

---

## Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────┐
│         FRONTEND                    │
│   React + TypeScript + Vite        │
│   http://localhost:5173             │
└──────────────┬──────────────────────┘
               │ REST API (Axios)
               │
┌──────────────▼──────────────────────┐
│         BACKEND                     │
│   Node.js + Express + TypeScript   │
│   http://localhost:3000             │
└──────────────┬──────────────────────┘
               │ pg (PostgreSQL client)
               │
┌──────────────▼──────────────────────┐
│      BASE DE DATOS                  │
│   PostgreSQL (pgAdmin4)             │
│   localhost:5432                    │
└─────────────────────────────────────┘
```

### Modelo de Capas

**Capa 1: Presentación (Frontend)**
- Formularios de ingreso
- Tablas de consulta
- Navegación entre vistas

**Capa 2: Lógica de Negocio (Backend)**
- Controladores (Controllers)
- Validaciones
- Reglas de negocio

**Capa 3: Datos (PostgreSQL)**
- Tablas maestras
- Tablas transaccionales
- Integridad referencial

---

## Entregables Sprint 2

### Requisitos Obligatorios

- [x] **Base de datos con 5+ tablas** ✅
- [x] **Mínimo 10 registros por tabla** ✅
- [x] **Backend funcionando con conexión a BD** ✅
- [x] **Mínimo 1 validación implementada** ✅ (Validación de OT al crear guía)
- [ ] **2 formularios funcionales** ⏳ (Pendiente frontend)
- [ ] **Demo navegable** ⏳ (Pendiente integración)

### Documento de Entrega (PDF)

Debe incluir:

1. **Portada**
   - Nombre del proyecto
   - Integrantes
   - Fecha

2. **Actualización del Sprint 1**
   - Problemática y justificación
   - Diagrama BPMN
   - KPIs definidos

3. **Desarrollo Inicial MVP (Sprint 2)**
   - Captura de estructura del repositorio
   - Diagrama de arquitectura tecnológica
   - Modelo ER de la base de datos
   - Capturas de pgAdmin4 con tablas y datos
   - Capturas de endpoints funcionando (Postman/Thunder Client)
   - Código de validación implementada
   - Capturas de formularios (cuando estén listos)

4. **Conclusiones Sprint 2**
   - Lecciones aprendidas
   - Dificultades enfrentadas
   - Plan para Sprint 3

---

## Pruebas de Endpoints (Postman/Thunder Client)

### 1. Health Check
```http
GET http://localhost:3000/health
```

### 2. Listar Órdenes de Picking
```http
GET http://localhost:3000/api/picking
```

### 3. Crear Orden de Picking
```http
POST http://localhost:3000/api/picking
Content-Type: application/json

{
  "id_empleado": 1,
  "fecha": "2025-10-21",
  "estado": "PENDIENTE",
  "observaciones": "Orden de prueba"
}
```

### 4. Crear Guía de Despacho (con validación)
```http
POST http://localhost:3000/api/despacho
Content-Type: application/json

{
  "id_ot": 1,
  "fecha": "2025-10-21",
  "transportista": "Transportes Rápidos Chile",
  "direccion_entrega": "Av. Prueba 123, Santiago"
}
```

### 5. Registrar Recepción
```http
POST http://localhost:3000/api/recepcion
Content-Type: application/json

{
  "id_proveedor": 1,
  "id_producto": 1,
  "cantidad": 50,
  "fecha": "2025-10-21",
  "observaciones": "Recepción de prueba"
}
```

---

## Flujo de Trabajo Git

### Ramas Recomendadas

```bash
main                    # Rama principal (estable)
├── develop            # Rama de desarrollo
├── feature/frontend   # Frontend React
├── feature/forms      # Formularios
├── feature/auth       # Autenticación (Sprint 3)
└── feature/dashboard  # Dashboard (Sprint 4)
```

### Comandos Útiles

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/frontend

# Ver estado
git status

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: crear estructura inicial del frontend"

# Subir cambios
git push origin feature/frontend

# Volver a main
git checkout main

# Actualizar desde remoto
git pull origin main
```

---

## Plan para Sprint 3 (18/11/2025)

### Objetivos

1. **Integración completa con maestros canónicos**
   - Formularios usando datos de clientes, productos, empleados
   
2. **Sistema de autenticación y roles**
   - Login de usuarios
   - Middleware de autenticación JWT
   - Control de permisos por rol

3. **Validaciones extendidas (mínimo 3 total)**
   - ✅ Validación 1: Guía requiere OT válida
   - Validación 2: OT requiere stock disponible
   - Validación 3: Recepción no puede tener cantidad negativa

4. **Integración cruzada con otro módulo**
   - Coordinación con módulo de Inventario o Ventas

---

## Contacto y Colaboración

**Equipo**:
- Cristóbal Rios Barraza
- Matias Cortes Borquez
- Ignacio Rodriguez Bruna

**Docente**: Felipe Quiroz Valenzuela  
**Asignatura**: Sistemas de Información II  
**Universidad**: Universidad Católica del Norte
