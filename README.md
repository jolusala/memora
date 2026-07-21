# memora — app completa (backend + base de datos + login)

Photobook app con cuentas de usuario reales: cada quien inicia sesión
(email/contraseña o Google) y solo ve sus propios photobooks. Las fotos
se guardan en disco y los datos en PostgreSQL — nada vive en el
navegador, así que se puede entrar desde cualquier dispositivo.

## Estructura

```
memora-fullstack/
  server/            → API en Node.js + Express
    src/
      index.js        punto de entrada (API + sirve el cliente)
      db.js            conexión a PostgreSQL y creación de tablas
      auth/            JWT + estrategia de Google
      middleware/       protección de rutas
      routes/           auth.routes.js, books.routes.js
  client/             → frontend (HTML + CSS + JS, sin build)
    index.html
    styles.css
    app.js
  Dockerfile
  docker-compose.yml   → para probar todo localmente
  .env.example
```

## Probarlo en tu computadora

Necesitas Docker instalado.

```
cp .env.example .env   # opcional, docker-compose ya trae valores por defecto
docker compose up --build
```

Abre http://localhost:3000 — ya deberías poder crear una cuenta con
email y contraseña. El login con Google queda deshabilitado hasta que
configures las variables `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
(ver más abajo).

## Variables de entorno

Ver `.env.example` — cada una está comentada. Las importantes:

- `DATABASE_URL`: cadena de conexión a PostgreSQL.
- `JWT_SECRET`: cualquier texto largo y secreto (genera uno con
  `openssl rand -hex 32`). Todas las sesiones se firman con esto.
- `UPLOAD_DIR`: carpeta donde se guardan las fotos. **Debe** apuntar a
  un volumen persistente, o perderás las fotos cada vez que se
  reinicie el contenedor.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL`:
  solo si quieres login con Google (instrucciones abajo).

## Configurar login con Google

1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un proyecto (o usa uno existente) → "Crear credenciales" →
   "ID de cliente de OAuth" → tipo "Aplicación web".
3. En "URI de redirección autorizados" agrega:
   `https://tu-dominio.com/api/auth/google/callback`
   (o `http://localhost:3000/api/auth/google/callback` para pruebas
   locales).
4. Copia el Client ID y el Client Secret a tus variables de entorno.

Si no configuras esto, la app funciona igual solo con email y
contraseña — el botón de Google simplemente no funcionará hasta que
lo configures.

Para el detalle de despliegue en EasyPanel, ver `README-EASYPANEL.md`.
