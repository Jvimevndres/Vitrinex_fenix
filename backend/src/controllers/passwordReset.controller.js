// backend/src/controllers/passwordReset.controller.js
import User from "../models/user.model.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

// Almacenamiento temporal de códigos (en producción usar Redis o base de datos)
const resetCodes = new Map();

/**
 * POST /api/auth/forgot-password
 * Genera y envía código de recuperación
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo es requerido" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Formato de correo inválido" });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({ 
        message: "Si el correo existe, recibirás un código de verificación" 
      });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar código con expiración de 15 minutos
    resetCodes.set(email.toLowerCase(), {
      code,
      userId: user._id.toString(),
      expires: Date.now() + 15 * 60 * 1000 // 15 minutos
    });

    // Enviar email con el código
    const emailResult = await sendPasswordResetEmail(email, code, user.username);

    res.json({ 
      message: "Si el correo existe, recibirás un código de verificación",
      // En desarrollo, devolver el código si el email no se envió
      ...(process.env.NODE_ENV !== 'production' && emailResult.mode !== 'email' && { code })
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

/**
 * POST /api/auth/reset-password
 * Verifica código y actualiza contraseña
 */
export const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    console.log('🔐 Intento de reset-password:', { code: code ? '***' + code.slice(-3) : 'N/A', hasPassword: !!newPassword });

    if (!code || !newPassword) {
      return res.status(400).json({ 
        message: "Código y nueva contraseña son requeridos" 
      });
    }

    // Validar formato de código
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ 
        message: "El código debe ser de 6 dígitos" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Buscar código válido
    let validEmail = null;
    let resetData = null;

    console.log(`🔍 Buscando código en ${resetCodes.size} códigos almacenados...`);

    for (const [email, data] of resetCodes.entries()) {
      if (data.code === code && Date.now() < data.expires) {
        validEmail = email;
        resetData = data;
        console.log(`✅ Código válido encontrado para: ${email}`);
        break;
      }
    }

    if (!validEmail) {
      console.log('❌ Código no encontrado o expirado');
      return res.status(400).json({ 
        message: "Código inválido o expirado" 
      });
    }

    // Buscar usuario
    const user = await User.findById(resetData.userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar contraseña
    user.password = newPassword; // El hash se hace en el modelo
    await user.save();

    // Eliminar código usado
    resetCodes.delete(validEmail);

    console.log(`✅ Contraseña actualizada para: ${user.email}`);

    res.json({ 
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ message: "Error al restablecer contraseña" });
  }
};

/**
 * Limpiar códigos expirados (ejecutar periódicamente)
 */
export const cleanExpiredCodes = () => {
  const now = Date.now();
  for (const [email, data] of resetCodes.entries()) {
    if (now >= data.expires) {
      resetCodes.delete(email);
      console.log(`🗑️  Código expirado eliminado: ${email}`);
    }
  }
};

// Limpiar códigos expirados cada 5 minutos
setInterval(cleanExpiredCodes, 5 * 60 * 1000);
