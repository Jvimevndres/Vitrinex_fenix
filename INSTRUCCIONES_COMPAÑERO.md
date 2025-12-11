# 🚨 INSTRUCCIONES URGENTES PARA TU COMPAÑERO

## ❌ Problema
Las publicidades premium (las que subes tú como propietario) no se ven en su dispositivo.

## ✅ Solución Rápida (3 pasos)

### 1️⃣ Actualizar el Código
```bash
git pull origin main
```

### 2️⃣ Configurar Variables de Entorno

**Archivo:** `frontend/.env` (si no existe, créalo)

```env
VITE_API_URL=http://192.168.1.5:3000/api
```

⚠️ **Reemplaza `192.168.1.5` con la IP que aparece cuando arrancas el backend:**

Cuando ejecutas `npm run dev` en el backend, aparece algo como:
```
ℹ️ Acceso desde red local: http://192.168.1.5:3000
                                  ↑↑↑↑↑↑↑↑↑↑↑↑
                                  Usar esta IP
```

### 3️⃣ Reiniciar el Frontend

⚠️ **MUY IMPORTANTE:** Los cambios en `.env` NO se aplican con hot-reload.

**Debes detener completamente el servidor y volver a iniciarlo:**

```bash
# 1. Presiona Ctrl+C para detener el servidor actual
# 2. Espera a que se detenga completamente
# 3. Vuelve a iniciar:
cd frontend
npm run dev
```

### 4️⃣ Limpiar Caché del Navegador

Recargar con fuerza: **Ctrl + Shift + R** (o Cmd + Shift + R en Mac)

---

## 🧪 ¿Cómo Verificar que Funciona?

Abre la tienda "Cyber Gamer" y deberías ver:
- ✅ Banner en la parte superior (top)
- ✅ Banner entre secciones (betweenSections)
- ✅ 2 banners en la barra izquierda (sidebarLeft)
- ✅ 2 banners en la barra derecha (sidebarRight)

Si no se ven, abre DevTools (F12) → Pestaña "Network" y verifica que las URLs de las imágenes sean como:

✅ **CORRECTO:**
```
http://192.168.1.5:3000/uploads/sponsors/algo.png
```

❌ **INCORRECTO:**
```
http://localhost:3000/uploads/sponsors/algo.png
```

---

## 🆘 Si No Funciona

1. ¿Hiciste `git pull`? ✅
2. ¿Creaste/actualizaste el archivo `.env` con la IP correcta? ✅
3. ¿Detuviste completamente el servidor con Ctrl+C y lo reiniciaste? ✅
4. ¿Limpiaste la caché del navegador con Ctrl+Shift+R? ✅

Si aún no funciona, revisa:
- Consola del navegador (F12) en busca de errores
- Que el backend esté corriendo en el otro dispositivo
- Que ambos dispositivos estén en la misma red WiFi

---

**Nota:** Las imágenes de productos y las publicidades del admin siempre funcionaron porque ya usaban rutas correctas. Solo las publicidades premium tenían el problema.
