// src/components/dashboard/produtos/ProductForm.jsx
import { useState } from "react";
import { PlusCircle, Save, Edit3, Loader2, Plus, Trash } from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";

const ProductForm = ({ produtoInicial = null, onSaved }) => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    id: produtoInicial?.id || null,
    nome: produtoInicial?.nome || "",
    descricao: produtoInicial?.descricao || "",
    precoBase: produtoInicial?.precoBase ?? 0,
    estoque: produtoInicial?.estoque ?? 0,
    imagemUrl: produtoInicial?.imagemUrl || "",
    imagemFile: null,
    variacoes: produtoInicial?.variacoes || [],
    categorias: produtoInicial?.categorias || [],
  });

  const [loading, setLoading] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");


  // helpers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    handleChange("imagemFile", file);

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("imagemUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addVariacao = () => {
    handleChange("variacoes", [
      ...formData.variacoes,
      { nome: "", preco: 0, estoque: 0 },
    ]);
  };

  const removeVariacao = (index) => {
    const novas = [...formData.variacoes];
    novas.splice(index, 1);
    handleChange("variacoes", novas);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: "",
      descricao: "",
      precoBase: 0,
      estoque: 0,
      imagemUrl: "",
      imagemFile: null,
      variacoes: [],
      categorias: [],
    });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      const produtoPayload = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoBase: formData.precoBase,
        estoque: formData.estoque,
        variacoes: formData.variacoes,
        categorias: formData.categorias,
      };

      data.append(
        "produto",
        new Blob([JSON.stringify(produtoPayload)], { type: "application/json" })
      );

      if (formData.imagemFile) {
        data.append("imagem", formData.imagemFile);
      }

      const url = formData.id
        ? `http://localhost:8080/api/produtos/${formData.id}`
        : "http://localhost:8080/api/produtos";
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

      {/* imagem */}
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

      {/* nome / preço / estoque */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Produto</label>
        <input
          type="text"
          placeholder="Nome *"
          className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          required
        />

        </div>
        <div>
        <label className="block text-sm font-medium mb-1">Preço Base</label>
        <input
          type="number"
          step="0.01"
          placeholder="Preço Base (R$) *"
          className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
          value={formData.precoBase}
          onChange={(e) =>
            handleChange(
              "precoBase",
              parseFloat(e.target.value)
            )
          }
          required
        />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estoque Disponível</label>
        <input
          type="number"
          placeholder="Estoque *"
          className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
          value={formData.estoque}
          onChange={(e) =>
            handleChange(
              "estoque",
              parseInt(e.target.value, 10)
            )
          }
          required
        />
        </div>
      </div>

      {/* descrição */}
      <textarea
        rows="3"
        placeholder="Descrição"
        className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
        value={formData.descricao}
        onChange={(e) => handleChange("descricao", e.target.value)}
      />

      {/* variações */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Variações</label>
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
                key={i}
                className="flex items-center gap-2 border border-white/6 p-3 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Variação</label>
                  <input
                    type="text"
                    value={v.nome}
                    onChange={(e) => {
                      const novas = [...formData.variacoes];
                      novas[i] = { ...novas[i], nome: e.target.value };
                      handleChange("variacoes", novas);
                    }}
                    className="flex-1 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                    placeholder="Nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preço</label>
                <input
                  type="number"
                  value={v.preco}
                  onChange={(e) => {
                    const novas = [...formData.variacoes];
                    novas[i] = {
                      ...novas[i],
                      preco:
                        e.target.value === "" ? 0 : parseFloat(e.target.value),
                    };
                    handleChange("variacoes", novas);
                  }}
                  className="w-28 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                  placeholder="Preço"
                />
                </div>
                  
                  <div>
                  <label className="block text-sm font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={v.estoque}
                    onChange={(e) => {
                      const novas = [...formData.variacoes];
                      novas[i] = {
                        ...novas[i],
                        estoque:
                          e.target.value === ""
                            ? 0
                            : parseInt(e.target.value, 10),
                      };
                      handleChange("variacoes", novas);
                    }}
                    className="w-24 bg-transparent border border-white/10 text-white rounded px-2 py-1 text-sm"
                    placeholder="Estoque"
                  />
                </div>
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

      {/* categorias */}
      <div>
        <label className="block text-sm font-medium">Categorias</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.categorias.map((cat, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-lg text-sm"
            >
              {cat}
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    "categorias",
                    formData.categorias.filter((_, idx) => idx !== i)
                  )
                }
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

      {/* botões */}
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
