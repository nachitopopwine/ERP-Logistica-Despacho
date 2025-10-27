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

### 3️⃣ Iniciar el Servidor Backend

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

### 4️⃣ Probar Endpoints

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
