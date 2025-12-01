// backend/src/services/emailService.js
import nodemailer from 'nodemailer';

/**
 * Configuración del servicio de email
 * Usa variables de entorno para credenciales
 */

// Crear transporter (configuración del servidor de email)
const createTransporter = () => {
  // Verificar si hay configuración de email
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn('⚠️  Variables de email no configuradas. Los emails se mostrarán en consola.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // ej: smtp.gmail.com
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER, // tu email
      pass: process.env.EMAIL_PASSWORD // contraseña de aplicación
    }
  });
};

/**
 * Enviar email de recuperación de contraseña
 */
export const sendPasswordResetEmail = async (email, code, username) => {
  const transporter = createTransporter();

  // Si no hay configuración, mostrar en consola
  if (!transporter) {
    console.log('════════════════════════════════════════');
    console.log('🔐 CÓDIGO DE RECUPERACIÓN DE CONTRASEÑA');
    console.log('════════════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Código: ${code}`);
    console.log(`⏰ Expira en: 15 minutos`);
    console.log(`👤 Usuario: ${username}`);
    console.log('════════════════════════════════════════');
    return { success: true, mode: 'console' };
  }

  try {
    // Contenido del email en HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - Vitrinex</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Contenedor principal -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header con gradiente -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
                    <div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                      <span style="color: white; font-size: 32px; font-weight: bold;">V</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Vitrinex</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Plataforma de Gestión Empresarial</p>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hola ${username},</h2>
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0; font-size: 16px;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Vitrinex.
                    </p>

                    <!-- Código de verificación -->
                    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 24px;">
                      <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Tu código de verificación
                      </p>
                      <div style="font-size: 42px; font-weight: bold; color: #7c3aed; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 12px 0;">
                        ${code}
                      </div>
                      <p style="color: #9ca3af; margin: 12px 0 0 0; font-size: 13px;">
                        ⏰ Este código expira en <strong>15 minutos</strong>
                      </p>
                    </div>

                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; font-size: 16px;">
                      Ingresa este código en la página de recuperación para crear una nueva contraseña.
                    </p>

                    <!-- Botón de acción -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password" 
                             style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
                            Restablecer Contraseña
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Advertencia de seguridad -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.
                      </p>
                    </div>

                    <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 0 0; font-size: 14px;">
                      Saludos,<br>
                      <strong style="color: #7c3aed;">El equipo de Vitrinex</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 13px;">
                      Este es un correo automático, por favor no responder.
                    </p>
                    <p style="color: #9ca3af; margin: 0 0 16px 0; font-size: 13px;">
                      © ${new Date().getFullYear()} Vitrinex. Todos los derechos reservados.
                    </p>
                    <div style="margin-top: 16px;">
                      <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}" 
                         style="color: #7c3aed; text-decoration: none; font-size: 13px; margin: 0 12px;">
                        Ir a Vitrinex
                      </a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/contacto" 
                         style="color: #7c3aed; text-decoration: none; font-size: 13px; margin: 0 12px;">
                        Soporte
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Texto plano como fallback
    const textContent = `
Hola ${username},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Vitrinex.

Tu código de verificación es: ${code}

Este código expira en 15 minutos.

Ingresa este código en la página de recuperación para crear una nueva contraseña:
${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password

Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.

Saludos,
El equipo de Vitrinex

---
© ${new Date().getFullYear()} Vitrinex. Todos los derechos reservados.
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Vitrinex" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Código de recuperación de contraseña - Vitrinex',
      text: textContent,
      html: htmlContent
    });

    console.log(`✅ Email enviado a ${email} - ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, mode: 'email' };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    // En caso de error, mostrar en consola como fallback
    console.log('════════════════════════════════════════');
    console.log('🔐 CÓDIGO DE RECUPERACIÓN (Fallback)');
    console.log('════════════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Código: ${code}`);
    console.log(`⏰ Expira en: 15 minutos`);
    console.log('════════════════════════════════════════');
    return { success: false, error: error.message, mode: 'console-fallback' };
  }
};

/**
 * Verificar configuración de email
 */
export const verifyEmailConfig = async () => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { configured: false, message: 'Variables de email no configuradas' };
  }

  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return { configured: true, message: 'Configuración correcta' };
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
    return { configured: false, message: error.message };
  }
};
