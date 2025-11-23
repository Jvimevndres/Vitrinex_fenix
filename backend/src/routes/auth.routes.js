// backend/src/routes/auth.routes.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getPublicProfile,
  updateUserPlan
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/authRequired.js";

const router = Router();

// Rate limiter para rutas de autenticación (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 6, // máximo 6 intentos por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: "too_many_attempts",
      message: "Has excedido el número de intentos. Intenta más tarde.",
    });
  },
});

// Rutas de autenticación
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

// Perfil privado (usuario logueado)
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);
router.put("/plan", authRequired, updateUserPlan); // 💳 Actualizar plan

// Perfil público de un usuario por ID (sin auth)
// 👉 Esto es lo que está usando CustomerPublicPage: /api/auth/users/:id
router.get("/users/:id", getPublicProfile);

export default router;
