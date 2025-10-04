import { motion } from "framer-motion";

const ResumoCarrinho = ({ fadeUp, total, handlePagamento }) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mt-12 border-t pt-6 flex justify-between items-center"
    >
      <span className="text-xl font-bold text-amber-400">
        Total: R$ {total.toFixed(2)}
      </span>
      <button
        onClick={handlePagamento}
        className="px-8 py-4 text-lg bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
      >
        Pagar Agora
      </button>
    </motion.div>
  );
};

export default ResumoCarrinho;
