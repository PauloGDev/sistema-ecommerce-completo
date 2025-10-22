import { motion } from "framer-motion";
import { ShoppingCart, EyeOff } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ import necessário
import ProdutoModal from "./ProdutoModal";

const ProdutoCard = ({ produto, variants, onClick, onAdicionar }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate(); // ⬅️ usado para redirecionar

  const estoqueTotal = useMemo(
    () =>
      produto.variacoes?.length > 0
        ? produto.variacoes.reduce((acc, v) => acc + (v.estoque || 0), 0)
        : produto.estoque ?? 0,
    [produto]
  );

  const precoExibido = useMemo(() => {
    if (produto.variacoes?.length > 0) {
      const precosValidos = produto.variacoes
        .map((v) => v.preco)
        .filter((p) => typeof p === "number" && !isNaN(p));

      return precosValidos.length > 0 ? Math.min(...precosValidos) : 0;
    }

    return typeof produto.precoBase === "number" ? produto.precoBase : 0;
  }, [produto]);

  // 🔹 Verifica login e abre modal ou adiciona produto
  const handleAdicionarClick = (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      // Se não estiver logado, redireciona para login
      navigate("/login");
      return;
    }

    if (produto.variacoes?.length > 0) {
      setMostrarModal(true);
    } else {
      onAdicionar(produto);
    }
  };

  const cardClasses = `
    relative group rounded-2xl border-2 border-gray-600 hover:border-gray-400 
    overflow-hidden p-4 flex flex-col items-center transition 
    bg-gray-800/50
    ${!produto.ativo ? "opacity-50 grayscale pointer-events-none" : ""}
  `;

  return (
    <>
      <motion.div
        key={produto.id}
        variants={variants}
        whileHover={{ scale: produto.ativo ? 1.03 : 1 }}
        onClick={() => produto.ativo && onClick(produto.slug)}
        className="cursor-pointer w-full max-w-xs sm:w-72 md:w-80"
        role="button"
        tabIndex={0}
        aria-label={`Ver detalhes do produto ${produto.nome}`}
        onKeyDown={(e) =>
          produto.ativo && e.key === "Enter" && onClick(produto.slug)
        }
      >
        <div className={cardClasses}>
          {!produto.ativo && (
            <div className="absolute top-3 right-3 bg-red-600/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <EyeOff className="w-4 h-4" />
              Inativo
            </div>
          )}

          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            <img
              src={produto.imagemUrl || "/placeholder.png"}
              alt={produto.nome}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="mt-6 text-center w-full">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-200 line-clamp-1">
              {produto.nome}
            </h3>

            {produto.variacoes?.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {produto.variacoes.map((v) => (
                  <span
                    key={v.id}
                    className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    <p>{v.nome}</p>
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-400 line-clamp-2 mt-2">
              {produto.descricao}
            </p>

            {precoExibido > 0 ? (
              <span className="block text-md sm:text-lg text-amber-400 font-bold mt-2">
                {produto.variacoes?.length > 0
                  ? `A partir de R$ ${precoExibido.toFixed(2).replace(".", ",")}`
                  : `R$ ${precoExibido.toFixed(2).replace(".", ",")}`}
              </span>
            ) : (
              <span className="block text-md sm:text-lg text-gray-400 font-bold mt-2">
                Preço indisponível
              </span>
            )}

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                estoqueTotal > 0
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {estoqueTotal > 0 ? `Em estoque` : "Esgotado"}
            </span>

            <button
              onClick={handleAdicionarClick}
              disabled={estoqueTotal === 0 || !produto.ativo}
              className={`mt-4 w-full py-2 rounded-lg text-center transition flex items-center justify-center gap-2 font-medium ${
                estoqueTotal > 0 && produto.ativo
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {estoqueTotal === 0
                ? "Indisponível"
                : !produto.ativo
                ? "Desativado"
                : produto.variacoes?.length > 0
                ? "Escolher volume"
                : "Adicionar ao Carrinho"}
            </button>
          </div>
        </div>
      </motion.div>

      {mostrarModal && produto.ativo && (
        <ProdutoModal
          produto={produto}
          onClose={() => setMostrarModal(false)}
          onAdicionar={onAdicionar}
        />
      )}
    </>
  );
};

ProdutoCard.propTypes = {
  produto: PropTypes.object.isRequired,
  variants: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  onAdicionar: PropTypes.func.isRequired,
};

export default ProdutoCard;
