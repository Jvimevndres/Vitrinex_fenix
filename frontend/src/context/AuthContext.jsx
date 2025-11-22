import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  profileRequest,
} from "../api/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // ✅ Solo verificar sesión si existe señal de sesión previa
    const hasSessionFlag = localStorage.getItem("hasSession") === "true";
    
    if (hasSessionFlag) {
      // Hay señal de sesión previa, verificar con el backend
      checkLogin();
    } else {
      // No hay sesión previa, no hacer petición innecesaria
      setLoading(false);
      setSessionChecked(true);
    }
  }, []);

  /**
   * ✅ Verificar sesión con el backend
   * Puede ser llamado por:
   * - useEffect inicial (si hay flag "hasSession" en localStorage)
   * - ProtectedRoute (cuando se accede a ruta protegida)
   */
  const checkLogin = async () => {
    // Si ya verificamos en este ciclo, no hacerlo de nuevo
    if (sessionChecked) return;
    
    setLoading(true);
    try {
      const result = await profileRequest();
      
      if (result.authenticated) {
        // Usuario autenticado correctamente
        setUser(result.data);
        setIsAuthenticated(true);
        localStorage.setItem("hasSession", "true"); // Mantener flag
      } else {
        // 401: No autenticado (estado normal)
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("hasSession"); // Limpiar flag
      }
    } catch (error) {
      // Solo errores críticos (red, 500, timeout)
      console.error("Error crítico al verificar sesión:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("hasSession"); // Limpiar flag
    } finally {
      setLoading(false);
      setSessionChecked(true);
    }
  };

  const login = async (credentials) => {
    const res = await loginRequest(credentials);
    setUser(res.data);
    setIsAuthenticated(true);
    setSessionChecked(true);
    localStorage.setItem("hasSession", "true"); // ✅ Setear flag de sesión
    
    // ✅ Disparar evento para que otros componentes recarguen datos del nuevo usuario
    window.dispatchEvent(new Event('userLogin'));
    
    return res.data;
  };

  const register = async (data) => {
    const res = await registerRequest(data);
    setUser(res.data);
    setIsAuthenticated(true);
    setSessionChecked(true);
    localStorage.setItem("hasSession", "true"); // ✅ Setear flag de sesión
    
    // ✅ Disparar evento para que otros componentes recarguen datos del nuevo usuario
    window.dispatchEvent(new Event('userLogin'));
    
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setSessionChecked(true);
      localStorage.removeItem("hasSession"); // ✅ Limpiar flag de sesión
      
      // ✅ Disparar evento para que otros componentes limpien su estado
      window.dispatchEvent(new Event('userLogout'));
    }
  };

  const updateUser = (newData) =>
    setUser((prev) => ({ ...prev, ...newData }));

  // 🔹 Aliases para compatibilidad con tu LoginPage.jsx
  const signin = login;
  const signup = register;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        checkLogin, // ✅ Exponer para que ProtectedRoute pueda llamarlo
        // aliases:
        signin,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
