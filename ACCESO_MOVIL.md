# Acceso Móvil a Vitrinex (Desarrollo)

## Configuración para acceder desde dispositivos móviles en red local

### Archivos Modificados

#### 1. `frontend/vite.config.js`
Se agregó configuración para permitir acceso desde la red local:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acceso desde otros dispositivos en la red
    port: 5173
  }
})
```

#### 2. `frontend/.env` y `backend/.env`
**Estos archivos NO se suben a Git** (están en .gitignore).

**En cada dispositivo, crea tu propio `.env` a partir de `.env.example`:**

**Frontend (`frontend/.env`):**
```bash
# Copia el archivo de ejemplo
cp frontend/.env.example frontend/.env

# Edita y actualiza con tu IP local
VITE_API_URL=http://TU_IP_LOCAL:3000/api
```

**Backend (`backend/.env`):**
```bash
# Copia el archivo de ejemplo
cp backend/.env.example backend/.env

# Agrega tu IP local para acceso móvil
LOCAL_IP=TU_IP_LOCAL
```

**⚠️ Obtén tu IP local con:**
```powershell
ipconfig | Select-String -Pattern "IPv4"
```

#### 3. `backend/src/index.js`
Se modificó para leer la IP desde variable de entorno:

**CORS (línea ~36-50):**
```javascript
const LOCAL_IP = process.env.LOCAL_IP; // Lee IP desde .env

const allowedOrigins = [
  FRONTEND_ORIGIN,
  LOCAL_IP ? `http://${LOCAL_IP}:5173` : null,
  'http://localhost:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

**Servidor (línea ~110):**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  logger.success(`API escuchando en http://0.0.0.0:${PORT}`);
  if (LOCAL_IP) {
    logger.info(`Acceso desde red local: http://${LOCAL_IP}:${PORT}`);
  }
});
```

### Configuración de Firewall (Windows)

Ejecutar una sola vez en PowerShell como administrador:

```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

New-NetFirewallRule -DisplayName "Node Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Pasos para Usar en Nuevo Dispositivo

1. **Clonar el repositorio:**
   ```bash
   git clone <url-repositorio>
   cd Vitrinex_fenix
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Obtener tu IP local:**
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   ```

4. **Configurar archivos .env:**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edita frontend/.env y actualiza VITE_API_URL con tu IP

   # Backend
   cp backend/.env.example backend/.env
   # Edita backend/.env y agrega:
   # - Tu MONGODB_URI
   # - Tu LOCAL_IP
   # - Otras credenciales necesarias
   ```

5. **Iniciar servidores:**
   ```powershell
   # Terminal 1 - Frontend
   cd frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   npm start
   ```

4. **Conectar desde el celular:**
   - Asegúrate que tu celular esté en la **misma red WiFi**
   - Abre el navegador y accede a: `http://TU_IP:5173`
   - Ejemplo: `http://192.168.1.27:5173`

### Solución de Problemas

- **No carga la página:** Verifica que el firewall permita los puertos 5173 y 3000
- **Error de CORS:** Asegúrate que la IP en `allowedOrigins` coincida con la IP desde donde accedes
- **API no responde:** Verifica que el backend esté corriendo y accesible en `http://TU_IP:3000`
- **Celular no conecta:** Confirma que estén en la misma red WiFi y que no haya VPN activa

### Notas

- Esta configuración es **SOLO PARA DESARROLLO**
- Para producción, usar variables de entorno apropiadas
- La IP local puede cambiar si tu router asigna IPs dinámicamente
