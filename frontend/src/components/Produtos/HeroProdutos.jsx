import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

export default function HeroProdutos() {
  return (
    <section
      className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${assets.heroProdutos})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay para contraste */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Conteúdo */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold rounded-full bg-amber-100 text-amber-700">
          Coleção Sublime
        </span>

        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Nossas Fragrâncias
        </h1>

        <p className="mt-4 text-base md:text-lg text-gray-200">
          Perfumes originais, importados e marcantes — descubra aromas que
          traduzem estilo e personalidade.
        </p>

        <a
          href="#lista-produtos"
          className="mt-8 inline-block px-8 py-3 rounded-full font-medium transition bg-amber-500 text-black hover:text-gray-400 hover:bg-gray-900 shadow-lg"
        >
          Ver Produtos
        </a>
      </motion.div>
    </section>
  );
}
