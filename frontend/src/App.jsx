import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom"; // ⬅️ importar useLocation
import Home from "./pages/Home";
import About from "./pages/About";
import NavBar from "./components/NavbBar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./context/ScrollToTop";
import Error404 from "./pages/Error404";
import CookieConsent from "./components/CookieConsent";
import LoadingScreen from "./components/LoadingScreen";
import Produtos from "./pages/Produtos";
import ProdutoPage from "./components/Produtos/ProdutoPage";
import PoliticaPrivacidade from "./components/PoliticaPrivacidade";
import { CarrinhoProvider } from "./context/CarrinhoContext";

// IMPORTAR o ícone do WhatsApp
import { FaWhatsapp } from "react-icons/fa";
import Dashboard from "./pages/Dashboard";
import CarrinhoPopup from "./context/CarrinhoPopup";
import PrivateRoute from "./context/PrivateRoute";
import Login from "./pages/Login";
import PublicRoute from "./context/PublicRoute";
import Register from "./pages/Register";
import UserPanel from "./pages/UserPanel";
import PedidosPage from "./pages/PedidosPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import CarrinhoPage from "./components/CarrinhoPage";
import CheckoutPage from "./components/checkout/CheckoutPage";
import DireitosPage from "./pages/Direitos";

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // ⬅️ pegar rota atual

  useEffect(() => {
    // Simula tempo de carregamento inicial
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  // Verifica se está na rota de dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <ToastContainer />
      <ScrollToTop />

      {/* Navbar só aparece se NÃO estiver no dashboard */}
      {!isDashboard && (
        <div>
          <CarrinhoPopup />
        <nav className="fixed w-full top-0 left-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NavBar />
          </div>
        </nav>
        </div>
      )}

      {/* Rotas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/produtos" element={<Produtos />} />
        {/* Públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/direitos"
          element={
            <PublicRoute>
              <DireitosPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protegidas */}
        <Route
          path="/painel"
          element={
            <PrivateRoute role="USER">
              <UserPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/meus-pedidos"
          element={
            <PrivateRoute role="USER">
              <PedidosPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="ADMIN">
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/success"
          element={
            <PrivateRoute role="USER">
              <SuccessPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cancel"
          element={
            <PrivateRoute role="USER">
              <CancelPage />
            </PrivateRoute>
          }
        />

        <Route path="/carrinho" element={<CarrinhoPage />} />
        <Route path="/produtos/:slug" element={<ProdutoPage />} />
         <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<Error404 />} />
        <Route
          path="/politica-de-privacidade"
          element={<PoliticaPrivacidade />}
        />
      </Routes>

      {/* Footer só aparece se não for dashboard */}
      {!isDashboard && (
        <footer className="mt-auto">
          <Footer />
        </footer>
      )}

      {/* Consentimento de Cookies */}
      <CookieConsent />
    </div>
  );
};

export default App;
