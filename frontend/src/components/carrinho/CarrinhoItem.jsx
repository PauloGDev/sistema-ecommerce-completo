import { motion } from "framer-motion";

const CarrinhoItem = ({ item, i, fadeUp, incrementar, decrementar, remover }) => {
  return (
    <motion.div
      key={item.produtoId}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.1 }}
      className="flex items-center justify-between border bg-gradient-to-br from-black to-gray-900 rounded-lg p-4 drop-shadow-lg"
    >
      <div className="flex items-center gap-4">
        <img
          src={item.imagemUrl}
          alt={item.nomeProduto}
          className="w-16 h-16 object-contain rounded-md"
        />
        <div>
          <p className="font-semibold text-white">{item.nomeProduto}</p>
          <p className="text-sm text-gray-200">R$ {item.precoUnitario.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => decrementar(item.produtoId)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          -
        </button>

        <span className="min-w-[24px] text-center text-white">{item.quantidade}</span>

        <button
          onClick={() => incrementar(item.produtoId)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          +
        </button>
      </div>

      <button
        onClick={() => remover(item.produtoId)}
        className="text-red-500 hover:text-red-700"
      >
        🗑️
      </button>
    </motion.div>
  );
};

export default CarrinhoItem;
