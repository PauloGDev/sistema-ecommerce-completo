import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [userData, setUserData] = useState(null); // dados do usuário retornados pelo backend
  const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        if (!res.ok) {
          localStorage.removeItem("token");
          setUserData(null);
        } else {
          const data = await res.json(); // payload vindo do backend
          setUserData(data);
        }
      } catch (err) {
        console.error("Erro ao validar token:", err);
        localStorage.removeItem("token");
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // ⏳ Enquanto valida
  if (loading) {
    return <div className="text-white p-6">🔄 Validando sessão...</div>;
  }

  // ❌ Não logado → login
  if (!token || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔹 Verificação de roles
  const userRoles = userData.roles || userData.role || [];
  const isAdmin = Array.isArray(userRoles)
    ? userRoles.includes("ROLE_ADMIN")
    : userRoles === "ROLE_ADMIN";

  // ❌ Se precisa ser admin mas não é → home
  if (role === "ADMIN" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ✅ Libera rota
  return children;
};

export default PrivateRoute;
