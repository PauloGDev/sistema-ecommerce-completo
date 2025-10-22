import { useState, useEffect } from "react";
import { PlusCircle, Save, Edit3, Loader2, Plus, Trash, Pencil } from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";
import CategoriaManager from "./CategoriaManager";

const ProductForm = ({ produtoInicial = null, onSaved }) => {
  const { showNotification } = useNotification();

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
      const API_URL = import.meta.env.VITE_API_URL;


  const [formData, setFormData] = useState({
    id: produtoInicial?.id || null,
    nome: produtoInicial?.nome || "",
    descricao: produtoInicial?.descricao || "",
    precoBase: produtoInicial?.precoBase ?? "",
    estoque: produtoInicial?.estoque ?? "",
    imagemUrl: produtoInicial?.imagemUrl || "",
    imagemFile: null,
    variacoes: produtoInicial?.variacoes || [],
    categorias: produtoInicial?.categorias || [],
  });

  const [temVariacoes, setTemVariacoes] = useState(
    produtoInicial?.variacoes?.length > 0 || false
  );

  // 🔹 Carrega categorias existentes
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/categorias`);
        const data = await res.json();
        setCategoriasDisponiveis(data); // data = [{id, nome}]
      } catch {
        console.error("Erro ao carregar categorias");
      }
    };
    fetchCategorias();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    handleChange("imagemFile", file);
    const reader = new FileReader();
    reader.onloadend = () => handleChange("imagemUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const addVariacao = () => {
    handleChange("variacoes", [
      ...formData.variacoes,
      { nome: "", preco: "", estoque: "" },
    ]);
  };

  const removeVariacao = (index) => {
    const novas = [...formData.variacoes];
    novas.splice(index, 1);
    handleChange("variacoes", novas);
  };

  const toggleCategoria = (categoriaNome) => {
    const atual = formData.categorias.includes(categoriaNome);
    handleChange(
      "categorias",
      atual
        ? formData.categorias.filter((c) => c !== categoriaNome)
        : [...formData.categorias, categoriaNome]
    );
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
      setCategoriasDisponiveis((prev) => [...prev, nova]);
      setNovaCategoria("");
      showNotification("✅ Categoria criada com sucesso!", "success");
    } catch {
      showNotification("❌ Erro ao criar categoria", "error");
    }
  };

  const handleEditCategoria = async (cat) => {
    if (!novaCategoriaNome.trim())
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
          body: JSON.stringify({ nome: novaCategoriaNome }),
        }
      );

      if (!res.ok) throw new Error("Erro ao editar categoria");

      setCategoriasDisponiveis((prev) =>
        prev.map((c) =>
          c.id === cat.id ? { ...c, nome: novaCategoriaNome } : c
        )
      );

      showNotification("✏️ Categoria atualizada com sucesso!", "success");
      setEditingCategoria(null);
      setNovaCategoriaNome("");
    } catch {
      showNotification("❌ Erro ao editar categoria", "error");
    }
  };

  const handleDeleteCategoria = async (cat) => {
    if (!window.confirm(`Excluir categoria "${cat.nome}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/categorias/${cat.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Erro ao excluir categoria");

      setCategoriasDisponiveis((prev) =>
        prev.filter((c) => c.id !== cat.id)
      );
      handleChange(
        "categorias",
        formData.categorias.filter((c) => c !== cat.nome)
      );
      showNotification("🗑️ Categoria excluída!", "success");
    } catch {
      showNotification("❌ Erro ao excluir categoria", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: "",
      descricao: "",
      precoBase: "",
      estoque: "",
      imagemUrl: "",
      imagemFile: null,
      variacoes: [],
      categorias: [],
    });
    setTemVariacoes(false);
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.nome.trim()) newErrors.push("O nome do produto é obrigatório.");
    if (!formData.descricao.trim())
      newErrors.push("A descrição do produto é obrigatória.");
    if (!formData.imagemUrl && !formData.imagemFile)
      newErrors.push("A imagem do produto é obrigatória.");
    if (formData.categorias.length === 0)
      newErrors.push("Selecione pelo menos uma categoria.");

    if (temVariacoes) {
      if (formData.variacoes.length < 2)
        newErrors.push("Adicione pelo menos duas variações.");
      formData.variacoes.forEach((v, i) => {
        if (!v.nome || v.preco === "" || v.estoque === "")
          newErrors.push(`Preencha todos os campos da variação ${i + 1}.`);
      });
    } else {
      if (formData.precoBase === "" || formData.estoque === "")
        newErrors.push("Preço e estoque são obrigatórios para produtos simples.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      const produtoPayload = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoBase: temVariacoes ? null : parseFloat(formData.precoBase) || 0,
        estoque: temVariacoes ? null : parseInt(formData.estoque, 10) || 0,
        variacoes: temVariacoes
          ? formData.variacoes.map((v) => ({
              ...v,
              preco: parseFloat(v.preco) || 0,
              estoque: parseInt(v.estoque, 10) || 0,
            }))
          : [],
        categorias: formData.categorias,
      };

      data.append(
        "produto",
        new Blob([JSON.stringify(produtoPayload)], { type: "application/json" })
      );
      if (formData.imagemFile) data.append("imagem", formData.imagemFile);

      const url = formData.id
        ? `${API_URL}produtos/${formData.id}`
        : `${API_URL}/produtos`;
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) throw new Error("Erro ao salvar produto");

      showNotification("✅ Produto salvo com sucesso!", "success");
      resetForm();
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      showNotification("❌ Erro ao salvar produto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-6 mb-10 space-y-6 max-w-3xl"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {formData.id ? (
          <>
            <Edit3 className="w-6 h-6 text-amber-400" /> Editar Produto
          </>
        ) : (
          <>
            <PlusCircle className="w-6 h-6 text-amber-400" /> Criar Novo Produto
          </>
        )}
      </h2>

      {/* Exibe erros */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm space-y-1">
          {errors.map((e, i) => (
            <p key={i}>• {e}</p>
          ))}
        </div>
      )}

      {/* Imagem */}
      <div>
        <label className="block text-sm font-medium mb-1">Imagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          className="w-full rounded-xl p-2 bg-white/5 border border-white/10 file:bg-amber-400 file:text-black"
          required={!formData.id}
        />
        {formData.imagemUrl && (
          <img
            src={formData.imagemUrl}
            alt="preview"
            className="mt-3 w-32 h-32 object-cover rounded-xl border border-white/10"
          />
        )}
      </div>

      {/* Checkbox de variações */}
      <div>
        <div className="flex items-center gap-3">
          <input
            id="temVariacoes"
            type="checkbox"
            checked={temVariacoes}
            onChange={(e) => setTemVariacoes(e.target.checked)}
            className="w-5 h-5 accent-amber-400"
          />
          <label
            htmlFor="temVariacoes"
            className="text-sm font-medium text-white/90 cursor-pointer"
          >
            Produto possui variações
          </label>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          {temVariacoes
            ? "Produtos com variações não precisam de preço ou estoque base (mínimo 2 variações)."
            : "Desmarque para definir um preço e estoque únicos."}
        </p>
      </div>

      {/* Nome / Preço / Estoque */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Produto</label>
          <input
            type="text"
            placeholder="Nome *"
            className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
          />
        </div>

        {!temVariacoes && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Preço Base</label>
              <input
                type="number"
                step="0.01"
                placeholder="Preço Base (R$)"
                className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
                value={formData.precoBase}
                onChange={(e) => handleChange("precoBase", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Estoque Disponível
              </label>
              <input
                type="number"
                placeholder="Estoque *"
                className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
                value={formData.estoque}
                onChange={(e) => handleChange("estoque", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* Descrição */}
      <textarea
        rows="3"
        placeholder="Descrição"
        className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
        value={formData.descricao}
        onChange={(e) => handleChange("descricao", e.target.value)}
      />

       <CategoriaManager
        categoriasSelecionadas={formData.categorias}
        onChange={(cats) => setFormData((prev) => ({ ...prev, categorias: cats }))}
      />

      {/* Variações */}
      {temVariacoes && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Adicionar Variações</label>
            <button
              type="button"
              onClick={addVariacao}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-2 rounded-xl text-sm transition"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {formData.variacoes.map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border border-white/6 p-3 rounded-lg"
              >
                <input
                  type="text"
                  value={v.nome}
                  placeholder="Nome"
                  className="flex-1 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    const novas = [...formData.variacoes];
                    novas[i].nome = e.target.value;
                    handleChange("variacoes", novas);
                  }}
                />
                <input
                  type="number"
                  value={v.preco}
                  placeholder="Preço"
                  className="w-28 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    const novas = [...formData.variacoes];
                    novas[i].preco = e.target.value;
                    handleChange("variacoes", novas);
                  }}
                />
                <input
                  type="number"
                  value={v.estoque}
                  placeholder="Estoque"
                  className="w-24 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    const novas = [...formData.variacoes];
                    novas[i].estoque = e.target.value;
                    handleChange("variacoes", novas);
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeVariacao(i)}
                  className="p-2 rounded bg-red-500/80 hover:bg-red-500 text-white transition"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-amber-400 text-black font-semibold py-3 rounded-xl hover:bg-amber-300 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Salvando...
            </>
          ) : formData.id ? (
            <>
              <Save className="w-5 h-5" /> Atualizar Produto
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" /> Cadastrar Produto
            </>
          )}
        </button>

        {formData.id && (
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
