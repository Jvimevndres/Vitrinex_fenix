# 🖼️ Solución: Imágenes Visibles en Toda la Red Local

## ❌ Problema Anterior

Las imágenes subidas solo se veían desde el dispositivo que las subió porque las URLs se generaban con `localhost:3000`, que no es accesible desde otros dispositivos.

## ✅ Solución Implementada

Ahora el backend genera URLs **dinámicamente** según el dispositivo que hace la petición:

### Cómo Funciona

1. **Desarrollo/Red Local**: Las URLs se generan automáticamente usando el `host` del request
   - Si subes desde `192.168.1.5:3000` → la imagen tendrá URL `http://192.168.1.5:3000/uploads/...`
   - Si subes desde `localhost:3000` → la imagen tendrá URL `http://localhost:3000/uploads/...`

2. **Producción**: Si configuras `API_PUBLIC_URL` (ej: `https://api.vitrinex.com`), se usará esa URL para todos los dispositivos

### Cambios Realizados

#### Backend: `upload.routes.js`
```javascript
// Función que detecta automáticamente la URL correcta
const getBaseUrl = (req) => {
  const publicUrl = process.env.API_PUBLIC_URL;
  if (publicUrl && !publicUrl.includes('localhost')) {
    return publicUrl; // Producción
  }
  
  // Desarrollo: usar el host del request
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};
```

Todos los endpoints de upload ahora usan `getBaseUrl(req)` en lugar de una URL fija.

#### Backend: `.env`
```env
# Vacío en desarrollo (se genera dinámicamente)
API_PUBLIC_URL=

# Solo se llena en producción:
# API_PUBLIC_URL=https://api.vitrinex.com
```

## 📱 Uso en Red Local

### Para Tu Compañero

1. **Obtener la IP de tu máquina**:
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   ```
   Ejemplo: `192.168.1.5`

2. **Configurar su .env del frontend**:
   ```env
   VITE_API_URL=http://192.168.1.5:3000/api
   ```

3. **Iniciar su frontend**:
   ```bash
   npm run dev
   ```

4. **Listo**: Ahora podrá:
   - Ver las imágenes que tú subes
   - Subir imágenes que tú verás
   - Ambos verán las mismas imágenes porque se generan con la IP de red

## 🔍 Verificación

Para verificar que funciona:

1. **Subir una imagen** desde cualquier dispositivo
2. **Inspeccionar la URL** en el navegador (click derecho en la imagen → "Copiar dirección de imagen")
3. **Comprobar** que la URL contiene:
   - La IP de red (ej: `192.168.1.5`) si se accede desde red local
   - O `localhost` si se accede localmente
   - O la URL de producción si está configurada

## 🚀 Para Producción

Cuando desplieguen a producción:

1. Configurar `API_PUBLIC_URL` en el `.env` del backend:
   ```env
   API_PUBLIC_URL=https://api.vitrinex.com
   ```

2. Las URLs de imágenes siempre usarán ese dominio, independientemente del dispositivo

## 📋 Afecta a Estos Endpoints

- `POST /api/upload/avatar` - Avatares de usuario
- `POST /api/upload/store-logo` - Logos de tienda
- `POST /api/upload/product-image` - Imágenes de productos
- `POST /api/upload/background` - Fondos personalizados
- `POST /api/upload/sponsor-ad` - Imágenes de publicidad

Todos generan URLs accesibles desde cualquier dispositivo en la red. 🎉
