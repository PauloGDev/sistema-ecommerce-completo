import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { produtos } from "../assets/produtos";
import { Link } from "react-router-dom";

const ProdutosDestaque = () => {
  const destaques = produtos.filter((p) => p.destaque);
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const carouselRef = useRef(null);
  const cardRef = useRef(null);
  const intervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Detecta largura do card dinamicamente
  useEffect(() => {
    if (cardRef.current) {
      const observer = new ResizeObserver(() => {
        if (cardRef.current) {
          setCardWidth(cardRef.current.offsetWidth + 32); // largura + gap
        }
      });

      observer.observe(cardRef.current);
      setCardWidth(cardRef.current.offsetWidth + 32);

      return () => observer.disconnect();
    }
  }, []);

// Calcular posição centralizada
const getOffset = () => {
  if (!carouselRef.current || !cardWidth) return 0;

  const visibleWidth = carouselRef.current.offsetWidth;
  
  // Se for desktop (largura >= 1024), divide por 2
  const divisor = window.innerWidth >= 1024 ? 2 : 2.5;

  const center = (visibleWidth - cardWidth) / divisor;
  return -(index * cardWidth) + center;
};

  const scrollNext = () => {
    setIndex((prev) => (prev + 1) % destaques.length);
  };

  const scrollPrev = () => {
    setIndex((prev) => (prev - 1 + destaques.length) % destaques.length);
  };

  // autoplay
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        scrollNext();
      }, 3000); // muda a cada 3s
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  return (
    <section id="produtos" className="w-full relative">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative">
        {/* Título */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Produtos em Destaque
          </h2>
          <p className="text-gray-400 mt-3 md:text-lg">
            Fragrâncias selecionadas especialmente para você
          </p>
        </div>

        {/* Carrossel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Setas */}
          <button
            onClick={scrollPrev}
            className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-full shadow-md hover:bg-white/20 transition z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-full shadow-md hover:bg-white/20 transition z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Track */}
          <motion.div ref={carouselRef} className="overflow-hidden">
            <motion.div
              className="flex gap-8"
              animate={{ x: getOffset() }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            >
              {destaques.map((produto, i) => (
                <div
                  key={produto.id}
                  ref={i === 0 ? cardRef : null}
                  className="min-w-[280px] sm:min-w-[340px] md:min-w-[400px] flex-shrink-0"
                >
                  <Link
                    to={`/produtos/${produto.slug}`}
                    className="block group"
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10">
                      <img
                        draggable={false}
                        src={produto.imagens[0]}
                        alt={produto.nome}
                        className="w-full h-[420px] object-cover group-hover:scale-105 transition duration-700 ease-out"
                      />
                    </div>
                    <h3 className="pt-4 text-white text-center text-lg md:text-xl font-semibold tracking-wide">
                      {produto.nome}
                    </h3>
                  </Link>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Paginação */}
          <div className="mt-6 flex justify-center gap-2">
            {destaques.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full transition ${
                  i === index ? "bg-white" : "bg-gray-500/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProdutosDestaque;
