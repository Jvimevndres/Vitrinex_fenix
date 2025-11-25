# ✅ CHECKLIST DE PRODUCCIÓN - VITRINEX

## 🔒 Seguridad

### Crítico
- [ ] JWT_SECRET único y seguro (32+ caracteres aleatorios)
- [ ] Variables de entorno NO incluidas en Git
- [ ] MongoDB URI usa usuario con permisos mínimos
- [ ] CORS configurado solo para dominio de producción
- [ ] Rate limiting activado en todas las rutas sensibles
- [ ] Helmet configurado correctamente
- [ ] Validación de archivos funcionando (solo imágenes)
- [ ] Límites de tamaño de archivo aplicados (5MB)

### Importante
- [ ] HTTPS habilitado (certificado SSL)
- [ ] Cookies con flag `secure: true` en producción
- [ ] MongoDB Atlas IP whitelist configurada
- [ ] Backup automático de MongoDB configurado
- [ ] Logs centralizados (considerar Sentry/LogRocket)

---

## 🗄️ Base de Datos

- [ ] MongoDB Atlas cluster creado
- [ ] Índices creados y optimizados
- [ ] Usuario de BD con permisos mínimos
- [ ] Backup strategy definida
- [ ] Migración de datos de desarrollo completada

Índices críticos:
```javascript
// Store
{ owner: 1 }
{ lat: 1, lng: 1, isActive: 1 }
{ comuna: 1, tipoNegocio: 1, isActive: 1 }

// Product
{ store: 1, isActive: 1 }

// Booking
{ store: 1, date: 1, slot: 1 }

// Order
{ store: 1, createdAt: -1 }
```

---

## ⚙️ Backend

### Configuración
- [ ] `.env` con valores de producción
- [ ] `NODE_ENV=production`
- [ ] `PORT` correcto
- [ ] `MONGODB_URI` apunta a Atlas
- [ ] `FRONTEND_ORIGIN` con dominio real
- [ ] `API_PUBLIC_URL` con dominio backend

### Deployment
- [ ] `npm install --production`
- [ ] Process manager (PM2 o similar) configurado
- [ ] Restart automático en caso de crash
- [ ] Logs persistentes configurados
- [ ] Health check endpoints funcionando (`/api/health`)

Ejemplo PM2:
```bash
pm2 start src/index.js --name vitrinex-api
pm2 startup
pm2 save
```

---

## 🎨 Frontend

### Build
- [ ] `npm run build` ejecutado
- [ ] Variables de entorno correctas (`VITE_API_URL`)
- [ ] Dist/ generado sin errores
- [ ] Assets optimizados

### Deployment
- [ ] Hosting configurado (Vercel/Netlify/otro)
- [ ] Dominio apuntando correctamente
- [ ] Certificado SSL activo
- [ ] Redirects configurados (SPA routing)
- [ ] Variables de entorno en plataforma

---

## 🧪 Testing

- [ ] Tests backend pasando (`npm test`)
- [ ] Endpoints críticos probados manualmente:
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] GET /api/stores (público)
  - [ ] POST /api/stores (privado)
  - [ ] POST /api/upload/avatar
  - [ ] GET /api/health

- [ ] Frontend testeado en:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile (responsive)

---

## 📊 Performance

- [ ] Paginación habilitada en listados
- [ ] Índices MongoDB verificados
- [ ] Imágenes optimizadas (WebP recomendado)
- [ ] CDN configurado para assets estáticos (opcional)
- [ ] Compresión gzip habilitada

---

## 🔍 Monitoreo

- [ ] Health checks configurados
- [ ] Logs accesibles y rotando
- [ ] Alertas configuradas (uptime monitoring)
- [ ] Error tracking (Sentry opcional)
- [ ] Analytics básicos

Tools recomendados:
- UptimeRobot (gratuito)
- PM2 logs
- MongoDB Atlas monitoring

---

## 📚 Documentación

- [ ] README actualizado
- [ ] `.env.example` completo
- [ ] API endpoints documentados
- [ ] Guía de deployment escrita
- [ ] Contactos de emergencia definidos

---

## 🚀 Go-Live

### Pre-launch (1 semana antes)
- [ ] Todas las tasks críticas completadas
- [ ] Testing exhaustivo realizado
- [ ] Backup de BD de desarrollo
- [ ] Plan de rollback definido

### Launch Day
- [ ] Deploy backend
- [ ] Verificar `/api/health` responde OK
- [ ] Deploy frontend
- [ ] Smoke test completo
- [ ] Monitorear logs primeras 24h

### Post-launch (primera semana)
- [ ] Monitorear performance
- [ ] Revisar logs de errores
- [ ] Ajustar rate limits si necesario
- [ ] Recopilar feedback de usuarios

---

## 📞 Contactos

**Desarrollo:**
- Maximiliano Inostroza: maxitrabajos49@gmail.com
- Jaime Herrera: [email]

**Infraestructura:**
- Hosting Backend: [provider]
- Hosting Frontend: [provider]
- MongoDB Atlas: [account]

**Emergencias:**
- Protocolo: [definir]

---

## 🔄 Mantenimiento Continuo

### Semanal
- [ ] Revisar logs de errores
- [ ] Verificar uptime
- [ ] Backup manual de BD

### Mensual
- [ ] Actualizar dependencias (npm audit)
- [ ] Revisar métricas de uso
- [ ] Optimizar queries lentas

### Trimestral
- [ ] Audit de seguridad
- [ ] Revisar y actualizar documentación
- [ ] Plan de nuevas features

---

**Versión:** 1.0  
**Última actualización:** Noviembre 2025  
**Estado:** ✅ Listo para producción con este checklist completado
