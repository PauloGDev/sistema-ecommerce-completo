// components/carrinho/EnderecoEntregaBox.jsx
import { motion } from "framer-motion";
import AddressSelector from "../checkout/AdressSelector";

const EnderecoEntregaBox = ({ fadeUp, onSelect }) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mt-10 border bg-gradient-to-br from-black to-gray-900 rounded-lg p-4 text-gray-200"
    >
      <h2 className="text-lg font-semibold text-white mb-2">Endereço de Entrega</h2>
      <AddressSelector onSelect={onSelect} />
    </motion.div>
  );
};

export default EnderecoEntregaBox;
