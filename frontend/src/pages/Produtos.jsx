import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import TitleB from "../components/TitleB";
import HeroProdutos from "../components/Produtos/HeroProdutos";
import PageTitle from "../context/PageTitle";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNotification } from "../context/NotificationContext";
import { Loader2, XCircle } from "lucide-react";
import ProdutoCard from "./Produtos/ProdutoCard";
import Paginacao from "./Produtos/Paginacao";
import FiltrosProdutos from "./Produtos/FiltrosProdutos";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08 } },
  exit: { opacity: 0 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

// 🔹 Debounce simples
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// 🔹 Scroll suave até a seção
const scrollToSection = (ref, offset = 160) => {
  if (!ref.current) return;
  const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
};

const Produtos = () => {
    const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { adicionarAoCarrinho } = useCarrinho();
  const sectionRef = useRef(null);

  const params = new URLSearchParams(location.search);
  const categoriaInicial = params.get("categoria");

  const [produtos, setProdutos] = useState([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState(
    categoriaInicial ? [categoriaInicial] : []
  );

  const [pagina, setPagina] = useState(1);
  const [produtosPorPagina, setProdutosPorPagina] = useState(6);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);

  const [loadingProdutos, setLoadingProdutos] = useState(true);

const [filtros, setFiltros] = useState({
  search: "",
  ordenarPor: "maisVendidos",
});


  const cancelToken = useRef(null);

  const fetchCategorias = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/categorias`);
      setCategoriasDisponiveis(res.data.map((c) => c.nome));
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
      showNotification("Erro ao carregar categorias.", "error");
    }
  }, [showNotification]);

  const fetchProdutos = useCallback(
  debounce(async () => {
    try {
      setLoadingProdutos(true);

      if (cancelToken.current) cancelToken.current.cancel("Nova busca iniciada");
      cancelToken.current = axios.CancelToken.source();

      const params = {
        page: pagina - 1,
        size: produtosPorPagina,
        ...(categoriasSelecionadas.length > 0 && {
          categoria: categoriasSelecionadas.join(","),
        }),
        ...(filtros.search && { search: filtros.search }),
        ...(filtros.ordenarPor && { ordenarPor: filtros.ordenarPor }),
      };

      const res = await axios.get(`${API_URL}/produtos/listarFiltroShop`, {
        params,
        cancelToken: cancelToken.current.token,
      });

      const data = res.data;
      setProdutos(data.produtos || []);
      setTotalPaginas(data.totalPaginas || 1);
      setTotalProdutos(data.totalProdutos || 0);
      setLoadingProdutos(false)
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error("Erro ao buscar produtos:", err);
        showNotification("Erro ao carregar produtos.", "error");
      }
    }
  }, 400),
  [pagina, categoriasSelecionadas, produtosPorPagina, filtros]
);


  // 🔹 Efeitos iniciais
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  useEffect(() => {
    fetchProdutos();

  }, [fetchProdutos]);

  // 🔹 Ajusta produtos por página conforme tela
  useEffect(() => {
    const updatePerPage = () =>
      setProdutosPorPagina(window.innerWidth < 768 ? 6 : 15);
    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  // 🔹 Trocar de página e scroll
  const mudarPagina = (novaPagina) => {
    setPagina(novaPagina);
    requestAnimationFrame(() => scrollToSection(sectionRef));
  };

  // 🔹 Adicionar ao carrinho
  const handleAdicionar = async (produtoId, variacaoId = null, quantidade = 1) => {
    try {
      await adicionarAoCarrinho(produtoId, variacaoId, quantidade);
      showNotification("Produto adicionado ao carrinho!", "success");
    } catch (err) {
      console.error("Erro:", err);
      showNotification("Não foi possível adicionar o produto.", "error");
    }
  };

  // 🔹 Filtros
  const toggleCategoria = (cat) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPagina(1);
  };

  const limparCategorias = () => {
    setCategoriasSelecionadas([]);
    setPagina(1);
  };

  return (
    <div>
      <PageTitle title="Produtos | Sublime Perfumes Fracionados" />
      <HeroProdutos />

      <div ref={sectionRef} className="py-28 w-full max-w-6xl mx-auto p-6">

        {/* 🔹 Filtros de busca, preço e categorias */}
        <FiltrosProdutos
          categoriasDisponiveis={categoriasDisponiveis}
          categoriasSelecionadas={categoriasSelecionadas}
          toggleCategoria={toggleCategoria}
          limpar={limparCategorias}
          onFiltroChange={setFiltros} // 🔹 adicionamos isso
        />

        {/* 🔹 Lista de produtos */}
        <AnimatePresence mode="wait">
        {loadingProdutos ? (
          <motion.div
            key="skeletons"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center"
          >
            {Array.from({ length: produtosPorPagina }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative w-full h-72 rounded-2xl overflow-hidden bg-gray-800/40 backdrop-blur-md border border-white/10 shadow-lg"
              >
                {/* efeito de brilho animado */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />

                {/* layout simulado do card */}
                <div className="p-4 h-full flex flex-col justify-between">
                  <div className="h-36 w-full bg-white/10 rounded-lg mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : produtos.length === 0 ? (
          <motion.div
            key="sem-produtos"
            className="text-center text-gray-300 py-10 flex items-center justify-center gap-2"
          >
            <XCircle className="w-6 h-6" />
            Nenhum produto encontrado.
          </motion.div>
        ) : (
          <motion.div
            key={`${categoriasSelecionadas.join("-")}-${pagina}`}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center"
          >
            {produtos.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                variants={cardVariants}
                onClick={() => navigate(`/produtos/${produto.slug}`)}
                onAdicionar={handleAdicionar}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>



        {/* 🔹 Paginação */}
        <Paginacao
          pagina={pagina}
          totalPaginas={totalPaginas}
          mudarPagina={mudarPagina}
        />

        <p className="text-center text-gray-400 text-sm mt-4">
          Exibindo página {pagina} de {totalPaginas} ({totalProdutos} produtos)
        </p>
      </div>
    </div>
  );
};

export default Produtos;
