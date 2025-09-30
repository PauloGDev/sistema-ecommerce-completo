import React from "react";
import { assets } from "../../assets/assets";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Package } from "lucide-react";

const Sobre = () => {
  return (
    <section className="relative w-full pt-20 text-white">
      {/* Overlay com textura sutil */}
      <div className="absolute inset-0 bg-[url('/textura-luxo.png')] opacity-5 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <span className="text-amber-400 font-semibold tracking-wide uppercase">
            Sobre a Sublime
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Mais que perfumes,<br /> uma experiência sofisticada
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Democratizamos o acesso a fragrâncias importadas, originais e
            memoráveis. Aqui você encontra qualidade, autenticidade e confiança
            em cada detalhe.
          </p>
        </motion.div>

        {/* Bloco principal */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Imagem em destaque */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src={assets.sobre}
              alt="Perfume Sublime"
              className="rounded-3xl shadow-xl object-cover w-full max-h-[500px] brightness-75"
            />
            <div className="absolute -bottom-6 -right-6 bg-amber-400 text-black px-6 py-4 rounded-2xl font-semibold shadow-lg">
              Exclusividade Garantida
            </div>
          </motion.div>

          {/* Texto e destaques */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-amber-400">
              Nossa Essência
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              A <span className="text-white font-semibold">Sublime Perfumes</span> nasceu para transformar o consumo de fragrâncias de luxo.
              Com perfumes fracionados e originais, você pode explorar diferentes aromas sem abrir mão da qualidade e autenticidade.
            </p>

            {/* Cards de valores */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition">
                <Star className="w-8 h-8 mx-auto text-amber-400" />
                <h4 className="mt-4 font-semibold">Excelência</h4>
                <p className="text-sm text-gray-400 mt-2">
                  Seleção das fragrâncias mais desejadas do mundo.
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition">
                <ShieldCheck className="w-8 h-8 mx-auto text-amber-400" />
                <h4 className="mt-4 font-semibold">Confiança</h4>
                <p className="text-sm text-gray-400 mt-2">
                  Apenas produtos 100% originais e de procedência garantida.
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition">
                <Package className="w-8 h-8 mx-auto text-amber-400" />
                <h4 className="mt-4 font-semibold">Entrega Premium</h4>
                <p className="text-sm text-gray-400 mt-2">
                  Rápida, discreta e com total cuidado em cada detalhe.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Sobre;
