// src/components/dashboard/produtos/ProductCard.jsx
import { useState, useMemo } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import EditProductModal from "./EditProductModal";
import { useNotification } from "../../../context/NotificationContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

const ProductCard = ({ produto, onChange }) => {
  const [editing, setEditing] = useState(false);
  const { showNotification } = useNotification();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showVariacoes, setShowVariacoes] = useState(false);

  // 🔹 Calcula estoque total e preço
  const { estoqueTotal, precoExibido } = useMemo(() => {
    if (produto.variacoes && produto.variacoes.length > 0) {
      const estoque = produto.variacoes.reduce(
        (acc, v) => acc + (v.estoque || 0),
        0
      );
      const menorPreco = Math.min(...produto.variacoes.map((v) => v.preco));
      return { estoqueTotal: estoque, precoExibido: menorPreco };
    }
    return { estoqueTotal: produto.estoque ?? 0, precoExibido: produto.precoBase };
  }, [produto]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/produtos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir produto");

      showNotification("✅ Produto excluído com sucesso!", "success");
      onChange();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      showNotification("❌ Não foi possível excluir o produto", "error");
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <>
      {/* 🔹 Card inteiro abre o modal de edição */}
      <div
        onClick={() => setEditing(true)}
        className="bg-white/10 border border-white/10 rounded-2xl p-6 flex flex-col hover:scale-[1.01] transition cursor-pointer"
      >
        <img
          src={produto.imagemUrl}
          alt={produto.nome}
          className="w-full h-40 object-cover rounded-xl mb-4"
        />
        <h3 className="text-lg font-semibold truncate">{produto.nome}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{produto.descricao}</p>

        {/* 🔹 Preço (se tiver variação mostra "a partir de") */}
        <p className="mt-2 font-bold">
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

          {/* 🔹 Mostrar/Ocultar variações */}
          {produto.variacoes && produto.variacoes.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVariacoes(!showVariacoes);
              }}
              className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              {/* 🔹 Badge com quantidade */}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
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
          )}

        {/* 🔹 Lista de variações expandida */}
        {showVariacoes && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 space-y-2 bg-black/20 rounded-lg p-3"
          >
            {produto.variacoes.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center text-sm border-b border-white/10 pb-1 last:border-0"
              >
                <span>{v.nome}</span>
                <span className="font-medium">
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

        {/* 🔹 Botão excluir separado (não propaga clique) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // impede abrir edição
            setConfirmDelete(true);
          }}
          className="mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-400 transition flex items-center justify-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Excluir
        </button>
      </div>

      {/* 🔹 Confirmação de exclusão */}
      <DeleteConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => handleDelete(produto.id)}
      />

      {/* 🔹 Modal de edição */}
      {editing && (
        <EditProductModal
          produto={produto}
          onClose={() => setEditing(false)}
          onSaved={() => {
            onChange();
            showNotification("✅ Produto atualizado com sucesso!", "success");
            setEditing(false);
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
