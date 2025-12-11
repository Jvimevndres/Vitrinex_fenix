# 🔍 Diagnóstico: ¿Por qué no se ven las publicidades premium?

## ❓ Problema

A ti te aparecen las publicidades premium, pero a tu compañero no.

## 🎯 Causa Probable

Tu compañero NO tiene la última versión del código. El backend necesita incluir `owner.plan` en la respuesta de `getStoreById`, y eso se agregó en commits recientes.

---

## ✅ Solución: Verificación Paso a Paso

### 1. Verificar que tu compañero hizo `git pull`

```powershell
cd C:\Users\[USUARIO]\Documents\Vitrinex_fenix
git status
git log --oneline -5
```

**Debe mostrar los últimos commits** que incluyen:
- Migración de URLs
- Populate de owner.plan
- Función getImageUrl

### 2. Verificar versión del backend

Tu compañero debe buscar esta línea en su código:

**Archivo**: `backend/src/controllers/store.controller.js`  
**Buscar**: `populate("owner", "username avatarUrl email plan")`

```bash
# En PowerShell dentro de backend/
Select-String -Path "src/controllers/store.controller.js" -Pattern "owner.*plan"
```

**Debe aparecer**:
```javascript
.populate("owner", "username avatarUrl email plan")
```

Y más abajo:
```javascript
owner: store.owner ? {
  _id: store.owner._id,
  username: store.owner.username,
  avatarUrl: store.owner.avatarUrl,
  email: store.owner.email,
  plan: store.owner.plan || 'free' // 🆕 Plan del propietario
} : null,
```

### 3. Verificar versión del frontend

**Archivo**: `frontend/src/utils/imageUrl.js`

```powershell
# Verificar que existe
Test-Path frontend/src/utils/imageUrl.js
```

**Debe devolver**: `True`

Si devuelve `False`, tu compañero NO hizo el pull correctamente.

---

## 🔧 Solución Completa para Tu Compañero

```powershell
# 1. Asegurarse de estar en la rama correcta
cd C:\Users\[USUARIO]\Documents\Vitrinex_fenix
git status

# 2. Si tiene cambios sin commitear, guardarlos temporalmente
git stash

# 3. Hacer pull de los últimos cambios
git pull origin main   # o el nombre de tu rama

# 4. Si hizo stash, recuperar sus cambios locales
git stash pop

# 5. Verificar que se descargaron los archivos nuevos
Test-Path frontend/src/utils/imageUrl.js
Test-Path backend/check-promotional-images.js

# 6. Reinstalar dependencias (por si acaso)
cd frontend
npm install

cd ../backend  
npm install

# 7. IMPORTANTE: Reiniciar AMBOS servicios

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# 8. Borrar caché del navegador
# Ctrl+Shift+R (hard refresh) o F12 → Aplicación → Borrar caché
```

---

## 🧪 Test de Verificación

Una vez que tu compañero reinicie todo:

### Test 1: Verificar Response del Backend

1. Abrir una tienda premium (ej: Cyber Gamer - ID: `693a6edbfbb455d7646fba89`)
2. Abrir DevTools (F12) → Network
3. Buscar request a `/stores/693a6edbfbb455d7646fba89`
4. Ver la respuesta JSON

**Debe incluir**:
```json
{
  "owner": {
    "_id": "...",
    "username": "jvimevndres",
    "plan": "premium"  // ← ESTO ES CRÍTICO
  },
  "promotionalSpaces": {
    "top": { "enabled": true, "imageUrl": "/uploads/..." },
    "sidebarLeft": [...]
  }
}
```

### Test 2: Verificar Detección de Premium en Frontend

Abrir consola (F12) y buscar estos logs:

```
📢 PromotionalBanner [top]: {
  ownerPlan: "premium",
  isPremium: true,
  hasCustomBanner: true,
  priority: "⭐ PREMIUM (Usuario)"
}
```

Si dice `isPremium: false`, el backend NO está enviando `owner.plan`.

---

## 🚨 Si Aún No Funciona

### Opción A: Problema de Caché del Navegador

```powershell
# Borrar TODO el caché del navegador
1. F12 → Console
2. Ejecutar: localStorage.clear(); sessionStorage.clear();
3. F12 → Application → Clear storage → Clear site data
4. Cerrar navegador completamente
5. Reabrir y probar
```

### Opción B: Backend no reiniciado

```powershell
# Matar TODOS los procesos Node.js
Get-Process node | Stop-Process -Force

# Reiniciar backend
cd backend
npm run dev

# Verificar que dice:
# ✅ MongoDB conectado
# ✅ API escuchando en http://0.0.0.0:3000
```

### Opción C: Versión incorrecta del código

```powershell
# Ver el último commit
git log -1 --oneline

# Comparar con tu versión (deben ser iguales)
# Si son diferentes, hacer:
git fetch
git pull origin main
```

---

## 📊 Tabla de Comparación: Funcionamiento Correcto

| Aspecto | Tu Dispositivo | Dispositivo Compañero | Estado |
|---------|---------------|----------------------|---------|
| `git pull` ejecutado | ✅ Sí | ❓ Verificar | Hacer pull |
| Backend incluye `owner.plan` | ✅ Sí | ❓ Verificar | Actualizar código |
| Frontend tiene `getImageUrl()` | ✅ Sí | ❓ Verificar | Actualizar código |
| Backend reiniciado | ✅ Sí | ❓ Verificar | Reiniciar |
| Frontend reiniciado | ✅ Sí | ❓ Verificar | Reiniciar |
| Caché borrado | ✅ Sí | ❓ Verificar | Limpiar caché |

---

## 🎯 Checklist Final para Tu Compañero

- [ ] `git pull` ejecutado
- [ ] Archivo `frontend/src/utils/imageUrl.js` existe
- [ ] Archivo `backend/check-promotional-images.js` existe  
- [ ] Backend código tiene `populate("owner", "username avatarUrl email plan")`
- [ ] Backend reiniciado (cerrado y abierto de nuevo)
- [ ] Frontend reiniciado (cerrado y abierto de nuevo)
- [ ] Caché del navegador borrado (Ctrl+Shift+R)
- [ ] Request a `/stores/:id` incluye `owner.plan` en la respuesta
- [ ] Console del navegador muestra `isPremium: true` para tiendas premium

Si todos los puntos están ✅, las publicidades premium DEBEN verse.

---

## 💡 Tip: Verificación Rápida

```powershell
# Ejecutar en la raíz del proyecto
# Debe devolver información del plan del owner
cd backend
node -e "
import('./src/models/store.model.js').then(async ({ default: Store }) => {
  const mongoose = await import('mongoose');
  await mongoose.default.connect(process.env.MONGODB_URI || 'tu_mongodb_uri');
  const store = await Store.findById('693a6edbfbb455d7646fba89')
    .populate('owner', 'username plan');
  console.log('Owner:', store?.owner?.username, '- Plan:', store?.owner?.plan);
  process.exit(0);
});
"
```

Debería mostrar:
```
Owner: jvimevndres - Plan: premium
```

Si muestra `Plan: undefined`, el modelo User o Store tiene problemas.
