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

#### 2. `frontend/.env` (NUEVO)
Se creó este archivo con la IP local de la computadora de desarrollo:

```
VITE_API_URL=http://192.168.1.27:3000/api
```

**⚠️ IMPORTANTE:** Cambia `192.168.1.27` por la IP de tu computadora. Para obtenerla ejecuta:
```powershell
ipconfig | Select-String -Pattern "IPv4"
```

#### 3. `backend/src/index.js`
Se modificó la configuración de CORS y el servidor:

**CORS (línea ~36-50):**
```javascript
const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://192.168.1.27:5173',  // ⚠️ Actualizar con tu IP
  'http://localhost:5173'
];

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
  logger.info(`Acceso desde red local: http://192.168.1.27:${PORT}`);
});
```

### Configuración de Firewall (Windows)

Ejecutar una sola vez en PowerShell como administrador:

```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

New-NetFirewallRule -DisplayName "Node Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Pasos para Usar

1. **Obtener tu IP local:**
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   ```

2. **Actualizar configuración:**
   - En `frontend/.env`: Actualiza `VITE_API_URL` con tu IP
   - En `backend/src/index.js`: Actualiza el array `allowedOrigins` con tu IP
   - En `backend/src/index.js`: Actualiza el mensaje del logger con tu IP

3. **Iniciar servidores:**
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
