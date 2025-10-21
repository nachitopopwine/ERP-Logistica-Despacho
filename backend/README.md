# Guía de Instalación - Backend

## Prerrequisitos

- **Node.js** versión 18.x o superior
- **PostgreSQL** versión 14.x o superior
- **pgAdmin4** (opcional, para administración visual)
- **npm** o **yarn**

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz de `backend/`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=erp_logistica

CORS_ORIGIN=http://localhost:5173
```

### 3. Crear Base de Datos

Opción A: **Usando pgAdmin4**
1. Abrir pgAdmin4
2. Conectarse al servidor PostgreSQL
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `erp_logistica`
5. Owner: `postgres`
6. Click "Save"

Opción B: **Usando psql (línea de comandos)**
```bash
psql -U postgres
CREATE DATABASE erp_logistica;
\q
```

### 4. Ejecutar Scripts SQL

```bash
# Conectarse a la base de datos
psql -U postgres -d erp_logistica

# Ejecutar scripts DDL (crear tablas)
\i database/ddl/01_maestros.sql
\i database/ddl/02_logistica.sql

# Ejecutar scripts DML (insertar datos)
\i database/dml/01_datos_maestros.sql
\i database/dml/02_datos_logistica.sql

# Salir
\q
```

**Alternativa usando pgAdmin4:**
1. Abrir Query Tool en la base de datos `erp_logistica`
2. Abrir y ejecutar cada script SQL en orden

### 5. Verificar Instalación

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Deberías ver:
```
✅ Conectado a PostgreSQL
🔗 Conexión a BD verificada: [timestamp]
🚀 Servidor corriendo en http://localhost:3000
📊 Health check: http://localhost:3000/health
```

### 6. Probar Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Listar órdenes de picking
curl http://localhost:3000/api/picking

# Listar guías de despacho
curl http://localhost:3000/api/despacho
```

## Scripts Disponibles

```bash
npm run dev      # Inicia servidor en modo desarrollo (con hot-reload)
npm run build    # Compila TypeScript a JavaScript
npm start        # Inicia servidor en modo producción
npm run lint     # Ejecuta linter de TypeScript
```

## Solución de Problemas

### Error: "Cannot connect to database"
- Verificar que PostgreSQL esté ejecutándose
- Revisar credenciales en archivo `.env`
- Verificar que el puerto 5432 esté disponible

### Error: "Module not found"
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"
- Cambiar el puerto en `.env`
- O detener el proceso usando el puerto 3000

## Estructura de Archivos

```
backend/
├── src/
│   ├── app.ts              # Punto de entrada principal
│   ├── config/
│   │   └── database.ts     # Configuración de PostgreSQL
│   ├── controllers/        # Lógica de negocio
│   │   ├── picking.controller.ts
│   │   ├── despacho.controller.ts
│   │   └── recepcion.controller.ts
│   ├── routes/             # Definición de rutas
│   │   ├── picking.routes.ts
│   │   ├── despacho.routes.ts
│   │   └── recepcion.routes.ts
│   └── middlewares/        # (Próximo Sprint)
├── package.json
├── tsconfig.json
└── .env
```

## Próximos Pasos

1. **Crear modelos TypeScript** para tipar las entidades
2. **Implementar validaciones adicionales** (mínimo 3 para Sprint 3)
3. **Agregar sistema de autenticación** (JWT)
4. **Documentar API** con Swagger/OpenAPI
