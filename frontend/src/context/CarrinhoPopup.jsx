// src/components/CarrinhoPopup.jsx
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCarrinho } from "./CarrinhoContext";
import { ShoppingCart, Trash2 } from "lucide-react";

const CarrinhoPopup = () => {
const { carrinho, removerDoCarrinho } = useCarrinho();
  const [aberto, setAberto] = useState(false);
  const location = useLocation();

  // Esconde no checkout e página do carrinho
  if (location.pathname === "/checkout" || location.pathname === "/carrinho") {
    return null;
  }

  const total = carrinho?.itens?.reduce(
    (sum, item) => sum + item.precoUnitario * item.quantidade,
    0
  ) || 0;

  return (
    <>
      {/* Botão fixo */}
<button
  onClick={() => setAberto(true)}
  className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50"
>
  <ShoppingCart size={22} />
  {carrinho?.itens?.length > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-2 py-0.5 rounded-full">
      {carrinho.itens.length}
    </span>
  )}
</button>


      {/* Drawer lateral */}
      <AnimatePresence>
        {aberto && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setAberto(false)}
            />

            {/* Menu lateral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-black via-gray-900 to-black shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg text-white font-bold">Meu Carrinho</h2>
                <button onClick={() => setAberto(false)}>❌</button>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
{carrinho?.itens?.length > 0 ? (
  carrinho.itens.map((item) => (
    <div
      key={item.produtoId}
      className="flex items-center justify-between border rounded p-2"
    >
      <div className="flex items-center gap-2">
        <img
          src={`/imagens/produtos/${item.produtoId}.jpg`}
          alt={item.nomeProduto}
          className="w-12 h-12 object-contain rounded"
        />
        <div>
          <p className="text-sm text-white font-semibold">{item.nomeProduto}</p>
          <p className="text-xs text-gray-300">
            {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
          </p>
        </div>
      </div>
      <button
        onClick={() => removerDoCarrinho(item.produtoId)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 size={18} />
      </button>
    </div>
  ))
) : (
  <p className="text-gray-200 text-center">🛒 Carrinho vazio</p>
)}

              </div>

              {/* Rodapé */}
              <div className="p-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="font-bold text-amber-400">R$ {total.toFixed(2)}</span>
                </div>
                <Link
                  to="/carrinho"
                  onClick={() => setAberto(false)}
                  className="block text-center w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg"
                >
                  Ver Carrinho
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CarrinhoPopup;
