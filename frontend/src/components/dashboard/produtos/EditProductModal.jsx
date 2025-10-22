import { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, Trash } from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";

const EditProductModal = ({ produto, onClose, onSaved }) => {
  const { showNotification } = useNotification();
  const [novaCategoria, setNovaCategoria] = useState("");
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    nome: produto.nome || "",
    descricao: produto.descricao || "",
    precoBase: produto.precoBase ?? 0,
    imagemUrl: produto.imagemUrl || "",
    imagemFile: null,
    variacoes: produto.variacoes || [],
    categorias: produto.categorias || [],
  });

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

  const handleImageUpload = (file) => {
    if (!file) return;
    handleChange("imagemFile", file);
    const reader = new FileReader();
    reader.onloadend = () => handleChange("imagemUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addVariacao = () =>
    handleChange("variacoes", [
      ...formData.variacoes,
      { nome: "", preco: 0, estoque: 0 },
    ]);

  const removeVariacao = (index) => {
    const newVars = [...formData.variacoes];
    newVars.splice(index, 1);
    handleChange("variacoes", newVars);
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

  const handleAddCategoria = () => {
    const nome = novaCategoria.trim();
    if (!nome) return showNotification("Digite o nome da categoria.", "warning");
    if (formData.categorias.includes(nome))
      return showNotification("Essa categoria já foi adicionada.", "warning");

    handleChange("categorias", [...formData.categorias, nome]);

    if (!categoriasDisponiveis.some((c) => c.nome === nome)) {
      setCategoriasDisponiveis((prev) => [...prev, { id: null, nome }]);
    }

    setNovaCategoria("");
    showNotification("✅ Categoria adicionada!", "success");
  };

  const handleRemoveCategoria = (categoriaNome) => {
    handleChange(
      "categorias",
      formData.categorias.filter((c) => c !== categoriaNome)
    );
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      const produtoPayload = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoBase: formData.precoBase,
        estoque: formData.estoque ?? 0,
        variacoes: formData.variacoes,
        categorias: formData.categorias,
      };

      data.append(
        "produto",
        new Blob([JSON.stringify(produtoPayload)], { type: "application/json" })
      );

      // 🔹 Só envia imagem se o usuário selecionou uma nova
      if (formData.imagemFile) {
        data.append("imagem", formData.imagemFile);
      }

      const res = await axios.put(
        `${API_URL}/produtos/${produto.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSaved(res.data);
    } catch (err) {
      console.error(err);
      showNotification("❌ Não foi possível atualizar o produto", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 text-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Editar Produto</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Imagem */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Imagem</label>
            <div className="w-full h-40 rounded-xl mb-2 bg-gray-800 flex items-center justify-center overflow-hidden">
              {formData.imagemUrl ? (
                <img
                  src={formData.imagemUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Sem imagem</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="text-sm text-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              (Deixe vazio para manter a imagem atual)
            </p>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              rows={4}
            />
          </div>

          {/* Preço base */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Preço Base</label>
            <input
              type="number"
              value={formData.precoBase}
              onChange={(e) =>
                handleChange("precoBase", parseFloat(e.target.value) || 0)
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Variações */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-200">Variações</label>
              <button
                onClick={addVariacao}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500 text-black rounded hover:bg-emerald-400"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            {formData.variacoes.length > 0 ? (
              formData.variacoes.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 border border-white/10 p-3 rounded-lg mb-2"
                >
                  <input
                    type="text"
                    placeholder="Nome"
                    value={v.nome ?? ""}
                    onChange={(e) => {
                      const novas = [...formData.variacoes];
                      novas[i].nome = e.target.value;
                      handleChange("variacoes", novas);
                    }}
                    className="flex-1 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Preço"
                    value={v.preco ?? ""}
                    onChange={(e) => {
                      const novas = [...formData.variacoes];
                      novas[i].preco = parseFloat(e.target.value) || 0;
                      handleChange("variacoes", novas);
                    }}
                    className="w-24 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Estoque"
                    value={v.estoque ?? ""}
                    onChange={(e) => {
                      const novas = [...formData.variacoes];
                      novas[i].estoque = parseInt(e.target.value) || 0;
                      handleChange("variacoes", novas);
                    }}
                    className="w-20 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeVariacao(i)}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Sem variações</p>
            )}
          </div>

          {/* Categorias */}
<div>
  <label className="block text-sm mb-1 text-gray-200">Categorias</label>

  {/* Lista única de categorias */}
  <div className="flex flex-wrap gap-2 mb-3">
    {categoriasDisponiveis.map((cat) => {
      const isSelected = formData.categorias.includes(cat.nome);
      return (
        <button
          key={cat.id ?? cat.nome}
          type="button"
          onClick={() => toggleCategoria(cat.nome)}
          className={`px-3 py-1 rounded-full text-sm transition ${
            isSelected
              ? "bg-amber-400 text-black font-semibold"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          {cat.nome}
        </button>
      );
    })}
  </div>

  {/* Nova categoria */}
  <div className="flex gap-2">
    <input
      type="text"
      value={novaCategoria}
      onChange={(e) => setNovaCategoria(e.target.value)}
      placeholder="Nova categoria"
      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
    />
    <button
      type="button"
      onClick={handleAddCategoria}
      className="px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition flex items-center gap-1"
    >
      <Plus className="w-4 h-4" /> Adicionar
    </button>
  </div>
</div>

        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-amber-400 text-black hover:bg-amber-300"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
