// src/components/ProdutoModal.jsx
import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";

export default function ProdutoModal({ produto, onClose, onAdicionar }) {
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);

const handleAdicionar = () => {
  if (!variacaoSelecionada) return;
  onAdicionar(produto.id, variacaoSelecionada?.id, 1); // produtoId, variacaoId, quantidade
  onClose();
};

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={22} />
        </button>

        {/* Conteúdo */}
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={produto.imagemUrl || "/placeholder.png"}
              alt={produto.nome}
              className="w-40 h-40 object-contain rounded-lg bg-gray-800"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-1">{produto.nome}</h2>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {produto.descricao}
            </p>

            <label className="block text-sm mb-2 text-gray-300">
              Escolha uma variação:
            </label>
            <select
              value={variacaoSelecionada?.id || ""}
              onChange={(e) => {
                const v = produto.variacoes.find(
                  (varItem) => varItem.id === parseInt(e.target.value)
                );
                setVariacaoSelecionada(v);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200"
            >
              <option value="">Selecione...</option>
              {produto.variacoes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} — R${v.preco.toFixed(2).replace(".", ",")}
                </option>
              ))}
            </select>

            <button
              onClick={handleAdicionar}
              disabled={!variacaoSelecionada}
              className={`mt-5 w-full flex items-center justify-center gap-2 py-2 rounded-md font-medium transition ${
                variacaoSelecionada
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
