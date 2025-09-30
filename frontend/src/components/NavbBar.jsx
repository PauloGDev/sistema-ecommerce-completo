import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react"; // Ícone de perfil

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Função para verificar se o link está ativo
  const isActive = (path) => location.pathname === path;

  // 🔹 Navbar normal (cliente/visitante)
  return (
    <div
      id="navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out 
      ${scrolled ? "bg-gray-950 shadow-md py-3" : "bg-transparent py-6"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between font-medium">
        {/* Logo */}
        <Link to="/">
          <img src={assets.logo} className="w-32 lg:w-44" alt="Sublime Perfumes" />
        </Link>

        {/* Menu desktop - sempre aparece, inclusive para ADMIN */}
<ul className="sm:flex gap-10 text-sm items-center hidden font-medium text-white">
  <div className="flex flex-col items-center">
    <Link
      to="/produtos"
      className={`hover:text-gray-400 ${isActive("/produtos") ? "text-amber-400" : ""}`}
    >
      Produtos
    </Link>
  </div>
  <div className="flex flex-col items-center">
    <Link
      to="/sobre"
      className={`hover:text-gray-400 ${isActive("/sobre") ? "text-amber-400" : ""}`}
    >
      Sobre
    </Link>
  </div>
  <div className="flex flex-col items-center">
    <a href="/#contato" className="hover:text-gray-400">
      Contato
    </a>
  </div>
</ul>


        {/* Ícone Perfil/Login */}
        <div className="relative">
          {role ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-black"
              >
                <User size={20} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 text-sm z-50">
                  {role === "USER" && (
                    <>
                      <Link
                        to="/painel"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        to="/meus-pedidos"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Meus Pedidos
                      </Link>
                    </>
                  )}

                  {role === "ADMIN" && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard/#produtos"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Gerenciar Produtos
                      </Link>
                      <Link
                        to="/dashboard/#usuarios"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Gerenciar Usuários
                      </Link>
                      <Link
                        to="/dashboard/#pedidos"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Gerenciar Pedidos
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-medium text-black"
            >
              Fazer Login
            </Link>
          )}
        </div>

        {/* Botão hambúrguer - mobile */}
        <button
          onClick={() => setVisible(!visible)}
          className="sm:hidden flex flex-col justify-center items-center w-8 h-8 relative"
        >
          <span
            className={`block absolute h-0.5 w-6 bg-white transform transition duration-500 ease-in-out 
            ${visible ? "rotate-45 translate-y-0.5" : "-translate-y-1.5"}`}
          />
          <span
            className={`block absolute h-0.5 w-6 bg-white transition duration-500 ease-in-out 
            ${visible ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block absolute h-0.5 w-6 bg-white transform transition duration-500 ease-in-out 
            ${visible ? "-rotate-45 -translate-y-0.5" : "translate-y-1.5"}`}
          />
        </button>
      </div>

      {/* Menu mobile */}
      {visible && (
  <div className="absolute top-full right-0 w-full bg-gray-950 shadow-lg p-6 flex flex-col gap-4 text-sm font-medium sm:hidden z-40 text-white">
    <Link to="/produtos" onClick={() => setVisible(false)} className={isActive("/produtos") ? "text-amber-400" : "hover:text-gray-400"}>
      Produtos
    </Link>
    <Link to="/sobre" onClick={() => setVisible(false)} className={isActive("/sobre") ? "text-amber-400" : "hover:text-gray-400"}>
      Sobre
    </Link>
    <a href="/#contato" onClick={() => setVisible(false)} className="hover:text-gray-400">
      Contato
    </a>
  </div>
)}

    </div>
  );
};

export default Navbar;
