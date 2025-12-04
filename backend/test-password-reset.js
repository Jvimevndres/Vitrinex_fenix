// Test del sistema de recuperación de contraseña
import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:3000/api";
const TEST_EMAIL = "admin@vitrinex.com"; // Cambiar por un email real de tu BD

(async () => {
  try {
    console.log("🧪 PRUEBA COMPLETA DE RECUPERACIÓN DE CONTRASEÑA\n");
    
    // Conectar a MongoDB para verificar datos
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // 1. Verificar que el usuario existe
    console.log("1️⃣ Verificando usuario...");
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      console.log(`❌ Usuario ${TEST_EMAIL} no existe en la BD`);
      console.log("💡 Crea un usuario primero o cambia TEST_EMAIL en el script");
      process.exit(1);
    }
    console.log(`✅ Usuario encontrado: ${user.username} (${user.email})\n`);
    
    // 2. Solicitar código de recuperación
    console.log("2️⃣ Solicitando código de recuperación...");
    try {
      const forgotResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: TEST_EMAIL
      });
      console.log("✅ Respuesta:", forgotResponse.data);
      
      // Si hay código en la respuesta (modo desarrollo)
      if (forgotResponse.data.code) {
        console.log(`\n🔢 CÓDIGO GENERADO: ${forgotResponse.data.code}`);
        console.log("⚠️  Este código solo se muestra en desarrollo\n");
        
        // 3. Probar reset con código
        console.log("3️⃣ Probando reset-password con el código...");
        const resetResponse = await axios.post(`${API_URL}/auth/reset-password`, {
          code: forgotResponse.data.code,
          newPassword: "123456" // Contraseña de prueba
        });
        console.log("✅ Contraseña actualizada:", resetResponse.data);
        
        // 4. Verificar que el hash cambió
        console.log("\n4️⃣ Verificando hash de contraseña...");
        const updatedUser = await User.findOne({ email: TEST_EMAIL });
        if (updatedUser.password !== user.password) {
          console.log("✅ Hash de contraseña actualizado correctamente");
        } else {
          console.log("⚠️  Hash no cambió (posible problema)");
        }
        
        // 5. Probar login con nueva contraseña
        console.log("\n5️⃣ Probando login con nueva contraseña...");
        try {
          const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: "123456"
          });
          console.log("✅ Login exitoso con nueva contraseña");
          console.log(`👤 Usuario: ${loginResponse.data.username}`);
        } catch (loginErr) {
          console.log("❌ Login falló:", loginErr.response?.data?.message || loginErr.message);
        }
        
        console.log("\n✅ TODAS LAS PRUEBAS COMPLETADAS");
        console.log("\n💡 RECORDATORIO: Cambia la contraseña de vuelta si es necesario");
      } else {
        console.log("\n📧 Revisa tu email para obtener el código");
        console.log("💡 Si no llega el email, verifica:");
        console.log("   - Variables EMAIL_* en .env");
        console.log("   - Logs del backend para ver el código en consola");
      }
      
    } catch (forgotErr) {
      console.log("❌ Error en forgot-password:", forgotErr.response?.data || forgotErr.message);
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
