import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import {
  RiInstagramLine,
  RiWhatsappLine,
} from "react-icons/ri";
import {
  FaCcVisa,
  FaCcMastercard,
  FaPix,
  FaCcAmex,
  FaCcDinersClub,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full z-10 bg-black text-gray-300 relative">
      {/* Área principal */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 items-center gap-12">
        
        {/* Coluna 1 - Navegação */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <h3 className="text-lg font-semibold text-white">Navegação</h3>
          <Link to="/" className="hover:text-amber-400 transition">Início</Link>
          <Link to="/produtos" className="hover:text-amber-400 transition">Produtos</Link>
          <Link to="/sobre" className="hover:text-amber-400 transition">Sobre Nós</Link>
          <a href="https://wa.me/5585984642900" className="hover:text-amber-400 transition">Contato</a>
          <Link to="/direitos" className="hover:text-amber-400 transition">
            Política de Privacidade e Termos de uso
          </Link>
        </div>

        {/* Coluna 2 - Logo central */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src={assets.logo_branca}
            alt="Sublime Perfumes Logo"
            className="w-32 sm:w-40"
          />
          <p className="max-w-sm text-gray-400 text-sm leading-relaxed">
            Perfumes importados, originais e marcantes — Sublime Perfumes Fracionados.
          </p>
        </div>

        {/* Coluna 3 - Redes sociais */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <h3 className="text-lg font-semibold text-white">Conecte-se</h3>
          <div className="flex gap-5">
            <a
              href="https://www.instagram.com/perfumesfracionadossublime/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition"
            >
              <RiInstagramLine className="w-6 h-6" />
            </a>
            <a
              href="https://wa.me/5585984642900"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition"
            >
              <RiWhatsappLine className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Linha divisória */}
      <div className="border-t border-white/10"></div>

      {/* Formas de pagamento */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col items-center space-y-3">
        <h3 className="text-sm font-semibold text-white">Formas de Pagamento</h3>
        <div className="flex flex-wrap justify-center gap-5 text-gray-400 text-3xl">
          <FaCcVisa className="hover:text-amber-400 transition" />
          <FaCcMastercard className="hover:text-amber-400 transition" />
          <FaCcAmex className="hover:text-amber-400 transition" />
          <FaCcDinersClub className="hover:text-amber-400 transition" />
          <FaPix className="hover:text-amber-400 transition" />
        </div>
      </div>

      {/* Créditos + Direitos */}
      <div className="border-t border-white/10"></div>
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>
          © {new Date().getFullYear()} Sublime Perfumes Fracionados — Todos os direitos reservados.
          <br />
          CNPJ: 63.065.539/0001-49 — Eusébio - CE
        </p>
        <a
          href="https://digitaltricks.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 hover:text-indigo-600 transition mt-3 md:mt-0"
        >
          <span>Desenvolvido por</span>
          <img
            src={assets.digitalTricksLogo}
            alt="Digital Tricks Logo"
            className="w-8"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
