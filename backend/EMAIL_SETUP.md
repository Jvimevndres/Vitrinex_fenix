# 📧 Configuración de Email para Recuperación de Contraseña

Este documento explica cómo configurar el envío de emails real para el sistema de recuperación de contraseña.

## 🎯 Opciones Disponibles

### Opción 1: Gmail (Recomendado para Desarrollo)

**Ventajas:**
- ✅ Gratis
- ✅ Fácil de configurar
- ✅ Perfecto para desarrollo y pruebas

**Configuración:**

1. **Habilitar verificación en dos pasos**
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. **Generar contraseña de aplicación**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "Vitrinex" y haz clic en "Generar"
   - **Copia la contraseña de 16 caracteres** (sin espacios)

3. **Configurar variables de entorno** en `backend/.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # La contraseña de aplicación
   ```

4. **Reiniciar el servidor backend**

---

### Opción 2: Outlook/Hotmail

**Configuración:**

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña-normal
```

**Nota:** Outlook permite usar tu contraseña normal directamente.

---

### Opción 3: SendGrid (Recomendado para Producción)

**Ventajas:**
- ✅ 100 emails gratis al día
- ✅ Muy confiable
- ✅ Estadísticas de entrega
- ✅ Ideal para producción

**Configuración:**

1. Crear cuenta en: https://sendgrid.com/
2. Generar API Key en: Settings > API Keys
3. Configurar variables:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=tu-api-key-aqui
   ```

---

### Opción 4: AWS SES (Producción Empresarial)

**Ventajas:**
- ✅ Muy económico ($0.10 por 1000 emails)
- ✅ Alta escalabilidad
- ✅ Integración con AWS

**Configuración:**

1. Configurar AWS SES en tu cuenta AWS
2. Verificar dominio o email
3. Obtener credenciales SMTP
4. Configurar variables:
   ```env
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-access-key-id
   EMAIL_PASSWORD=tu-secret-access-key
   ```

---

## 🧪 Probar la Configuración

### Método 1: Desde el código

Agrega esto temporalmente en `backend/src/index.js`:

```javascript
import { verifyEmailConfig } from './services/emailService.js';

// Después de conectar a MongoDB
await verifyEmailConfig();
```

### Método 2: Prueba real

1. Inicia el backend: `npm run dev`
2. Ve a: http://localhost:5173/forgot
3. Ingresa un email registrado
4. Revisa tu bandeja de entrada

---

## ⚠️ Troubleshooting

### "Error: Invalid login"
- **Gmail:** Asegúrate de usar la contraseña de aplicación, NO tu contraseña normal
- Verifica que la verificación en dos pasos esté activada

### "Connection timeout"
- Verifica que `EMAIL_PORT` sea correcto (587 para TLS, 465 para SSL)
- Revisa tu firewall o antivirus

### "Email not configured"
- Verifica que todas las variables EMAIL_* estén en el archivo `.env`
- Reinicia el servidor después de modificar `.env`

### Los emails van a spam
- **Producción:** Configura SPF, DKIM y DMARC para tu dominio
- **Gmail/Desarrollo:** Los emails de prueba suelen ir a spam, es normal

---

## 🚀 Modo de Desarrollo

Si **NO configuras las variables de email**, el sistema funcionará igualmente:
- Los códigos se mostrarán en la **consola del backend**
- Esto es útil para desarrollo y pruebas
- No es necesario configurar email para que funcione

---

## 📝 Notas de Seguridad

- ❌ **NUNCA** subas el archivo `.env` a Git
- ✅ Usa variables de entorno en el servidor de producción
- ✅ Para Gmail, SIEMPRE usa contraseña de aplicación
- ✅ Cambia las credenciales regularmente en producción

---

## 📧 Personalizar el Template

El template del email está en: `backend/src/services/emailService.js`

Puedes modificar:
- Colores y estilos
- Logo y branding
- Textos y mensajes
- Enlaces y botones

---

## ✅ Checklist de Producción

- [ ] Configurar servicio de email profesional (SendGrid/AWS SES)
- [ ] Configurar dominio personalizado
- [ ] Configurar SPF, DKIM, DMARC
- [ ] Probar envío de emails
- [ ] Monitorear tasa de entrega
- [ ] Configurar alertas de errores
- [ ] Limitar intentos por IP
- [ ] Agregar rate limiting adicional

---

¿Necesitas ayuda? Revisa la documentación de tu proveedor de email o contacta a soporte.
