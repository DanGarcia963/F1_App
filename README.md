# F1_App - backend Supabase PostgreSQL (preparación)

Esta rama, `backend-supabase`, es una **propuesta de migración sin conexión a una base real**. No reemplaza `backend-deploy` (MySQL) hasta validar el nuevo proyecto.

## Base de datos

Crea un **proyecto nuevo en Supabase** (no usar `siu` ni `ollin-db`) e importa el archivo `F1_App_Supabase_PostgreSQL.sql` suministrado por ChatGPT desde el SQL Editor. Contiene nueve tablas, llaves foráneas, indices y una categoría inicial F1. El repositorio no tenía dump de datos históricos.

Se activa RLS en las tablas; no se incluyen políticas públicas y se revocan privilegios de tablas a anon/authenticated porque el frontend solo habla con la API Express de Railway. No colocar DATABASE_URL ni claves de servidor en Netlify.

## Railway

1. Crear un servicio desde el repositorio `DanGarcia963/F1_App` con branch `backend-supabase` (en paralelo al backend MySQL de producción).
2. Build: `npm install --omit=dev` (este branch todavía no tiene package-lock).
3. Start: `npm start`.
4. `DATABASE_URL`: cadena PostgreSQL **Session pooler** de Supabase, puerto 5432; copiarla desde Connect, sin inventar hostname. Reemplazar contraseña y URL-encode de caracteres reservados.
5. `ADMIN_API_KEY`: secreto largo y aleatorio.
6. `CORS_ORIGIN`: origen publico exacto de Netlify si se accede directamente a la API.
7. Comprobar `/api/health/live`, `/api/health` y `/api/categoria/`. Validar consultas y formularios antes de cambiar `BACKEND_URL` en Netlify.

## Compatibilidad

Los nueve modelos importan `connectionPostgres` en lugar de mysql2. Se migraron los parámetros a formato PostgreSQL y expresiones `IFNULL`, `GROUP_CONCAT`, `||` y alias. La API REST conserva sus rutas existentes.

**Pendiente de prueba real:** consultas SELECT agregadas/joins; las tablas están vacías salvo una categoría F1. Hay métodos heredados de `ResultsModel` que originalmente ya faltaban. No hacer el cambio de tráfico sin probar.

## Seguridad

Operaciones POST/PUT/PATCH/DELETE requieren encabezado X-Admin-Key (implementación anterior). El navegador pide la clave al administrador y la guarda solo en sessionStorage. Mejorar a cuentas y roles antes de exponer administración ampliamente.

## Estado de la conexion (noviembre de 2026)

Se corrigieron importaciones de PostgreSQL y errores de sintaxis en dos modelos.
La variable DATABASE_URL pertenece **solo a Railway** y debe obtenerse de Supabase > Connect. Para Node `pg`, usar el URL de Transaction pooler puerto 6543 o Session pooler puerto 5432 (ambos compatibles), y **no** reutilizar la clave de base de datos en mensajes ni en Git.
La cadena de Transaction pooler puede omitir `?pgbouncer=true`: ese parametro era especifico de configuraciones Prisma y no se requiere con `pg`.
El proyecto Supabase que la proporciona debe estar enlazado a la cuenta correcta y tener el SQL del esquema ejecutado. La rama no permite comprobar la base real sin una conexion activa.

## Railway: error TLS `SELF_SIGNED_CERT_IN_CHAIN`

La cadena de Supabase usa una CA propia. Para solucionarlo sin deshabilitar la validación TLS:

1. En Supabase: **Project Settings > Database > SSL Configuration > Download Certificate**.
2. En Railway, servicio de la rama `backend-supabase`, Variables: `SUPABASE_CA_CERT` = **contenido completo del archivo PEM** (incluidas cabecera y cierre; puede usar saltos de línea reales o `\\n`).
3. Añade `PGSSL_MODE=verify-full` y aplica un nuevo deployment.
4. Verifica `/api/health`, `/api/health/data` y `/api/categoria/`.

Como alternativa **temporal** mientras obtienes el certificado, `PGSSL_MODE=require` mantiene **TLS cifrado** pero desactiva **solo la verificación del certificado de PostgreSQL** (menor seguridad frente a intercepción). No uses `NODE_TLS_REJECT_UNAUTHORIZED=0`, porque desactiva verificación globalmente. Sustituye el modo temporal por `verify-full` con la CA oficial.

El backend elimina de su copia de `DATABASE_URL` parámetros como `sslmode` y `pgbouncer` para evitar que la librería `pg` reemplace la configuración SSL explícita. No modifica la variable almacenada en Railway.

Express 4 ahora envía al middleware de errores las excepciones de los controladores asincrónicos, para evitar que las solicitudes a la API reinicien Node. No modifica la estructura ni los datos de Supabase.
