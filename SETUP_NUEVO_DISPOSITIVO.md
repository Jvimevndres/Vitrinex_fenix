# 🚀 Setup Vitrinex - Nuevo Dispositivo

## 📦 Instalación Rápida

```bash
# 1. Clonar e instalar
git clone <url-repo>
cd Vitrinex_fenix
npm install

# 2. Obtener tu IP local
ipconfig | Select-String -Pattern "IPv4"
# Anota tu IP (ej: 192.168.1.5)
```

## ⚙️ Configuración

### Frontend
```bash
# Crear archivo .env desde plantilla
copy frontend\.env.example frontend\.env
```

Editar `frontend/.env`:
```env
VITE_API_URL=http://TU_IP:3000/api
```

### Backend
```bash
# Crear archivo .env desde plantilla
copy backend\.env.example backend\.env
```

Editar `backend/.env` y agregar:
- `MONGODB_URI` (pedir credenciales)
- `JWT_SECRET` (pedir credenciales)
- `LOCAL_IP=TU_IP` (tu IP local)
- `OPENAI_API_KEY` (opcional, para chatbot)
- `EMAIL_USER` y `EMAIL_PASSWORD` (opcional)

### Firewall (Windows - ejecutar como Admin)
```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node Backend API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## ▶️ Iniciar

```bash
npm run dev
```

**Acceso:**
- PC: `http://localhost:5173`
- Móvil (misma WiFi): `http://TU_IP:5173`

## 📝 Notas

- Los archivos `.env` NO se suben a Git
- Tu IP puede cambiar, actualiza los `.env` si es necesario
- Después de cambiar `.env`, reinicia los servidores
