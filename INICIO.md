# 🚀 GUÍA DE INICIO RÁPIDO - Sprint 2

## ✅ Pasos para Comenzar (En Orden)

### 1️⃣ Instalar Dependencias del Backend

```powershell
cd backend
npm install
```

### 2️⃣ Configurar Variables de Entorno

```powershell
# Copiar el archivo de ejemplo
Copy-Item .env.example .env

# Editar .env con tus credenciales de PostgreSQL
notepad .env
```

Configurar así:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=erp_logistica

CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Crear Base de Datos en pgAdmin4

1. Abrir **pgAdmin4**
2. Conectarse a PostgreSQL
3. Click derecho en **"Databases"** → **"Create"** → **"Database..."**
4. **Database name**: `erp_logistica`
5. **Owner**: `postgres`
6. Click **"Save"**

### 4️⃣ Ejecutar Scripts SQL

**Opción A: Desde pgAdmin4 (Recomendado)**

1. Click derecho en la base de datos `erp_logistica`
2. Click en **"Query Tool"**
3. Abrir cada script y ejecutarlo en este orden:

   a. `database/ddl/01_maestros.sql` → Click F5 o ⚡
   
   b. `database/ddl/02_logistica.sql` → Click F5 o ⚡
   
   c. `database/dml/01_datos_maestros.sql` → Click F5 o ⚡
   
   d. `database/dml/02_datos_logistica.sql` → Click F5 o ⚡

**Opción B: Desde PowerShell**

```powershell
# Conectarse a PostgreSQL y ejecutar scripts
psql -U postgres -d erp_logistica -f database/ddl/01_maestros.sql
psql -U postgres -d erp_logistica -f database/ddl/02_logistica.sql
psql -U postgres -d erp_logistica -f database/dml/01_datos_maestros.sql
psql -U postgres -d erp_logistica -f database/dml/02_datos_logistica.sql
```

### 5️⃣ Verificar Datos en pgAdmin4

1. Expandir `erp_logistica` → `Schemas` → `public` → `Tables`
2. Click derecho en cualquier tabla → `View/Edit Data` → `All Rows`
3. Deberías ver los datos cargados

### 6️⃣ Iniciar el Servidor Backend

```powershell
cd backend
npm run dev
```

**Deberías ver:**
```
✅ Conectado a PostgreSQL
🔗 Conexión a BD verificada: [timestamp]
🚀 Servidor corriendo en http://localhost:3000
📊 Health check: http://localhost:3000/health
📦 Endpoints disponibles:
   - GET  /api/picking
   - POST /api/picking
   ...
```

### 7️⃣ Probar Endpoints

**Opción A: Usar navegador**

Abrir en el navegador:
- http://localhost:3000/
- http://localhost:3000/health
- http://localhost:3000/api/picking

**Opción B: Usar Thunder Client en VS Code**

1. Instalar extensión "Thunder Client" en VS Code
2. Crear request:
   - Method: `GET`
   - URL: `http://localhost:3000/api/picking`
   - Click **"Send"**

**Opción C: Usar PowerShell**

```powershell
# Listar órdenes de picking
Invoke-WebRequest -Uri "http://localhost:3000/api/picking" -Method GET | Select-Object -ExpandProperty Content

# Crear nueva OT
$body = @{
    id_empleado = 1
    fecha = "2025-10-21"
    estado = "PENDIENTE"
    observaciones = "Prueba desde PowerShell"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/picking" -Method POST -Body $body -ContentType "application/json"
```

---

## 🎯 Siguientes Pasos (Después de verificar backend)

### Crear Frontend con React + TypeScript

```powershell
# Volver a la raíz del proyecto
cd..

# Crear proyecto React con Vite
npm create vite@latest frontend -- --template react-ts

# Entrar a la carpeta e instalar dependencias
cd frontend
npm install

# Instalar librerías adicionales
npm install axios react-router-dom

# Iniciar frontend
npm run dev
```

El frontend estará en: http://localhost:5173

---

## 📸 Capturas para el Informe Sprint 2

Debes tomar capturas de:

1. ✅ **Estructura del repositorio** (carpetas en VS Code)
2. ✅ **pgAdmin4** mostrando las tablas con datos
3. ✅ **Terminal** con el servidor corriendo
4. ✅ **Thunder Client / Navegador** con respuestas de endpoints
5. ⏳ **Formularios funcionando** (cuando estén listos)

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "Cannot find module 'express'"

```powershell
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Error: "password authentication failed"

- Revisar archivo `.env`
- Verificar password de PostgreSQL

### Error: "Port 3000 is already in use"

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID [numero] /F

# O cambiar el puerto en .env
# PORT=3001
```

### Error: "relation does not exist"

- Los scripts SQL no se ejecutaron correctamente
- Volver a ejecutar en orden: DDL primero, DML después

---

## 📝 Checklist Sprint 2

- [ ] Backend instalado y corriendo
- [ ] Base de datos creada con 10 tablas
- [ ] Datos cargados (12+ registros por tabla)
- [ ] Endpoints respondiendo correctamente
- [ ] Validación implementada (guía requiere OT válida)
- [ ] Frontend creado (básico)
- [ ] 2 formularios funcionando
- [ ] Capturas tomadas para informe

---

## 🔄 Workflow Git Recomendado

```powershell
# Ver estado actual
git status

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "feat: configuración inicial Sprint 2 - backend + DB"

# Subir a GitHub
git push origin main

# Para trabajar en frontend, crear rama
git checkout -b feature/frontend
git add .
git commit -m "feat: estructura inicial frontend React + TypeScript"
git push origin feature/frontend
```

---

## 📞 Ayuda

Si tienes problemas:

1. Revisar los archivos README en cada carpeta:
   - `backend/README.md`
   - `database/README.md`
   - `docs/SPRINT2.md`

2. Verificar que PostgreSQL esté corriendo

3. Revisar logs en la terminal del backend

4. Contactar al equipo para resolución conjunta

---

**¡Éxito con el Sprint 2!** 🚀
