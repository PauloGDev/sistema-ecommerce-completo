// src/components/dashboard/produtos/ProductCard.jsx
import { useState, useMemo } from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  PackageX,
  EyeOff,
  RefreshCcw,
} from "lucide-react";
import EditProductModal from "./EditProductModal";
import { useNotification } from "../../../context/NotificationContext";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ produto, onChange, onProdutoAtualizado }) => {
  const [editing, setEditing] = useState(false);
  const { showNotification } = useNotification();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showVariacoes, setShowVariacoes] = useState(false);
  const navigate = useNavigate();

  // 🔹 Cálculos de estoque e preço
  const { estoqueTotal, precoExibido, esgotadas } = useMemo(() => {
    if (produto.variacoes && produto.variacoes.length > 0) {
      const estoque = produto.variacoes.reduce(
        (acc, v) => acc + (v.estoque || 0),
        0
      );
      const menorPreco = Math.min(...produto.variacoes.map((v) => v.preco));
      const esgotadas = produto.variacoes.filter((v) => v.estoque <= 0).length;
      return { estoqueTotal: estoque, precoExibido: menorPreco, esgotadas };
    }
    return {
      estoqueTotal: produto.estoque ?? 0,
      precoExibido: produto.precoBase,
      esgotadas: 0,
    };
  }, [produto]);

  // 🔸 Alterna entre ativo/inativo
  const handleToggleAtivo = async (id, novoStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/produtos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativo: novoStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status do produto");

      showNotification(
        novoStatus
          ? "✅ Produto reativado com sucesso!"
          : "🛑 Produto desativado com sucesso!",
        "success"
      );

      onChange();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      showNotification("❌ Não foi possível atualizar o status do produto", "error");
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        onClick={() => produto.ativo && setEditing(true)}
        className={`relative bg-white/10 border border-white/10 rounded-2xl p-6 flex flex-col transition cursor-pointer 
          hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5
          ${!produto.ativo ? "" : ""}`}
      >
        {!produto.ativo && (
          <div className="z-20 absolute self-center justify-center bg-red-600/80 text-white text-xs px-6 py-3 rounded-md flex items-center gap-1">
            <EyeOff size={14} /> Inativo
          </div>
        )}

        {/* 🔹 Imagem */}
        <div className="relative w-full h-40 mb-4 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
          {produto.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="w-full h-full object-contain"
            />
          ) : (
            <PackageX className="w-10 h-10 text-gray-600" />
          )}
        </div>

        {/* 🔹 Nome e descrição */}
        <h3 className="text-lg font-semibold text-gray-100 truncate">
          {produto.nome}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">{produto.descricao}</p>

        {/* 🔹 Categorias */}
        {produto.categorias && produto.categorias.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {produto.categorias.map((cat, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
              >
                {typeof cat === "string" ? cat : cat.nome}
              </span>
            ))}
          </div>
        )}

        {/* 🔹 Preço */}
        <p className="mt-2 font-semibold text-amber-400">
          {produto.variacoes && produto.variacoes.length > 0
            ? `A partir de ${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(precoExibido)}`
            : new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(precoExibido)}
        </p>

        {/* 🔹 Estoque */}
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

        {/* 🔸 Variações */}
        {produto.variacoes && produto.variacoes.length > 0 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVariacoes(!showVariacoes);
              }}
              className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                {produto.variacoes.length}
              </span>
              {showVariacoes ? (
                <>
                  Ocultar variações <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Mostrar variações <ChevronDown size={16} />
                </>
              )}
            </button>

            {showVariacoes && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 space-y-2 bg-black/20 rounded-lg p-3 border border-white/10"
              >
                {produto.variacoes.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center text-sm border-b border-white/10 pb-1 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      {v.nome}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          v.estoque > 5
                            ? "bg-green-400"
                            : v.estoque > 0
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        }`}
                      ></span>
                    </span>
                    <span className="font-medium text-gray-200">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(v.preco)}{" "}
                      ({v.estoque} un.)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 🔹 Botões */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/produtos/${produto.slug}`);
            }}
            disabled={!produto.ativo}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 transition ${
              produto.ativo
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Eye size={16} /> Ver Página
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 transition ${
              produto.ativo
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            } text-white`}
          >
            {produto.ativo ? (
              <>
                <Trash2 size={16} /> Desativar
              </>
            ) : (
              <>
                <RefreshCcw size={16} /> Reativar
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔹 Modal de confirmação */}
      <DeleteConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => handleToggleAtivo(produto.id, !produto.ativo)}
        title={
          produto.ativo ? "Desativar produto?" : "Reativar produto?"
        }
        message={
          produto.ativo
            ? "O produto será marcado como inativo, mas continuará salvo no sistema."
            : "O produto será reativado e voltará a aparecer na loja."
        }
        isReativando={!produto.ativo}
      />


      {editing && produto.ativo && (
        <EditProductModal
          produto={produto}
          onClose={() => setEditing(false)}
          onSaved={(produtoAtualizado) => {
            if (produtoAtualizado) {
              // ✅ Atualiza apenas o item alterado
              if (typeof onProdutoAtualizado === "function") {
                onProdutoAtualizado(produtoAtualizado);
              }
              showNotification("✅ Produto atualizado com sucesso!", "success");
            }
            setEditing(false);
          }}
        />
      )}

    </>
  );
};

export default ProductCard;
