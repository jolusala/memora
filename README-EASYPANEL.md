# picbook — despliegue en EasyPanel

Esta app necesita 3 cosas en EasyPanel: una base de datos PostgreSQL,
un volumen persistente para las fotos, y el servicio de la app.

## 1. Crear la base de datos

En EasyPanel: **+ Crear servicio → PostgreSQL** (plantilla incluida).
Ponle un nombre, por ejemplo `picbook-db`. Cuando esté listo, EasyPanel
te da los datos de conexión (host, usuario, contraseña, puerto,
nombre de base). Con eso arma tu `DATABASE_URL`:

```
postgres://usuario:contraseña@host:puerto/nombre_base
```

## 2. Crear el servicio de la app

**+ Crear servicio → App → desde Dockerfile** (o conecta el repo de
Git si subes este proyecto a GitHub/GitLab).

- Build: Dockerfile
- File: Dockerfile
- Port: 3000

### Variables de entorno

En la sección "Environment" del servicio, agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la cadena de conexión del paso 1 |
| `JWT_SECRET` | un texto largo y secreto (genera uno con `openssl rand -hex 32`) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `UPLOAD_DIR` | `/data/uploads` |
| `GOOGLE_CLIENT_ID` | (opcional, ver README.md) |
| `GOOGLE_CLIENT_SECRET` | (opcional) |
| `GOOGLE_CALLBACK_URL` | `https://tu-dominio.com/api/auth/google/callback` |

### Volumen persistente (importante)

En "Volumes" (o "Mounts") del servicio, agrega un volumen montado en
`/data`. Si no haces esto, **las fotos de tus usuarios se borran cada
vez que EasyPanel reinicie o vuelva a desplegar el contenedor.**

### Dominio

Asigna un dominio propio o el subdominio gratuito que te da EasyPanel,
apuntando al puerto 3000.

## 3. Primer despliegue

Al iniciar por primera vez, la app crea las tablas necesarias en la
base de datos automáticamente (no hay que correr ninguna migración a
mano). Revisa los logs del servicio si algo no arranca — casi siempre
es un `DATABASE_URL` mal copiado.

## Notas

- No uses Nixpacks — usa el Dockerfile incluido, es más predecible.
- Si más adelante quieres mover las fotos a almacenamiento tipo S3 en
  vez del disco del servidor, es un cambio contenido dentro de
  `src/lib/uploads.ts` — el resto de la app no se entera de dónde
  viven los archivos.
