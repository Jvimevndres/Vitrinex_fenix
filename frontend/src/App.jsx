import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Páginas
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StoreProfilePage from "./pages/StoreProfilePage";
import StorePublicPage from "./pages/StorePublic";
import ProductDetailPage from "./pages/ProductDetailPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import CustomerPublicPage from "./pages/CustomerPublicPage";
import ExploreStoresPage from "./pages/ExploreStoresPage";
import OnboardingPage from "./pages/OnboardingPage";
import BookingChatPage from "./pages/BookingChatPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";

// Admin Panel
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStoresManager from "./pages/AdminStoresManager";
import AdminUsersManager from "./pages/AdminUsersManager";
import AdminSponsorsManager from "./pages/AdminSponsorsManager";
import AdminCommentsViewer from "./pages/AdminCommentsViewer";
import AdminChatbotMonitor from "./pages/AdminChatbotMonitor";

// Chatbot Widget
import ChatbotWidget from "./components/ChatbotWidget";

// Ruta protegida
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, checkLogin } = useAuth();

  useEffect(() => {
    // ✅ Si llegamos a una ruta protegida y aún no se verificó sesión, hacerlo ahora
    checkLogin();
  }, [checkLogin]);

  if (loading)
    return (
      <div className="text-center py-10 text-slate-600 font-medium">
        Cargando sesión...
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Home = Mapa */}
        <Route path="/" element={<ExploreStoresPage />} />
        <Route path="/explorar" element={<ExploreStoresPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Páginas públicas */}
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Cliente (privado y público) */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/usuario/:id" element={<CustomerPublicPage />} />

        {/* Negocios (sin cambios) */}
        <Route
          path="/negocio/:id"
          element={
            <ProtectedRoute>
              <StoreProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/tienda/:id" element={<StorePublicPage />} />
        <Route path="/tienda/:storeId/producto/:productId" element={<ProductDetailPage />} />

        {/* Chat público de reserva */}
        <Route path="/reserva/:bookingId/chat" element={<BookingChatPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="stores" element={<AdminStoresManager />} />
          <Route path="users" element={<AdminUsersManager />} />
          <Route path="sponsors" element={<AdminSponsorsManager />} />
          <Route path="comments" element={<AdminCommentsViewer />} />
          <Route path="chatbot" element={<AdminChatbotMonitor />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Widget de Chatbot - Aparece en todas las páginas */}
      <ChatbotWidget />
    </>
  );
}
