import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo } from "react";

const ProdutoCard = ({ produto, variants, onClick, onAdicionar }) => {
  const estoqueTotal = useMemo(
    () =>
      produto.variacoes?.length > 0
        ? produto.variacoes.reduce((acc, v) => acc + (v.estoque || 0), 0)
        : produto.estoque ?? 0,
    [produto]
  );

  const precoExibido = useMemo(
    () =>
      produto.variacoes?.length > 0
        ? Math.min(...produto.variacoes.map((v) => v.preco))
        : produto.precoBase,
    [produto]
  );

  return (
    <motion.div
      key={produto.id}
      variants={variants}
      whileHover={{ scale: 1.03 }}
      onClick={() => onClick(produto.slug)}
      className="cursor-pointer w-full max-w-xs sm:w-72 md:w-80"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes do produto ${produto.nome}`}
      onKeyDown={(e) => e.key === "Enter" && onClick(produto.slug)}
    >
      <div className="relative group rounded-2xl border-2 border-gray-600 hover:border-gray-400 overflow-hidden p-4 flex flex-col items-center transition bg-gray-800/50">
        {/* Imagem */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <img
            src={produto.imagemUrl || "/placeholder.png"}
            alt={produto.nome}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        {/* Infos */}
        <div className="mt-6 text-center w-full">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-200 line-clamp-1">
            {produto.nome}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">{produto.descricao}</p>

          {/* Preço */}
          <span className="block text-md sm:text-lg text-amber-400 font-bold mt-2">
            {produto.variacoes?.length > 0
              ? `A partir de R$ ${precoExibido.toFixed(2).replace(".", ",")}`
              : `R$ ${precoExibido.toFixed(2).replace(".", ",")}`}
          </span>

          {/* Estoque */}
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              estoqueTotal > 0
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {estoqueTotal > 0
              ? `Em estoque (${estoqueTotal})`
              : "Esgotado"}
          </span>

          {/* Botão */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdicionar(produto.id);
            }}
            disabled={estoqueTotal === 0}
            className={`mt-4 w-full py-2 rounded-lg text-center transition flex items-center justify-center gap-2 font-medium ${
              estoqueTotal > 0
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {estoqueTotal > 0
              ? "Adicionar ao Carrinho"
              : "Indisponível"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

ProdutoCard.propTypes = {
  produto: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    slug: PropTypes.string,
    nome: PropTypes.string.isRequired,
    descricao: PropTypes.string,
    precoBase: PropTypes.number,
    estoque: PropTypes.number,
    imagemUrl: PropTypes.string,
    variacoes: PropTypes.arrayOf(
      PropTypes.shape({
        preco: PropTypes.number,
        estoque: PropTypes.number,
      })
    ),
  }).isRequired,
  variants: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  onAdicionar: PropTypes.func.isRequired,
};


export default ProdutoCard;
