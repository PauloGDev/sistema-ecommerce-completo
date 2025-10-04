// src/components/dashboard/produtos/EditProductModal.jsx
import { useState } from "react";
import { X, Plus, Trash } from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";

const EditProductModal = ({ produto, onClose, onSaved }) => {
  const { showNotification } = useNotification();
  const [novaCategoria, setNovaCategoria] = useState("");


const [formData, setFormData] = useState({
  nome: produto.nome || "",
  descricao: produto.descricao || "",
  precoBase: produto.precoBase ?? 0,
  imagemUrl: produto.imagemUrl || "",
  imagemFile: null, // ✅ novo campo
  variacoes: produto.variacoes || [],
  categorias: produto.categorias || [],
});

// Upload de imagem (preview + arquivo real)
const handleImageUpload = (file) => {
  if (!file) return;
  handleChange("imagemFile", file); // ✅ guarda o arquivo real

  const reader = new FileReader();
  reader.onloadend = () => {
    handleChange("imagemUrl", reader.result); // preview
  };
  reader.readAsDataURL(file);
};

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addVariacao = () => {
    handleChange("variacoes", [
      ...formData.variacoes,
      { nome: "", preco: 0, estoque: 0 },
    ]);
  };

  const removeVariacao = (index) => {
    const newVars = [...formData.variacoes];
    newVars.splice(index, 1);
    handleChange("variacoes", newVars);
  };

// Salvar
const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");
    const data = new FormData();

    // Cria objeto JSON com todos os campos
    const produtoPayload = {
      nome: formData.nome,
      descricao: formData.descricao,
      precoBase: formData.precoBase,
      estoque: formData.estoque ?? 0,
      variacoes: formData.variacoes,
      categorias: formData.categorias,
    };

    // Adiciona JSON como Blob
    data.append(
      "produto",
      new Blob([JSON.stringify(produtoPayload)], { type: "application/json" })
    );

    // Só envia imagem se usuário trocou
    if (formData.imagemFile) {
      data.append("imagem", formData.imagemFile);
    }

    const res = await fetch(`http://localhost:8080/api/produtos/${produto.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ não setar Content-Type
      },
      body: data,
    });

    if (!res.ok) throw new Error("Erro ao atualizar produto");

    onSaved();
  } catch (err) {
    console.error(err);
    showNotification("❌ Não foi possível atualizar o produto", "error");
  }
};



  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 text-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Editar Produto</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">
              Imagem
            </label>
            <div className="w-full h-40 rounded-xl mb-2 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
              {formData.imagemUrl ? (
                <img
                  src={formData.imagemUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">Sem imagem</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="text-sm text-gray-300"
              />
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">
              Nome
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
              rows={4}
            />
          </div>

          {/* Preço base */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">
              Preço Base
            </label>
            <input
              type="number"
              value={formData.precoBase ?? ""}
              onChange={(e) =>
                handleChange("precoBase", e.target.value === "" ? 0 : parseFloat(e.target.value))
              }
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Variações */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-200">
                Variações
              </label>
              <button
                type="button"
                onClick={addVariacao}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-500 text-black hover:bg-emerald-400 transition"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {formData.variacoes.length > 0 ? (
                formData.variacoes.map((v, i) => (
                  <div
                    key={v.id ?? i}
                    className="flex items-center gap-2 border border-white/6 p-3 rounded-lg"
                  >
                    <input
                      type="text"
                      value={v.nome ?? ""}
                      onChange={(e) => {
                        const newVars = [...formData.variacoes];
                        newVars[i] = { ...newVars[i], nome: e.target.value };
                        handleChange("variacoes", newVars);
                      }}
                      className="flex-1 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm placeholder:text-gray-400"
                      placeholder="Nome da variação"
                    />
                    <input
                      type="number"
                      value={v.preco ?? ""}
                      onChange={(e) => {
                        const newVars = [...formData.variacoes];
                        newVars[i] = {
                          ...newVars[i],
                          preco: e.target.value === "" ? 0 : parseFloat(e.target.value),
                        };
                        handleChange("variacoes", newVars);
                      }}
                      className="w-28 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm placeholder:text-gray-400"
                      placeholder="Preço"
                    />
                    <input
                      type="number"
                      value={v.estoque ?? ""}
                      onChange={(e) => {
                        const newVars = [...formData.variacoes];
                        newVars[i] = {
                          ...newVars[i],
                          estoque: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                        };
                        handleChange("variacoes", newVars);
                      }}
                      className="w-24 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm placeholder:text-gray-400"
                      placeholder="Estoque"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariacao(i)}
                      className="p-2 rounded bg-red-500/80 hover:bg-red-500 text-white transition"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Sem variações</p>
              )}
            </div>
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
  {formData.categorias.map((cat, i) => (
    <span
      key={i}
      className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-lg text-sm"
    >
      {cat}
      <button
        type="button"
        onClick={() => {
          const novas = formData.categorias.filter((_, idx) => idx !== i);
          handleChange("categorias", novas);
        }}
        className="text-red-400 hover:text-red-200"
      >
        <Trash className="w-3 h-3" />
      </button>
    </span>
  ))}
</div>

<div className="flex gap-2">
  <input
    type="text"
    value={novaCategoria}
    onChange={(e) => setNovaCategoria(e.target.value)}
    placeholder="Adicionar categoria"
    className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
  />
  <button
    type="button"
    onClick={() => {
      if (novaCategoria.trim() !== "") {
        handleChange("categorias", [...formData.categorias, novaCategoria.trim()]);
        setNovaCategoria(""); // limpa campo
      }
    }}
    className="px-3 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition"
  >
    Enviar
  </button>
</div>


        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-amber-400 text-black hover:bg-amber-300 transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
