// src/pages/admin/GerenciarProdutos.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { Package, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductForm from "./produtos/ProductForm";
import ProductList from "./produtos/ProductList";

const STORAGE_KEY = "filtrosGerenciarProdutos";

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // === 🔹 Carregar filtros persistidos ===
  const filtrosSalvos = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }, []);

  // === 🔹 Estados de Filtros com persistência ===
  const [search, setSearch] = useState(filtrosSalvos.search || "");
  const [filtroEstoque, setFiltroEstoque] = useState(filtrosSalvos.filtroEstoque || "todos");
  const [ordenacao, setOrdenacao] = useState(filtrosSalvos.ordenacao || "nome");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(filtrosSalvos.categoriaSelecionada || "");
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(filtrosSalvos.variacaoSelecionada || "");

  const [todasCategorias, setTodasCategorias] = useState([]);
  const [todasVariacoes, setTodasVariacoes] = useState([]);

  // === 🔹 Paginação ===
  const [paginaAtual, setPaginaAtual] = useState(filtrosSalvos.paginaAtual || 1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const itensPorPagina = 20;

  const containerRef = useRef(null);
  const listaRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // === 🔹 Persistir filtros no sessionStorage ===
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        search,
        filtroEstoque,
        ordenacao,
        categoriaSelecionada,
        variacaoSelecionada,
        paginaAtual,
      })
    );
  }, [search, filtroEstoque, ordenacao, categoriaSelecionada, variacaoSelecionada, paginaAtual]);

  // === 🔹 Carregar produtos do backend ===
  const carregarProdutos = async (pagina = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: (pagina - 1).toString(),
        size: itensPorPagina.toString(),
      });

      if (search.trim()) params.append("search", search.trim());
      if (categoriaSelecionada) params.append("categoria", categoriaSelecionada);

      const res = await fetch(`${API_URL}/produtos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setProdutos(data.produtos || []);
      setPaginaAtual(data.paginaAtual + 1);
      setTotalPaginas(data.totalPaginas || 1);
      setTotalProdutos(data.totalProdutos || 0);

      // Atualiza listas únicas
      const categoriasSet = new Set();
      const variacoesSet = new Set();
      data.produtos?.forEach((p) => {
        p.categorias?.forEach((c) => categoriasSet.add(c));
        p.variacoes?.forEach((v) => variacoesSet.add(v.nome));
      });

      setTodasCategorias([...categoriasSet]);
      setTodasVariacoes([...variacoesSet]);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  carregarProdutos(paginaAtual || 1);
}, [search, categoriaSelecionada, paginaAtual]);


  // === 🔹 Funções auxiliares ===
  const getEstoqueTotal = (produto) =>
    produto.variacoes?.length
      ? produto.variacoes.reduce((total, v) => total + (v.estoque || 0), 0)
      : produto.estoque || 0;

  const getPrecoMinimo = (produto) => {
    if (produto.variacoes?.length) {
      const precos = produto.variacoes
        .map((v) => v.preco)
        .filter((p) => typeof p === "number" && p > 0);
      return precos.length ? Math.min(...precos) : produto.precoBase;
    }
    return produto.precoBase;
  };

  // === 🔹 Filtros e ordenação locais ===
  const produtosFiltrados = useMemo(() => {
    let lista = [...produtos];

    if (filtroEstoque === "disponivel")
      lista = lista.filter((p) => getEstoqueTotal(p) > 0);
    else if (filtroEstoque === "esgotado")
      lista = lista.filter((p) => getEstoqueTotal(p) === 0);

    if (variacaoSelecionada)
      lista = lista.filter((p) =>
        p.variacoes?.some((v) => v.nome === variacaoSelecionada)
      );

    lista.sort((a, b) => {
      switch (ordenacao) {
        case "precoMenor":
          return getPrecoMinimo(a) - getPrecoMinimo(b);
        case "precoMaior":
          return getPrecoMinimo(b) - getPrecoMinimo(a);
        case "estoque":
          return getEstoqueTotal(b) - getEstoqueTotal(a);
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

    return lista;
  }, [produtos, filtroEstoque, variacaoSelecionada, ordenacao]);

  const filtrosAtivos = filtroEstoque !== "todos" || variacaoSelecionada;
  const produtosPaginados = useMemo(() => produtos, [produtos]);
  const totalPaginasFiltradas = filtrosAtivos
    ? Math.ceil(produtosFiltrados.length / itensPorPagina)
    : totalPaginas;

  const totalExibido = filtrosAtivos ? produtosFiltrados.length : totalProdutos;

  const handleTrocarPagina = async (novaPagina) => {
    if (novaPagina < 1 || novaPagina > totalPaginasFiltradas) return;
    setPaginaAtual(novaPagina);
    await carregarProdutos(novaPagina);

    if (listaRef.current) {
      const y =
        listaRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleProdutoAtualizado = (produtoAtualizado) => {
  setProdutos((prev) =>
    prev.map((p) => (p.id === produtoAtualizado.id ? produtoAtualizado : p))
  );
  setProdutoEditando(null);
};

  return (
    <div ref={containerRef} className="p-6 text-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-amber-400">
        <Package className="w-6 h-6" /> Produtos
      </h2>

      <ProductForm
      produtoEditando={produtoEditando}
      onSaved={(novoProduto) => {
        if (novoProduto?.id) handleProdutoAtualizado(novoProduto);
        else carregarProdutos(paginaAtual);
      }}
      onCancel={() => setProdutoEditando(null)}
    />

      <div className="border border-white/10 rounded-xl p-4 mb-8 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center bg-white/10 px-3 rounded-lg flex-1"
          >
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou variação..."
              className="bg-transparent flex-1 p-2 outline-none text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPaginaAtual(1);
              }}
            />
          </form>

          <select
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400"
            value={filtroEstoque}
            onChange={(e) => {
              setFiltroEstoque(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="todos">Todos</option>
            <option value="disponivel">Disponíveis</option>
            <option value="esgotado">Esgotados</option>
          </select>

          <select
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400"
            value={categoriaSelecionada}
            onChange={(e) => {
              setCategoriaSelecionada(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="">Todas as categorias</option>
            {todasCategorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400"
            value={variacaoSelecionada}
            onChange={(e) => {
              setVariacaoSelecionada(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="">Todas as variações</option>
            {todasVariacoes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400"
            value={ordenacao}
            onChange={(e) => {
              setOrdenacao(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="precoMenor">Menor Preço</option>
            <option value="precoMaior">Maior Preço</option>
            <option value="estoque">Maior Estoque</option>
          </select>
        </div>
      </div>

      {/* 🔹 Lista de produtos */}
      <div ref={listaRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={paginaAtual + (filtrosAtivos ? "-local" : "-backend")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <ProductList
              produtos={produtosPaginados}
              onChange={carregarProdutos}
              onEdit={setProdutoEditando}
              onProdutoAtualizado={handleProdutoAtualizado}
              loading={loading}
            />

          </motion.div>
        </AnimatePresence>
      </div>

      {/* 🔹 Paginação */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
        <p>
          Exibindo{" "}
          <span className="text-gray-400 font-medium">
            {produtosPaginados.length}
          </span>{" "}
          de{" "}
          <span className="text-gray-400 font-medium">{totalExibido}</span>{" "}
          produtos
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTrocarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className={`px-3 py-1 rounded-lg border text-white bg-gray-800 border-white/30 ${
              paginaAtual === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-white/30"
            }`}
          >
            Anterior
          </button>
          <span className="text-gray-300">
            Página {paginaAtual} de {totalPaginasFiltradas || 1}
          </span>
          <button
            onClick={() => handleTrocarPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginasFiltradas}
            className={`px-3 py-1 rounded-lg border text-white bg-gray-800 border-white/30 ${
              paginaAtual === totalPaginasFiltradas
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-white/10"
            }`}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerenciarProdutos;
