# 🔧 Solución Completa: Publicidad e Imágenes Visibles en Red Local

## 📋 Índice
1. [Problema Identificado](#problema-identificado)
2. [Solución: URLs Dinámicas](#solución-urls-dinámicas)
3. [Pasos para Implementar](#pasos-para-implementar)
4. [Verificación](#verificación)
5. [Comparación: Admin vs Usuario Premium](#comparación-admin-vs-usuario-premium)
6. [Troubleshooting](#troubleshooting)

---

## 🚨 Problema Identificado

### Síntoma
Tu compañero no puede ver las imágenes de publicidad que subes, y viceversa.

### Causa Raíz
Las URLs de las imágenes se estaban generando con `localhost:3000`, que solo es accesible desde el dispositivo que las subió:
```
❌ http://localhost:3000/uploads/sponsors/1234567890.jpg
```

Esta URL NO funciona desde otros dispositivos en la misma red.

---

## ✅ Solución: URLs Dinámicas

El backend ahora genera URLs automáticamente basándose en el dispositivo que hace la petición.

### Cambio Principal

**Archivo**: `backend/src/routes/upload.routes.js`

**Antes** (❌ INCORRECTO):
```javascript
const getBaseUrl = () => process.env.API_PUBLIC_URL || "http://localhost:3000";
```

**Ahora** (✅ CORRECTO):
```javascript
const getBaseUrl = (req) => {
  // Si existe API_PUBLIC_URL y no es localhost, usarlo (producción)
  const publicUrl = process.env.API_PUBLIC_URL;
  if (publicUrl && !publicUrl.includes('localhost')) {
    return publicUrl;
  }
  
  // En desarrollo, usar el host del request
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};
```

### Resultado
- Subes desde `192.168.1.5:3000` → imagen tiene URL `http://192.168.1.5:3000/uploads/...`
- Tu compañero accede desde `192.168.1.5:3000` → ve la imagen correctamente
- Subes desde `localhost:3000` → imagen tiene URL `http://localhost:3000/uploads/...` (solo para ti)

---

## 🛠️ Pasos para Implementar

### Paso 1: Actualizar Código Backend

Ya está hecho en tu proyecto. Los siguientes archivos fueron modificados:

1. **`backend/src/routes/upload.routes.js`**: 
   - Función `getBaseUrl(req)` actualizada
   - Todos los endpoints ahora usan `getBaseUrl(req)` en lugar de `getBaseUrl()`

2. **`backend/.env`**:
   ```env
   # Dejar vacío para desarrollo (se genera automáticamente)
   API_PUBLIC_URL=
   
   # Solo llenar en producción:
   # API_PUBLIC_URL=https://api.vitrinex.com
   
   # Tu IP local (para configurar CORS y frontend)
   LOCAL_IP=192.168.1.5
   ```

### Paso 2: Configurar Dispositivos

#### A. Tu Máquina (Servidor)

1. **Obtener tu IP local**:
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   ```
   Ejemplo de resultado: `192.168.1.5`

2. **Backend `.env`** ya está configurado con:
   ```env
   LOCAL_IP=192.168.1.5
   ```

3. **Frontend `.env`**:
   ```env
   VITE_API_URL=http://192.168.1.5:3000/api
   ```

4. **Iniciar servicios**:
   ```powershell
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

#### B. Máquina de Tu Compañero

1. **Crear/Editar `frontend/.env`**:
   ```env
   VITE_API_URL=http://192.168.1.5:3000/api
   ```
   ⚠️ **Importante**: Debe usar TU IP (la del servidor), no la suya.

2. **Iniciar solo el frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Acceder al frontend**:
   - Opción 1: `http://localhost:5173`
   - Opción 2: Desde su navegador móvil: `http://[IP_DE_TU_COMPAÑERO]:5173`

### Paso 3: Configurar Firewall (Windows)

En TU máquina (servidor), ejecutar como administrador:

```powershell
# Permitir puerto 3000 (Backend)
New-NetFirewallRule -DisplayName "Vitrinex Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Permitir puerto 5173 (Frontend - si tu compañero quiere acceder a tu frontend)
New-NetFirewallRule -DisplayName "Vitrinex Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

---

## 🔍 Verificación

### Test 1: Subir Imagen desde Tu Dispositivo

1. **Ir a tu perfil de tienda** → Gestión de Espacios Publicitarios
2. **Subir una imagen** en cualquier posición
3. **Abrir consola del navegador** (F12)
4. **Ver la respuesta del servidor**:
   ```javascript
   {
     message: "Imagen de anuncio subida correctamente",
     imageUrl: "http://192.168.1.5:3000/uploads/sponsors/1234567890.jpg"
   }
   ```

5. **Verificar la URL**:
   - ✅ CORRECTO: Contiene `192.168.1.5` (tu IP de red)
   - ❌ INCORRECTO: Contiene `localhost`

6. **Copiar URL de la imagen** (click derecho → "Copiar dirección de imagen")
7. **Pegar en nueva pestaña**: Debe cargarse correctamente

### Test 2: Verificar desde Dispositivo de Tu Compañero

1. **Tu compañero abre la misma tienda**
2. **Las imágenes deben verse**
3. **Inspeccionar elemento** de la imagen:
   ```html
   <img src="http://192.168.1.5:3000/uploads/sponsors/1234567890.jpg" alt="Banner premium">
   ```

4. **Click derecho** en la imagen → "Abrir imagen en nueva pestaña"
5. **Debe cargarse** sin problemas

### Test 3: Subir desde Dispositivo de Tu Compañero

1. **Tu compañero sube una imagen**
2. **Revisar URL generada** (debe contener tu IP de red)
3. **Tú debes ver la imagen** sin problemas

---

## 📊 Comparación: Admin vs Usuario Premium

### Anuncios del Admin (SponsorAd)

**Modelo**: `backend/src/models/sponsorAd.model.js`

```javascript
{
  name: String,
  imageUrl: String,    // URL de la imagen
  link: String,        // URL de destino
  position: String,    // 'top', 'sidebarLeft', etc.
  priority: Number,
  active: Boolean,
  impressions: Number,
  clicks: Number
}
```

**API**: `/api/sponsors/`
- `POST /` - Crear anuncio (solo admin)
- `GET /` - Listar todos (solo admin)
- `GET /position/:position` - Obtener activos por posición (público)
- `PUT /:id` - Actualizar (solo admin)
- `DELETE /:id` - Eliminar (solo admin)

**Uso**: 
- Anuncios globales para usuarios **FREE**
- NO se muestran a usuarios premium

---

### Espacios Promocionales del Usuario Premium

**Modelo**: `backend/src/models/store.model.js`

```javascript
promotionalSpaces: {
  top: {
    enabled: Boolean,
    imageUrl: String,
    link: String
  },
  sidebarLeft: [{    // Array de hasta 7 anuncios
    enabled: Boolean,
    imageUrl: String,
    link: String
  }],
  sidebarRight: [{   // Array de hasta 7 anuncios
    enabled: Boolean,
    imageUrl: String,
    link: String
  }],
  betweenSections: {
    enabled: Boolean,
    imageUrl: String,
    link: String
  },
  footer: {
    enabled: Boolean,
    imageUrl: String,
    link: String
  }
}
```

**API**: `/api/stores/:id` (método PUT)
- Campo `promotionalSpaces` en el body
- Solo propietario de la tienda puede editar
- Se guarda como parte del documento Store

**Uso**: 
- Anuncios personalizados para usuarios **PREMIUM/PRO**
- REEMPLAZAN completamente los anuncios del admin
- Hasta 7 anuncios por barra lateral

---

### Lógica de Prioridad

**Archivo**: `frontend/src/components/PromotionalBanner.jsx`

```javascript
// 1. Detectar si el propietario es premium
const ownerPlan = store?.owner?.plan?.toLowerCase();
const isPremium = ownerPlan === 'pro' || ownerPlan === 'premium';

// 2. Obtener banner personalizado
const customBanner = store?.promotionalSpaces?.[position];
const hasCustomBanner = isPremium && customBanner?.enabled && customBanner?.imageUrl;

// 3. Solo cargar anuncios del admin si NO es premium
useEffect(() => {
  if (!isPremium) {
    loadSponsorAds();
  }
}, [position, isPremium]);

// 4. Renderizar según prioridad
// - Si es premium y tiene banner personalizado: Mostrar SOLO su banner
// - Si es premium sin banner: No mostrar nada
// - Si es free: Mostrar anuncios del admin
```

---

## 🐛 Troubleshooting

### Problema 1: "No puedo ver imágenes desde otro dispositivo"

**Síntomas**:
- Las imágenes se ven en tu dispositivo
- NO se ven desde otro dispositivo
- Error 404 o timeout

**Solución**:

1. **Verificar IP del backend**:
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   ```

2. **Verificar que frontend use esa IP**:
   ```env
   # frontend/.env
   VITE_API_URL=http://TU_IP_AQUI:3000/api
   ```

3. **Reiniciar frontend** después de cambiar `.env`:
   ```powershell
   # Ctrl+C para detener
   npm run dev
   ```

4. **Verificar firewall** (ver Paso 3 arriba)

5. **Verificar que backend esté escuchando en 0.0.0.0**:
   ```javascript
   // backend/src/index.js
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`✅ API escuchando en http://0.0.0.0:${PORT}`);
   });
   ```

---

### Problema 2: "Las imágenes tienen URL con localhost"

**Síntomas**:
- Al inspeccionar, las URLs son `http://localhost:3000/uploads/...`
- Solo funcionan en el dispositivo que las subió

**Solución**:

1. **Verificar `.env` del backend**:
   ```env
   # Debe estar VACÍO o sin el valor localhost
   API_PUBLIC_URL=
   ```

2. **Reiniciar backend**:
   ```powershell
   cd backend
   npm run dev
   ```

3. **Subir imagen nuevamente** (las anteriores mantienen la URL vieja)

4. **Verificar URL generada** en respuesta del servidor (F12 → Network → upload)

---

### Problema 3: "Mi compañero puede ver mis imágenes, pero yo no veo las suyas"

**Síntomas**:
- Él ve lo que tú subes
- Tú NO ves lo que él sube

**Causa**: 
Tu compañero está configurado con `localhost` en su `.env`

**Solución**:

**En el dispositivo de tu compañero**:

1. **Editar `frontend/.env`**:
   ```env
   VITE_API_URL=http://TU_IP_SERVIDOR:3000/api
   ```
   ⚠️ Usar tu IP, no la suya

2. **Reiniciar su frontend**

3. **Subir imagen de prueba**

4. **Verificar URL** (debe contener tu IP de red)

---

### Problema 4: "Los anuncios premium no se guardan"

**Síntomas**:
- Subes imagen correctamente
- Guardas cambios
- Al recargar, los anuncios desaparecen

**Solución**:

1. **Verificar plan del usuario**:
   ```javascript
   // Abrir consola (F12)
   console.log('Plan:', user?.plan);
   ```
   Debe ser `'pro'` o `'premium'`

2. **Verificar que `PromotionalSpacesManager` recibe el plan correcto**:
   ```jsx
   // frontend/src/pages/StoreProfilePage.jsx
   <PromotionalSpacesManager 
     storeId={storeData._id} 
     storePlan={user?.plan || 'free'}  // Debe usar user.plan, NO store.plan
   />
   ```

3. **Verificar consola del navegador** al guardar:
   ```
   📢 Actualización solo de espacios promocionales: {...}
   ```

4. **Verificar backend logs**:
   ```
   ✅ API escuchando en http://0.0.0.0:3000
   ```

---

### Problema 5: "Error 400 o 500 al subir imagen"

**Síntomas**:
- Al hacer click en "Subir imagen", falla inmediatamente
- Error en consola

**Solución**:

1. **Verificar tamaño de imagen** (máximo 5MB):
   ```powershell
   Get-Item "ruta/a/imagen.jpg" | Select-Object Length
   ```

2. **Verificar formato** (solo JPEG, PNG, WebP, GIF)

3. **Verificar que axios usa instancia configurada**:
   ```javascript
   // ❌ INCORRECTO
   import axios from 'axios';
   axios.post('/upload/sponsor-ad', formData);
   
   // ✅ CORRECTO
   import api from '../api/axios';
   api.post('/upload/sponsor-ad', formData);
   ```

4. **Verificar headers**:
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   
   // NO agregar Content-Type manualmente, FormData lo hace automáticamente
   await api.post('/upload/sponsor-ad', formData);
   ```

---

### Problema 6: "Las imágenes antiguas siguen teniendo localhost"

**Síntomas**:
- Nuevas imágenes tienen IP correcta
- Imágenes viejas siguen con `localhost`

**Causa**: 
Las URLs se guardan en la base de datos al momento de subir. No se actualizan automáticamente.

**Solución**:

**Opción 1: Re-subir imágenes** (recomendado)
1. Eliminar anuncios antiguos
2. Subir nuevamente
3. Verificar nuevas URLs

**Opción 2: Script de migración** (avanzado)

Crear `backend/migrate-image-urls.js`:
```javascript
import mongoose from 'mongoose';
import Store from './src/models/store.model.js';
import dotenv from 'dotenv';

dotenv.config();

const OLD_URL = 'http://localhost:3000';
const NEW_URL = 'http://192.168.1.5:3000'; // Tu IP aquí

async function migrateUrls() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const stores = await Store.find({});
  
  for (const store of stores) {
    let updated = false;
    
    // Migrar cada posición
    for (const pos of ['top', 'betweenSections', 'footer']) {
      if (store.promotionalSpaces[pos]?.imageUrl?.includes(OLD_URL)) {
        store.promotionalSpaces[pos].imageUrl = 
          store.promotionalSpaces[pos].imageUrl.replace(OLD_URL, NEW_URL);
        updated = true;
      }
    }
    
    // Migrar arrays de sidebars
    for (const pos of ['sidebarLeft', 'sidebarRight']) {
      if (Array.isArray(store.promotionalSpaces[pos])) {
        store.promotionalSpaces[pos].forEach(ad => {
          if (ad.imageUrl?.includes(OLD_URL)) {
            ad.imageUrl = ad.imageUrl.replace(OLD_URL, NEW_URL);
            updated = true;
          }
        });
      }
    }
    
    if (updated) {
      await store.save();
      console.log(`✅ Migrado: ${store.name}`);
    }
  }
  
  console.log('✅ Migración completa');
  process.exit(0);
}

migrateUrls();
```

Ejecutar:
```powershell
cd backend
node migrate-image-urls.js
```

---

## 🚀 Checklist Final

### Para Tu Dispositivo (Servidor)

- [ ] Backend `.env` tiene `API_PUBLIC_URL=` (vacío)
- [ ] Backend `.env` tiene `LOCAL_IP=TU_IP`
- [ ] Frontend `.env` tiene `VITE_API_URL=http://TU_IP:3000/api`
- [ ] Firewall permite puertos 3000 y 5173
- [ ] Backend corre en `0.0.0.0:3000`
- [ ] Frontend corre en `0.0.0.0:5173`

### Para Dispositivo de Tu Compañero

- [ ] Frontend `.env` tiene `VITE_API_URL=http://IP_DEL_SERVIDOR:3000/api`
- [ ] Frontend reiniciado después de cambiar `.env`
- [ ] Puede acceder a `http://IP_DEL_SERVIDOR:3000/api/health`

### Funcionalidad de Anuncios

- [ ] Usuario FREE ve anuncios del admin
- [ ] Usuario PREMIUM NO ve anuncios del admin
- [ ] Usuario PREMIUM puede subir anuncios propios
- [ ] Barras laterales permiten hasta 7 anuncios
- [ ] Posiciones horizontales solo 1 anuncio
- [ ] URLs de imágenes contienen IP de red (no localhost)
- [ ] Imágenes visibles desde todos los dispositivos

---

## 📞 Soporte

Si después de seguir estos pasos aún tienes problemas:

1. **Captura de pantalla** del error en consola (F12)
2. **Logs del backend** (Terminal donde corre `npm run dev`)
3. **Archivo `.env`** del frontend (sin credenciales sensibles)
4. **URL de una imagen** que no carga (click derecho → "Copiar dirección")
5. **Resultado de**:
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   curl http://TU_IP:3000/api/health
   ```

Con esta información podremos diagnosticar el problema exacto. 🔍
