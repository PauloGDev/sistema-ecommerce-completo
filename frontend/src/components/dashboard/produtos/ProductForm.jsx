import { useState } from "react";
import { PlusCircle, Save, Edit3, Loader2 } from "lucide-react";

const ProductForm = ({ onSaved }) => {
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setIdEditando(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setEstoque("");
    setImagem(null);
    setImagemPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("preco", preco);
      formData.append("estoque", estoque);
      if (imagem) formData.append("imagem", imagem);

      const url = idEditando
        ? `http://localhost:8080/api/produtos/${idEditando}`
        : "http://localhost:8080/api/produtos";

      const method = idEditando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao salvar produto");

      resetForm();
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar:", err);
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
        {idEditando ? (
          <>
            <Edit3 className="w-6 h-6 text-amber-400" /> Editar Produto
          </>
        ) : (
          <>
            <PlusCircle className="w-6 h-6 text-amber-400" /> Criar Novo Produto
          </>
        )}
      </h2>

      <div className="grid sm:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder="Nome *"
          className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Preço (R$) *"
          className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Estoque *"
          className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}
          required
        />
        <div>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl p-2 bg-white/5 border border-white/10 file:bg-amber-400 file:text-black"
            onChange={(e) => {
              setImagem(e.target.files[0]);
              setImagemPreview(URL.createObjectURL(e.target.files[0]));
            }}
            required={!idEditando}
          />
          {imagemPreview && (
            <img
              src={imagemPreview}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover rounded-xl border border-white/10"
            />
          )}
        </div>
      </div>

      <textarea
        rows="3"
        placeholder="Descrição"
        className="w-full rounded-xl p-3 bg-white/5 border border-white/10 outline-none"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

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
          ) : idEditando ? (
            <>
              <Save className="w-5 h-5" /> Atualizar Produto
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" /> Cadastrar Produto
            </>
          )}
        </button>
        {idEditando && (
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
