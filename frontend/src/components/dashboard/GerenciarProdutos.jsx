// GerenciarProdutos.jsx
import { useEffect, useState, useMemo } from "react";
import { Package, Search } from "lucide-react";
import ProductForm from "./produtos/ProductForm";
import ProductList from "./produtos/ProductList";

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Produto em edição
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filtroEstoque, setFiltroEstoque] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");

  const carregarProdutos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProdutos(data);
      console.log(data)
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Filtros + ordenação
  const produtosFiltrados = useMemo(() => {
    let lista = [...produtos];

    if (search) {
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(search.toLowerCase()) ||
          (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filtroEstoque === "disponivel") {
      lista = lista.filter((p) => p.estoque > 0);
    } else if (filtroEstoque === "esgotado") {
      lista = lista.filter((p) => p.estoque === 0);
    }

    lista.sort((a, b) => {
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome);
      if (ordenacao === "preco") return a.preco - b.preco;
      if (ordenacao === "estoque") return a.estoque - b.estoque;
      return 0;
    });

    return lista;
  }, [produtos, search, filtroEstoque, ordenacao]);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-amber-400" /> Produtos
      </h2>

      {/* Formulário recebe o produto editando */}
      <ProductForm
        produtoEditando={produtoEditando}
        onSaved={() => {
          carregarProdutos();
          setProdutoEditando(null); // 🔹 limpa edição
        }}
        onCancel={() => setProdutoEditando(null)}
      />

      {/* Barra de ferramentas */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center bg-white/10 px-3 rounded-lg w-full sm:w-1/3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            className="bg-transparent flex-1 p-2 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 w-full sm:w-auto"
          value={filtroEstoque}
          onChange={(e) => setFiltroEstoque(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="disponivel">Disponíveis</option>
          <option value="esgotado">Esgotados</option>
        </select>

        <select
          className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 w-full sm:w-auto"
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value)}
        >
          <option value="nome">Ordenar por Nome</option>
          <option value="preco">Ordenar por Preço</option>
          <option value="estoque">Ordenar por Estoque</option>
        </select>
      </div>

      <ProductList
        produtos={produtosFiltrados}
        onChange={carregarProdutos}
        onEdit={(produto) => setProdutoEditando(produto)} // 🔹 passa produto
        loading={loading}
      />
    </div>
  );
};

export default GerenciarProdutos;
