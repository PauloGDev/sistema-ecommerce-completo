// src/components/Produto/CategoriaManager.jsx
import { useState, useEffect } from "react";
import { Plus, Trash, Pencil, Check, X, AlertTriangle } from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";

const CategoriaManager = ({ categoriasSelecionadas, onChange }) => {
  const { showNotification } = useNotification();
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [novoNome, setNovoNome] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;


  // modal de confirmação
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/categorias`);
        const data = await res.json();
        setCategorias(data);
      } catch {
        console.error("Erro ao carregar categorias");
      }
    };
    fetchCategorias();
  }, []);

  const toggleCategoria = (nome) => {
    const atual = categoriasSelecionadas.includes(nome);
    const novas = atual
      ? categoriasSelecionadas.filter((c) => c !== nome)
      : [...categoriasSelecionadas, nome];
    onChange(novas);
  };

  const handleAddCategoria = async () => {
    const nome = novaCategoria.trim();
    if (!nome)
      return showNotification("Digite um nome para a categoria.", "warning");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome }),
      });

      if (!res.ok) throw new Error("Erro ao criar categoria");

      const nova = await res.json();
      setCategorias((prev) => [...prev, nova]);
      setNovaCategoria("");
      showNotification("✅ Categoria criada com sucesso!", "success");
    } catch {
      showNotification("❌ Erro ao criar categoria", "error");
    }
  };

  const handleEditCategoria = async (cat) => {
    if (!novoNome.trim())
      return showNotification("Digite um novo nome.", "warning");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/categorias/${cat.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nome: novoNome }),
        }
      );

      if (!res.ok) throw new Error("Erro ao editar categoria");

      setCategorias((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, nome: novoNome } : c))
      );
      setEditingCategoria(null);
      setNovoNome("");
      showNotification("✏️ Categoria atualizada!", "success");
    } catch {
      showNotification("❌ Erro ao editar categoria", "error");
    }
  };

  const confirmarExclusao = (cat) => {
    setCategoriaParaExcluir(cat); // abre o modal
  };

  const handleDeleteCategoria = async () => {
    const cat = categoriaParaExcluir;
    if (!cat) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/categorias/${cat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir categoria");

      setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
      onChange(categoriasSelecionadas.filter((c) => c !== cat.nome));
      showNotification("🗑️ Categoria e vínculos removidos com sucesso!", "success");
    } catch {
      showNotification("❌ Erro ao excluir categoria", "error");
    } finally {
      setCategoriaParaExcluir(null);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <label className="block text-sm font-medium mb-3">Categorias</label>

      {/* Lista */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition
              ${
                categoriasSelecionadas.includes(cat.nome)
                  ? "bg-amber-400/20 text-amber-300"
                  : "bg-white/10 text-gray-300"
              }`}
          >
            {editingCategoria?.id === cat.id ? (
              <>
                <input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="bg-transparent border-b border-amber-400 outline-none text-white text-sm w-24"
                />
                <button
                  onClick={() => handleEditCategoria(cat)}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingCategoria(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggleCategoria(cat.nome)}
                  className="font-medium"
                >
                  {cat.nome}
                </button>
                <button
                  onClick={() => {
                    setEditingCategoria(cat);
                    setNovoNome(cat.nome);
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmarExclusao(cat)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Adicionar nova */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Nova categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleAddCategoria}
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 rounded-xl text-sm transition"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {/* 🧡 Modal de confirmação */}
      {categoriaParaExcluir && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-[90%] sm:w-[400px] shadow-xl text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Remover categoria?
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              A categoria <span className="text-amber-300 font-medium">"{categoriaParaExcluir.nome}"</span> pode estar vinculada a produtos. 
              Isso também a removerá dos produtos associados.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCategoriaParaExcluir(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCategoria}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriaManager;
