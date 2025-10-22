import React, { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, X } from "lucide-react";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null); // ⬅️ Novo ref para o dropdown

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha menu se clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Fecha dropdown se clicar fora
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Pega role do token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      const userRoles = decoded?.roles || [];
      setRole(
        Array.isArray(userRoles) && userRoles.includes("ROLE_ADMIN")
          ? "ADMIN"
          : "USER"
      );
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

  const isActive = (path) => location.pathname === path;

  const links = [
    { label: "Produtos", path: "/produtos" },
    { label: "Sobre", path: "/sobre" },
    { label: "Contato", path: "https://wa.me/5585984642900", anchor: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 
      ${scrolled ? "bg-gray-950/95 shadow-md py-3" : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            className="w-32 md:w-40 lg:w-44"
            alt="Sublime Perfumes"
          />
        </Link>

        {/* Links - Desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white">
          {links.map((link) =>
            link.anchor ? (
              <a
                key={link.label}
                href={link.path}
                className="hover:text-gray-400 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.path}
                className={`hover:text-gray-400 transition-colors ${
                  isActive(link.path) ? "text-amber-400" : ""
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Ações (login/perfil) */}
        <div className="flex items-center gap-4">
          {role ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-black transition"
              >
                <User size={20} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden text-sm z-50">
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
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-medium text-black transition"
            >
              Fazer Login
            </Link>
          )}

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
          >
            <span className="block h-0.5 w-6 bg-white mb-1" />
            <span className="block h-0.5 w-6 bg-white mb-1" />
            <span className="block h-0.5 w-6 bg-white" />
          </button>
        </div>
      </div>

      {/* Overlay + Sidebar Mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />

          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className="absolute top-0 right-0 w-64 h-full bg-gray-950 shadow-lg p-6 flex flex-col gap-6 text-white animate-slide-in"
          >
            <button
              className="self-end text-gray-400 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              <X size={24} />
            </button>

            {links.map((link) =>
              link.anchor ? (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`hover:text-amber-400 transition-colors ${
                    isActive(link.path) ? "text-amber-400" : ""
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`hover:text-amber-400 transition-colors ${
                    isActive(link.path) ? "text-amber-400" : ""
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
