import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TitleB from "../components/TitleB";
import HeroProdutos from "../components/Produtos/HeroProdutos";
import PageTitle from "../context/PageTitle";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNotification } from "../context/NotificationContext";
import { Loader2, XCircle } from "lucide-react";

// 🔹 Componentes externos
import ProdutoCard from "./Produtos/ProdutoCard";
import Paginacao from "./Produtos/Paginacao";
import FiltrosProdutos from "./Produtos/FiltrosProdutos";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0 },
};
const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

const categoriasDisponiveis = ["Masculino", "Feminino", "Árabe"];

const Produtos = () => {
  const navigate = useNavigate();
  const irParaProduto = (slug) => navigate(`/produtos/${slug}`);

  const { showNotification } = useNotification();
  const { adicionarAoCarrinho } = useCarrinho();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoriaInicial = params.get("categoria");

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState(
    categoriaInicial ? [categoriaInicial] : []
  );
  const [modoFiltro, setModoFiltro] = useState("AND");
  const [pagina, setPagina] = useState(1);
  const [produtosPorPagina, setProdutosPorPagina] = useState(6);

  const sectionRef = useRef(null);

  // 🔹 Adicionar ao carrinho
  const handleAdicionar = async (produtoId) => {
    try {
      await adicionarAoCarrinho(produtoId, 1);
      showNotification("✅ Produto adicionado ao carrinho!", "success");
    } catch (err) {
      console.error("Erro:", err);
      showNotification("❌ Não foi possível adicionar o produto.", "error");
    }
  };

  // 🔹 Buscar produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/produtos");
        const data = await res.json();
        setProdutos(data);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  // 🔹 Responsividade
  useEffect(() => {
    const atualizarProdutosPorPagina = () => {
      setProdutosPorPagina(window.innerWidth < 768 ? 3 : 6);
    };
    atualizarProdutosPorPagina();
    window.addEventListener("resize", atualizarProdutosPorPagina);
    return () =>
      window.removeEventListener("resize", atualizarProdutosPorPagina);
  }, []);

  // 🔹 Atualiza filtros
  useEffect(() => {
    if (categoriaInicial) {
      setCategoriasSelecionadas([categoriaInicial]);
      setPagina(1);
    }
  }, [categoriaInicial]);

  // 🔹 Aplica filtro
  const filtrados =
    categoriasSelecionadas.length === 0
      ? produtos
      : produtos.filter((p) =>
          modoFiltro === "AND"
            ? categoriasSelecionadas.every((cat) => p.categorias?.includes(cat))
            : categoriasSelecionadas.some((cat) => p.categorias?.includes(cat))
        );

  const totalPaginas = Math.ceil(filtrados.length / produtosPorPagina);
  const inicio = (pagina - 1) * produtosPorPagina;
  const fim = inicio + produtosPorPagina;
  const exibidos = filtrados.slice(inicio, fim);

  const mudarPagina = (novaPagina) => {
    if (sectionRef.current) {
      const offset = 120;
      const top =
        sectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setPagina(novaPagina);
  };

  const toggleCategoria = (cat) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPagina(1);
  };

  const limparCategorias = () => setCategoriasSelecionadas([]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400 flex items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Carregando produtos...
      </div>
    );
  }

  return (
    <div ref={sectionRef}>
      <PageTitle title={"Produtos | Sublime Perfumes Fracionados"} />
      <HeroProdutos />

      <div id="lista-produtos" className="py-28 w-full max-w-6xl mx-auto p-6">
        <TitleB
          text1={"Nossos Perfumes"}
          text2={"Explore vários aromas."}
          text3={"Fale Conosco"}
        />

        {/* 🔹 Filtros */}
        <FiltrosProdutos
          categoriasDisponiveis={categoriasDisponiveis}
          categoriasSelecionadas={categoriasSelecionadas}
          toggleCategoria={toggleCategoria}
          limpar={limparCategorias}
        />

        {/* 🔹 Produtos */}
        <AnimatePresence mode="wait">
          {exibidos.length === 0 ? (
            <motion.div className="text-center text-gray-300 py-10 flex items-center justify-center gap-2">
              <XCircle className="w-6 h-6" />
              Nenhum produto encontrado.
            </motion.div>
          ) : (
            <motion.div
              key={`${categoriasSelecionadas.join("-")}-${modoFiltro}-${pagina}`}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center"
            >
              {exibidos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  variants={cardVariants}
                  onClick={irParaProduto}
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
      </div>
    </div>
  );
};

export default Produtos;
