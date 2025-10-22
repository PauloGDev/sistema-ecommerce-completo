import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CtaFinal() {
  return (
    <section className="relative text-white">
      {/* Overlay elegante */}
      <div className="absolute inset-0 bg-[url('/textura-luxo.png')] opacity-10 mix-blend-overlay" />

      <div className="relative max-w-5xl mx-auto px-6 py-20 text-center space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
        >
          Descubra a <span className="text-amber-400">Sublime</span>  
          <br />Qualidade, excelência e entrega discreta
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-300 max-w-2xl mx-auto"
        >
          Perfumes originais, entrega rápida e atendimento exclusivo.  
          Faça parte da nossa experiência premium e leve a fragrância ideal para sua essência.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <a
            href="https://wa.me/5585984642900"
            className="px-8 py-4 rounded-full bg-amber-400 text-black font-semibold shadow-lg hover:bg-gray-900 hover:text-gray-400 transition"
          >
            Pedir Agora no WhatsApp
          </a>
          <Link
            to="/produtos"
            className="px-8 py-4 rounded-full border border-gray-400 text-white hover:bg-white hover:text-black transition"
          >
            Ver Todos os Produtos
          </Link>
        </motion.div>

        {/* Selo de confiança sem emojis */}
        <div className="pt-6 text-sm text-gray-400">
          Produtos 100% originais &nbsp; • &nbsp; Entrega discreta e rápida &nbsp; • &nbsp; Atendimento exclusivo
        </div>
      </div>
    </section>
  );
}
