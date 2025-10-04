import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import PageTitle from "../../context/PageTitle";
import { Loader2 } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ProdutosRelacionados from "./ProdutosRelacionados";
import { useCarrinho } from "../../context/CarrinhoContext";

const ProdutoPage = () => {
  const { slug } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [volumeSelecionado, setVolumeSelecionado] = useState(null);
  const { adicionarAoCarrinho } = useCarrinho();

    const handleComprar = () => {
    if (!produto) return;

    const variacao = produto.variacoes?.find((v) => v.nome === volumeSelecionado);
    adicionarAoCarrinho(produto.id, variacao?.id ?? null, 1);
  };

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/api/produtos/slug/${slug}`);
        if (!res.ok) throw new Error("Produto não encontrado");
        const data = await res.json();
        setProduto(data);
        setVolumeSelecionado(data.variacoes?.[0]?.nome ?? null);
      } catch (err) {
        console.error(err);
        setProduto(null);
      } finally {
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
      <div className="flex justify-center items-center min-h-[70vh] text-gray-300 gap-2">
        <Loader2 className="animate-spin w-5 h-5" />
        Carregando produto...
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h1 className="text-3xl font-bold text-red-500">Produto não encontrado</h1>
        <Link
          to="/produtos"
          className="mt-4 px-6 py-3 bg-amber-500 rounded-full font-medium hover:bg-gray-900 hover:text-white transition"
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
        {/* Imagens */}
        <div className="flex-1 flex justify-center">
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            className="w-[80%] sm:w-[60%] md:w-full max-w-md rounded-2xl shadow-xl object-cover cursor-pointer"
            onClick={() => setLightboxIndex(0)}
          />
        </div>

        {/* Detalhes */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {produto.nome}
          </h1>

          {/* Categorias */}
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

          {/* Seletor de Variações */}
          {produto.variacoes?.length > 0 && (
            <div className="flex justify-center lg:justify-start gap-4 mb-6">
              {produto.variacoes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVolumeSelecionado(v.nome)}
                  aria-pressed={volumeSelecionado === v.nome}
                  className={`px-4 py-2 rounded-full border transition ${
                    volumeSelecionado === v.nome
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-transparent text-white border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  {v.nome}
                </button>
              ))}
            </div>
          )}

          {/* Preço */}
          <p className="text-2xl font-bold text-amber-400 mb-6">
            R$ {precoAtual?.toFixed(2).replace(".", ",")}
          </p>

          {/* Descrição */}
          <p className="text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
            {produto.descricao}
          </p>

          {/* Comprar */}
          <button
        onClick={handleComprar}
        className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-full hover:bg-gray-900 hover:text-white transition shadow-lg"
      >
        Comprar {volumeSelecionado ?? ""}
      </button>

          <div className="mt-6">
            <Link to="/produtos" className="text-amber-400 hover:text-white transition">
              ← Voltar para Produtos
            </Link>
          </div>
        </div>
      </section>

      <ProdutosRelacionados
        produtoId={produto.id}
        categoriaId={produto.categorias?.[0]?.id}
      />

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
