import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { produtos } from "../assets/produtos";

const categorias = [
  {
    nome: "Masculino",
    titulo: "Perfumes Masculinos",
    descricao: "Fragrâncias marcantes que traduzem força e sofisticação.",
    fundo: assets.fundo3,
  },
  {
    nome: "Feminino",
    titulo: "Perfumes Femininos",
    descricao: "Elegância e delicadeza em essências inesquecíveis.",
    fundo: assets.fundo2,
  },
  {
    nome: "Árabe",
    titulo: "Perfumes Árabes",
    descricao: "Intensidade em fragrâncias exclusivas.",
    fundo: assets.fundo,
  },
];

const SecoesProdutos = () => {
  return (
    <section className="w-full space-y-16 md:space-y-20 lg:space-y-28 px-4 sm:px-6 md:px-10 lg:px-20">
      {categorias.map((cat, index) => {
        const produtoDestaque = produtos.find((p) =>
          p.categorias.includes(cat.nome)
        );
        if (!produtoDestaque) return null;

        const invertido = index % 2 !== 0;

        return (
          <motion.div
            key={cat.nome}
            className={`relative flex flex-col ${
              invertido ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-10 md:gap-12 lg:gap-20 py-12 md:py-16 lg:py-20 min-h-[70vh] rounded-2xl overflow-hidden`}
            style={{
              backgroundImage: `url(${cat.fundo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* overlay */}
            <div className="absolute inset-0 bg-black/55" />

            {/* Texto */}
            <motion.div
              className="relative flex-1 flex flex-col justify-center text-center md:text-left px-4 sm:px-6 md:px-8 lg:px-12"
              initial={{ x: invertido ? 80 : -80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className={`text-2xl sm:text-3xl md:mb-2 md:text-4xl lg:text-5xl font-semibold text-white mb-4 ${
                  invertido ? "" : "md:pl-10"
                }`}
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {cat.titulo}
              </motion.h2>
              <motion.p
                className={`text-gray-200 text-base sm:text-lg md:text-2xl mb-6 max-w-[56ch] mx-auto md:mx-0 ${
                  invertido ? "" : "md:pl-10"
                }`}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {cat.descricao}
              </motion.p>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link
                  to={`/produtos?categoria=${encodeURIComponent(cat.nome)}`}
                  className={`inline-block px-6 sm:px-8 py-3 rounded-full font-medium shadow-lg bg-amber-400 text-black hover:text-gray-400 hover:bg-gray-900 transition ${
                    invertido ? "" : "md:ml-10"
                  }`}
                >
                  Ver Produtos
                </Link>
              </motion.div>
            </motion.div>

            {/* Imagem */}
            <motion.div
              className="relative flex-1 flex items-center justify-center"
              initial={{ scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.img
                src={produtoDestaque.imagens?.[0]}
                alt={produtoDestaque.nome}
                draggable={false}
                className="w-[80%] sm:w-[70%] md:w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl object-cover drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </motion.div>
        );
      })}
    </section>
  );
};

export default SecoesProdutos;
