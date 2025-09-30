// src/components/CarrosselCategoriaSwiper.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Mousewheel } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { produtos } from "../assets/produtos";

const CarrosselCategoria = ({ categoria, title }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const filtrados = produtos.filter((p) => p.categorias.includes(categoria));

  // Hook SEM condição
  useEffect(() => {
    if (!swiperRef.current) return;
    const swiper = swiperRef.current;
    swiper.params.navigation.prevEl = prevRef.current;
    swiper.params.navigation.nextEl = nextRef.current;

    if (swiper.navigation) {
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  // se não tiver produtos, não renderiza nada
  if (!filtrados.length) return null;

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-7xl mx-auto relative">
        {/* título + botões */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {title || categoria}
          </h3>
          <div className="flex gap-2">
            <button
              ref={prevRef}
              aria-label="Anterior"
              className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-md hover:opacity-90"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <button
              ref={nextRef}
              aria-label="Próximo"
              className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-md hover:opacity-90"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        <Swiper
  modules={[Navigation, Mousewheel]}
  onSwiper={(s) => (swiperRef.current = s)}
  navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
  mousewheel={{ forceToAxis: true }}
  spaceBetween={16}
  slidesPerView={"auto"}
  centeredSlides={true} // só funciona no mobile
  breakpoints={{
    640: { // tablet
      slidesPerView: "auto",
      centeredSlides: false,
      spaceBetween: 16,
    },
    1024: { // desktop
      slidesPerView: "auto",
      centeredSlides: false,
      spaceBetween: 20,
    },
  }}
  className="py-2 max-w-[80vw]"
>
  {filtrados.map((p) => (
    <SwiperSlide
      key={p.id}
      className="
        h-auto
        !w-[170px]   // mobile mais compacto
        sm:!w-[200px]  // tablet médio
        md:!w-[220px]  // tablets maiores
        lg:!w-[260px]  // desktop
        xl:!w-[300px]  // monitores grandes
      "
    >
      <ProductCard product={p} />
    </SwiperSlide>
  ))}
</Swiper>



      </div>
    </section>
  );
};

const ProductCard = ({ product }) => {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-900 shadow-lg h-full flex flex-col">
      <Link to={`/produtos/${product.slug}`} className="flex flex-col h-full">
        <div className="aspect-[4/5] flex items-center justify-center bg-gray-800 p-4">
          <img
            src={product.imagens?.[0]}
            alt={product.nome}
            className="object-contain max-h-full"
            draggable={false}
          />
        </div>

        <div className="p-4 text-center flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold leading-tight line-clamp-2">
              {product.nome}
            </h4>
            <p className="text-amber-400 mt-2 font-bold">
              {formatStartingPrice(product)}
            </p>
          </div>
          {product.tamanhos?.length > 0 && (
            <div className="mt-2 text-xs text-gray-300">
              {product.tamanhos.map((t) => t.volume).join(" • ")}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

// helpers
function formatStartingPrice(product) {
  if (!product.tamanhos?.length) return product.preco || "";
  const nums = product.tamanhos
    .map((t) => parsePrice(t.preco))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return product.preco || "";
  const min = Math.min(...nums);
  return `A partir de R$ ${min.toFixed(2).replace(".", ",")}`;
}

function parsePrice(str) {
  if (!str) return Infinity;
  const cleaned = String(str)
    .replace(/[^\d,.-]/g, "")
    .replace(".", "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : Infinity;
}

export default CarrosselCategoria;
