// src/components/dashboard/Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  LayoutDashboard,
  Info,
  Store,
  Home,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const Sidebar = ({ section, changeSection, sidebarOpen }) => {
  const [role, setRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Pega role do token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      const userRoles = decoded?.roles || [];
      if (Array.isArray(userRoles) && userRoles.includes("ROLE_ADMIN")) {
        setRole("ADMIN");
      } else {
        setRole("USER");
      }
    } else {
      setRole(null);
    }
  }, [location.pathname]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 p-6 
        bg-white/5 border-r border-white/10 backdrop-blur-md 
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="flex items-center gap-2 mb-10 pt-20">
        <LayoutDashboard className="w-7 h-7 text-amber-400" />
        <h1 className="text-xl font-bold">Painel Admin</h1>
      </div>

      {/* Navegação interna do painel */}
      <nav className="flex flex-col gap-3">
        {[
          { key: "produtos", label: "Produtos", icon: Package },
          { key: "usuarios", label: "Usuários", icon: Users },
          { key: "pedidos", label: "Pedidos", icon: ShoppingCart },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => changeSection(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              section === key
                ? "bg-amber-400 text-black font-semibold"
                : "hover:bg-white/10"
            }`}
          >
            <Icon className="w-5 h-5" /> {label}
          </button>
        ))}

        {/* Divisor */}
        <hr className="my-4 border-white/10" />

        {/* Links extras */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          <Home className="w-5 h-5" /> Home
        </Link>

        <Link
          to="/produtos"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          <Store className="w-5 h-5" /> Visitar Loja
        </Link>

        <Link
          to="/sobre"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"
        >
          <Info className="w-5 h-5" /> Sobre
        </Link>

        {/* Divisor */}
        <hr className="my-4 border-white/10" />

        {/* Botão de sair ou login */}
        {role ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-600/20"
          >
            Sair
          </button>
        ) : (
          <Link
            to="/login"
            className="block text-center bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-medium text-black"
          >
            Fazer Login
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
