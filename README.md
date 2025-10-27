# ERP - Módulo de Logística/Despacho

## Grupo 5 - Sistemas de Información II

**Integrantes:**

- Cristóbal Rios Barraza
- Matias Cortes Borquez
- Ignacio Rodriguez Bruna
- Eduardo Miranda Cortés
- Vicente Cortés Espinoza

---

## 📋 Descripción del Proyecto

Módulo de Logística/Despacho para sistema ERP integrado. Este módulo coordina:

- **Despachos desde Ventas**: OT de Picking → Guía de Despacho → Egreso de Inventario
- **Recepciones desde Compras**: Registro de Recepción → Ingreso a Inventario

---

## 🛠️ Stack Tecnológico

### Backend

- **Node.js** + **Express**
- **TypeScript**
- **PostgreSQL** (Base de datos)
- **pg** (PostgreSQL client)

### Frontend

- **React** + **TypeScript**
- **Vite** (Build tool)
- **Axios** (HTTP client)
- **React Router** (Navegación)

### Base de Datos

- **PostgreSQL** (esquema public y esquema logistica)
- **pgAdmin4** (Administración)

---

## 📁 Estructura del Proyecto

```
ERP-Logistica-Despacho/
├── backend/              # API REST con Express + TypeScript
│   ├── src/
│   │   ├── config/      # Configuración de DB y variables de entorno
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── routes/      # Definición de endpoints
│   │   ├── models/      # Modelos de datos
│   │   ├── middlewares/ # Validaciones y autenticación
│   │   └── app.ts       # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Vistas principales
│   │   ├── services/    # Llamadas a la API
│   │   ├── types/       # Definiciones TypeScript
│   │   └── App.tsx      # Componente principal
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                 # Documentación
    ├── arquitectura.md
    ├── sprint2.md
    └── diagramas/
```

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/nachitopopwine/ERP-Logistica-Despacho.git
cd ERP-Logistica-Despacho
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` (basado en `.env.example`):

```env
# Puerto del servidor
PORT=3000

# Configuración de conexión a PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=erp_logistica

# Opcional: Esquemas si quieres diferenciarlos explícitamente
SCHEMA_PUBLIC=public
SCHEMA_LOGISTICA=logistica
```

Iniciar servidor:

```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 📊 Entregables Sprint 2 (21/10/2025)

- ✅ Repositorio GitHub configurado
- ✅ Base de datos con 5+ tablas y datos iniciales (10+ registros)
- ✅ Backend funcionando con conexión a PostgreSQL
- ✅ Al menos 2 formularios funcionales (OT Picking y Guía de Despacho)
- ✅ Mínimo 1 validación implementada
- ✅ Demo navegable del módulo

---

## 🔗 Endpoints API (Backend)

### Órdenes de Picking

- `GET /api/picking` - Listar todas las OT
- `GET /api/picking/:id` - Obtener una OT específica
- `POST /api/picking` - Crear nueva OT
- `PUT /api/picking/:id` - Actualizar OT

### Guías de Despacho

- `GET /api/despacho` - Listar guías
- `POST /api/despacho` - Crear guía de despacho

### Recepciones

- `GET /api/recepcion` - Listar recepciones
- `POST /api/recepcion` - Registrar recepción

---

## 📈 KPIs del Módulo

1. **% de entregas a tiempo**
2. **Tiempo promedio de despacho**
3. **% de errores en recepción**
4. **Tasa de cumplimiento de órdenes de picking**
5. **Tiempo promedio de registro de recepción**

---

## 🔄 Flujo de Trabajo Git

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nombre-funcionalidad

# Hacer commits
git add .
git commit -m "feat: descripción del cambio"

# Subir cambios
git push origin feature/nombre-funcionalidad

# Crear Pull Request en GitHub
```

---

## 📝 Próximos Pasos

### Sprint 2 (Actual)

- [ ] Formulario OT de Picking funcional
- [ ] Formulario Guía de Despacho funcional
- [ ] Validación: No crear guía sin OT válida
- [ ] Consulta de OT y Guías existentes

### Sprint 3 (18/11)

- [ ] Integración con maestros canónicos (clientes, productos, empleados)
- [ ] Sistema de autenticación y roles
- [ ] 3 validaciones en total
- [ ] Integración cruzada con otro módulo

### Sprint 4 (09/12)

- [ ] Dashboard en Power BI
- [ ] Carga de 100+ registros en tabla crítica
- [ ] Pruebas de integración documentadas

---

## 👥 Contribuidores

- Cristóbal Rios Barraza
- Matias Cortes Borquez
- Ignacio Rodriguez Bruna
- Eduardo Miranda Cortés
- Vicente Cortés Espinoza

**Docente:** Felipe Quiroz Valenzuela  
**Asignatura:** Sistemas de Información II  
**Universidad Católica del Norte**
