# ✅ SOLUCIÓN: Imágenes de Publicidades Premium No Se Ven

## 🔍 Diagnóstico Realizado

**Problema:** Las publicidades premium (las que sube el usuario con plan Pro/Premium) no se veían desde otros dispositivos.

**Causa Raíz:** Las URLs de las imágenes se guardaban con la IP/dominio absoluto (ej: `http://192.168.1.5:3000/uploads/...`) en lugar de rutas relativas (ej: `/uploads/...`).

## ✅ Cambios Implementados

### 1. Backend - Endpoint de Upload
**Archivo:** `backend/src/routes/upload.routes.js`

**Cambio:** El endpoint `/upload/sponsor-ad` ahora devuelve rutas relativas en lugar de URLs absolutas:

```javascript
// ❌ ANTES (devolvía URL completa con dominio)
const baseUrl = getBaseUrl(req);
const imageUrl = `${baseUrl}/uploads/sponsors/${req.file.filename}`;

// ✅ AHORA (devuelve ruta relativa)
const imageUrl = `/uploads/sponsors/${req.file.filename}`;
```

### 2. Frontend - Función getImageUrl()
**Archivo:** `frontend/src/utils/imageUrl.js`

La función `getImageUrl()` convierte rutas relativas en URLs completas usando `VITE_API_URL`:

```javascript
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  return baseUrl + imagePath;
};
```

### 3. Componente PromotionalBanner
**Archivo:** `frontend/src/components/PromotionalBanner.jsx`

Ya está usando `getImageUrl()` en todas las imágenes premium:

```javascript
<img src={getImageUrl(banner.imageUrl)} alt="Banner premium" />
```

## 📊 Verificación de Base de Datos

Se ejecutó el script `check-promotional-urls.js` que confirmó:

```
✅ Todas las URLs son relativas (9 anuncios verificados)
❌ URLs absolutas (a corregir): 0

🏪 Cyber Gamer (Plan PREMIUM):
   - top: ✅ /uploads/sponsors/1765470819739-627788574.PNG
   - betweenSections: ✅ /uploads/sponsors/1765470919837-917590453.PNG
   - sidebarLeft[0]: ✅ /uploads/sponsors/1765470028139-155020232.PNG
   - sidebarLeft[1]: ✅ /uploads/sponsors/1765470986530-192025838.PNG
   - sidebarRight[0]: ✅ /uploads/sponsors/1765471030425-258310270.PNG
   - sidebarRight[1]: ✅ /uploads/sponsors/1765471094367-231245790.PNG
```

## 🔧 Pasos para Tu Compañero

### 1️⃣ Actualizar Código (Git Pull)

```bash
git pull origin main
```

### 2️⃣ Verificar Variables de Entorno

**Archivo:** `frontend/.env`

Debe contener:

```env
VITE_API_URL=http://192.168.1.5:3000/api
```

⚠️ **IMPORTANTE:** 
- NO usar `localhost` - usar la IP del servidor en la red local
- La IP debe ser la misma que ves en el backend cuando arranca:
  ```
  ℹ️ Acceso desde red local: http://192.168.1.5:3000
  ```

### 3️⃣ Reinstalar Dependencias (si es necesario)

```bash
cd frontend
npm install
```

### 4️⃣ Reiniciar el Servidor Frontend

```bash
cd frontend
npm run dev
```

**IMPORTANTE:** Detener completamente el servidor (Ctrl+C) y volver a iniciarlo. Los cambios en `.env` NO se aplican con hot-reload.

### 5️⃣ Limpiar Caché del Navegador

1. Abrir DevTools (F12)
2. Click derecho en el botón de recargar
3. Seleccionar "Vaciar caché y recargar de manera forzada"

O usar: **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac)

## 🧪 Verificación

### En el Navegador (DevTools - Pestaña Network)

Las URLs de las imágenes premium deberían ser como:

✅ **CORRECTO:**
```
http://192.168.1.5:3000/uploads/sponsors/1765470819739-627788574.PNG
```

❌ **INCORRECTO:**
```
http://localhost:3000/uploads/sponsors/1765470819739-627788574.PNG
```

### Consola del Navegador

No debería haber errores 404 ni CORS. Si aparece un error, verificar:

1. ¿La URL comienza con `localhost`? → Revisar `.env` del frontend
2. ¿Error 404? → Verificar que el archivo existe en `backend/uploads/sponsors/`
3. ¿Error CORS? → Verificar que el backend esté corriendo

## 📝 Resumen de la Solución

| Componente | Cambio Realizado | Estado |
|------------|------------------|--------|
| Backend - Upload Endpoint | Devuelve rutas relativas | ✅ Implementado |
| Frontend - getImageUrl() | Convierte relativas a absolutas | ✅ Implementado |
| PromotionalBanner | Usa getImageUrl() en todas las imágenes | ✅ Implementado |
| Base de Datos | URLs migradas a rutas relativas | ✅ Migrado |
| Backend | Reiniciado con nuevo código | ✅ Reiniciado |

## 🎯 Diferencia con Otras Imágenes

**¿Por qué las imágenes de productos SÍ funcionaban?**

Las imágenes de productos siempre usaron el endpoint `/upload/product` que ya devolvía rutas relativas desde el inicio. El problema era específico de las publicidades premium que usaban `/upload/sponsor-ad`.

**¿Por qué las publicidades del admin SÍ funcionaban?**

Las publicidades del admin también usan el mismo endpoint, pero como se subieron desde un solo dispositivo y nunca se migraron, mantenían URLs consistentes.

## 🚀 Próximos Pasos

1. ✅ Backend actualizado y reiniciado
2. ✅ URLs en base de datos migradas a rutas relativas
3. 📋 **TU COMPAÑERO:** Hacer git pull + verificar .env + reiniciar frontend
4. 🧪 **TU COMPAÑERO:** Probar acceso desde su dispositivo
5. 🎉 ¡Debería funcionar!

---

## 🆘 Si Aún No Funciona

1. **Verificar que el backend esté accesible desde la red:**
   ```bash
   # Desde el dispositivo de tu compañero
   curl http://192.168.1.5:3000/api/health
   ```

2. **Verificar que las imágenes sean accesibles:**
   ```bash
   # Desde el dispositivo de tu compañero
   curl -I http://192.168.1.5:3000/uploads/sponsors/1765470819739-627788574.PNG
   ```

3. **Revisar logs del backend** en busca de errores cuando se intenta acceder a las imágenes

4. **Verificar firewall** - que el puerto 3000 esté abierto en la red local

---

**Fecha de Implementación:** Diciembre 2024  
**Problema Resuelto:** Imágenes de publicidades premium no visibles desde otros dispositivos  
**Solución:** Migración de URLs absolutas a rutas relativas + getImageUrl() en frontend
