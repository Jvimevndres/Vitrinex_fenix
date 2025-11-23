// Script de prueba para el chatbot
import "dotenv/config";

console.log("=== TEST CHATBOT CONFIGURATION ===");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Configurada" : "❌ NO configurada");
console.log("OPENAI_MODEL:", process.env.OPENAI_MODEL || "gpt-4-turbo-mini (default)");
console.log("");

// Test 1: Importar aiClient
console.log("Test 1: Importar aiClient...");
try {
  const { getChatbotResponse, getChatbotResponsePremium } = await import("./src/libs/aiClient.js");
  console.log("✅ aiClient importado correctamente");
  
  // Test 2: Llamada básica (FREE - puede ser DEMO o real según API key)
  console.log("\nTest 2: Chatbot FREE (puede ser DEMO o real)...");
  const response1 = await getChatbotResponse("Hola, ¿qué es Vitrinex?");
  console.log("✅ Respuesta recibida:");
  console.log(response1.substring(0, 200) + "...");
  
  // Test 3: Llamada Premium (requiere contexto)
  console.log("\nTest 3: Chatbot PREMIUM...");
  const mockContext = {
    username: "TestUser",
    storesCount: 2,
    productsCount: 10,
    recentOrdersCount: 5,
    topProducts: [
      { name: "Producto 1", price: 100, stock: 50 },
      { name: "Producto 2", price: 200, stock: 30 }
    ]
  };
  const response2 = await getChatbotResponsePremium("¿Cómo van mis ventas?", mockContext);
  console.log("✅ Respuesta premium recibida:");
  console.log(response2.substring(0, 200) + "...");
  
  console.log("\n=== TODOS LOS TESTS PASARON ✅ ===");
} catch (error) {
  console.error("❌ Error en el test:", error.message);
  console.error(error);
  process.exit(1);
}
