import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCarrinho } from "./CarrinhoContext";
import { ShoppingCart, Trash2, XCircle, PackageSearch } from "lucide-react";
import { useNotification } from "../context/NotificationContext";

const CarrinhoPopup = () => {
  const { carrinho, removerDoCarrinho } = useCarrinho();
  const { showNotification } = useNotification();
  const [aberto, setAberto] = useState(false);
  const location = useLocation();

  // Esconde no checkout e página do carrinho
  if (location.pathname === "/checkout" || location.pathname === "/carrinho") {
    return null;
  }

  const total =
    carrinho?.itens?.reduce(
      (sum, item) => sum + item.precoUnitario * item.quantidade,
      0
    ) || 0;

  const handleRemover = (produtoId) => {
    removerDoCarrinho(produtoId);
    showNotification("Item removido do carrinho.", "error");
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setAberto(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50 transition-transform"
        aria-label="Abrir carrinho"
      >
        <ShoppingCart size={24} />
        {carrinho?.itens?.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
            {carrinho.itens.length}
          </span>
        )}
      </motion.button>

      {/* Drawer lateral */}
      <AnimatePresence>
        {aberto && (
          <>
            {/* Overlay (fecha ao clicar fora) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setAberto(false)}
            />

            {/* Carrinho */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border-l border-gray-800 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingCart className="text-amber-400" size={18} />
                  Meu Carrinho
                </h2>
                <button
                  onClick={() => setAberto(false)}
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Fechar carrinho"
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {carrinho?.itens?.length > 0 ? (
                  carrinho.itens.map((item) => (
                    <motion.div
                      key={item.produtoId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-gray-900/70 hover:bg-gray-800 transition border border-gray-800 rounded-xl p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imagemUrl}
                          alt={item.nomeProduto}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                        />
                        <div>
                          <p className="text-sm text-white font-medium leading-tight">
                            {item.nomeProduto}
                            {item.variacaoNome ? ` – ${item.variacaoNome}` : ""}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.quantidade}x R${" "}
                            {item.precoUnitario.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemover(item.produtoId)}
                        className="text-red-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-gray-300">
                    <PackageSearch className="w-12 h-12 text-amber-400 mb-3" />
                    <p className="text-lg font-medium mb-1">
                      Seu carrinho está vazio
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                      Explore nossos perfumes e adicione seus favoritos!
                    </p>
                    <Link
                      to="/produtos"
                      onClick={() => setAberto(false)}
                      className="px-5 py-2 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition shadow-md"
                    >
                      Ver Produtos
                    </Link>
                  </div>
                )}
              </div>

              {/* Rodapé */}
              {carrinho?.itens?.length > 0 && (
                <div className="p-4 border-t border-gray-800 bg-gray-950/90">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-300 font-medium">Total:</span>
                    <span className="font-bold text-amber-400 text-lg">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <Link
                    to="/carrinho"
                    onClick={() => setAberto(false)}
                    className="block text-center w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-lg shadow-lg transition"
                  >
                    Finalizar Compra
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CarrinhoPopup;
