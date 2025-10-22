import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import PageTitle from "../../context/PageTitle";
import { Loader2, Lock, ShoppingCart } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ProdutosDestaque from "./ProdutosDestaque";
import { useCarrinho } from "../../context/CarrinhoContext";
import { motion } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";

const ProdutoPage = () => {
  const { slug } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [volumeSelecionado, setVolumeSelecionado] = useState(null);
  const { adicionarAoCarrinho } = useCarrinho();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { showNotification } = useNotification();

const handleComprar = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    showNotification("⚠️ Você precisa estar logado para adicionar ao carrinho.", "error");
    setTimeout(() => navigate("/login"), 1500);
    return;
  }

  if (!produto) return;

  const variacao = produto.variacoes?.find((v) => v.nome === volumeSelecionado);
  adicionarAoCarrinho(produto.id, variacao?.id ?? null, 1);
  showNotification("Produto adicionado ao carrinho!", "success");
};

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/produtos/slug/${slug}`);
        if (!res.ok) throw new Error("Produto não encontrado");
        const data = await res.json();
        setProduto(data);
        setVolumeSelecionado(data.variacoes?.[0]?.nome ?? null);
        setTimeout(() => setLoading(false), 600);
      } catch (err) {
        console.error(err);
        setProduto(null);
        setLoading(false);
      }
    };
    fetchProduto();
  }, [slug]);

  const precoAtual = useMemo(() => {
    if (!produto) return null;
    const variacao = produto.variacoes?.find((v) => v.nome === volumeSelecionado);
    return variacao?.preco ?? produto.precoBase;
  }, [produto, volumeSelecionado]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-gray-300 gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-amber-400" />
        <p className="text-lg">Carregando produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Produto não encontrado</h1>
        <Link
          to="/produtos"
          className="px-6 py-3 bg-amber-500 rounded-full font-medium hover:bg-gray-900 hover:text-white transition"
        >
          Voltar aos Produtos
        </Link>
      </div>
    );
  }

  const imagens = [produto.imagemUrl];

  return (
    <>
      <PageTitle title={`${produto.nome} | Sublime Perfumes Fracionados`} />

      <section className="min-h-[80vh] flex flex-col lg:flex-row items-center justify-center gap-12 px-6 sm:px-10 lg:px-20 py-16">
        {/* Imagem */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex justify-center"
        >
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            className="w-[80%] sm:w-[60%] md:w-full max-w-md rounded-3xl shadow-2xl object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setLightboxIndex(0)}
          />
        </motion.div>

        {/* Detalhes */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {produto.nome}
          </h1>

          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
            {produto.categorias?.map((cat, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-wide"
              >
                {cat.nome ?? cat}
              </span>
            ))}
          </div>

          {/* Variações */}
          {produto.variacoes?.length > 0 && (
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              {produto.variacoes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVolumeSelecionado(v.nome)}
                  className={`px-4 py-2 rounded-full border transition ${
                    volumeSelecionado === v.nome
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800"
                  }`}
                >
                  {v.nome}
                </button>
              ))}
            </div>
          )}

          {/* Preço */}
          <p className="text-3xl font-bold text-amber-400 mb-6">
            R$ {precoAtual?.toFixed(2).replace(".", ",")}
          </p>

          {/* Descrição */}
          <p className="text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            {produto.descricao}
          </p>

          {/* Botão de compra */}
          <motion.button
            onClick={handleComprar}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition flex items-center justify-center gap-2 shadow-lg"
          >
            {localStorage.getItem("token") ? (
              <>
                <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho {volumeSelecionado ?? ""}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" /> Fazer Login para Comprar
              </>
            )}
          </motion.button>

          <div className="mt-8">
            <Link
              to="/produtos"
              className="text-amber-400 hover:text-white transition text-sm"
            >
              ← Voltar para Produtos
            </Link>
          </div>
        </motion.div>
      </section>

      <ProdutosDestaque />

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={imagens.map((src) => ({ src }))}
      />
    </>
  );
};

export default ProdutoPage;
