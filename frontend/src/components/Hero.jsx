import { motion } from "framer-motion";
import { assets } from "../assets/assets";

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-br from-black via-gray-900 to-black">
      <div
  className="relative flex flex-col-reverse md:grid lg:grid-cols-2 grid-cols-1 items-center gap-12 px-6 bg-white overflow-hidden pt-24 md:h-[70vh]"
  style={{
    backgroundImage: `url(${assets.fundo_secaosobre})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Overlay suave para contraste */}
  <div className="absolute inset-0 bg-black/60 md:bg-black/20 lg:bg-gradient-to-r from-black/50 via-black/60 to-black/70" />

  {/* Imagem produto encostada embaixo */}
  <motion.img
    src={assets.secaosobre}
    alt="Perfumes Sublime"
    className="rounded-2xl object-contain w-full max-h-[500px] relative self-end"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  />

  {/* TEXTO */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 z-10"
          >
            <span className=" inline-block px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
              SUBLIME
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl leading-tight text-white">
              Perfumes importados, originais e marcantes
            </h1>

            <p className="text-lg text-gray-300 max-w-xl">
              Fragrâncias de alto padrão selecionadas para traduzir sua personalidade.
              Qualidade, excelência e entrega discreta — descubra a sofisticação que cabe no seu dia a dia.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
              <a
                href="https://wa.me/5585984642900"
                aria-label="Pedir pelo WhatsApp"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full transition bg-amber-400 text-black hover:text-gray-400 hover:bg-gray-900"
              >
                {/* WhatsApp SVG (simples) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.52 3.48C18.17 1.13 15.04 0 11.64 0 5.17 0 .04 5.13.04 11.6c0 2.05.53 4.05 1.54 5.83L0 24l6.77-1.73c1.66.9 3.54 1.39 5.41 1.39 6.47 0 11.6-5.13 11.6-11.6 0-3.4-1.13-6.53-3.26-8.48zM11.64 21.16c-1.66 0-3.28-.45-4.7-1.3l-.34-.21-4.02 1.03 1.08-3.93-.22-.36c-.96-1.55-1.46-3.33-1.46-5.19 0-5.1 4.14-9.24 9.24-9.24 2.47 0 4.77.96 6.51 2.7 1.74 1.74 2.7 4.04 2.7 6.51 0 5.1-4.14 9.24-9.24 9.24z" fill="currentColor" />
                </svg>
                <span>Pedir pelo WhatsApp</span>
              </a>

              <a
                href="#produtos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-gray-400 text-white hover:bg-white hover:text-black transition"
              >
                Ver fragrâncias
              </a>
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <strong>Entrega</strong> • Discreta e rápida &nbsp; • &nbsp; <strong>Garantia</strong> • Produtos originais
            </div>
          </motion.div>
</div>
    </section>
  );
}