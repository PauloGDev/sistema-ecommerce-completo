import { motion } from "framer-motion";
import EnderecoInfo from "./EnderecoInfo";

const statusColors = {
  PENDENTE: "bg-yellow-500 text-black",
  PAGO: "bg-green-500 text-black",
  ENVIADO: "bg-blue-500 text-white",
  CONCLUIDO: "bg-emerald-600 text-white",
  CANCELADO: "bg-red-500 text-white",
};

const TabelaPedidos = ({ pedidos, setPedidoEdit, setForm }) => {
  return (
    <div className="overflow-x-auto rounded-lg">
      <motion.table
        initial="hidden"
        animate="show"
        className="min-w-full bg-gray-800 rounded-lg overflow-hidden"
      >
        <thead className="bg-gray-700 text-gray-200">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Cliente</th>
            <th className="p-3 text-left">Cpf</th>
            <th className="p-3 text-left">Itens</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Endereço</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Data</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length > 0 ? (
            pedidos.map((pedido, i) => (
              <motion.tr
                key={pedido.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b border-gray-700 hover:bg-gray-700/50"
              >
                <td className="p-3">{pedido.id}</td>
                <td className="p-3">{pedido?.nomeCompleto || "Guest"}</td>
                <td className="p-3">{pedido?.cpf || "—"}</td>
                <td className="p-3">
                  {pedido.itens.map((item, idx) => (
                    <div key={idx}>
                      ({item.quantidade}x) {item.nome || item.nomeProduto}
                    </div>
                  ))}
                </td>
                <td className="p-3 text-amber-400 font-bold">
                  R$ {pedido.total.toFixed(2)}
                </td>
                <td className="p-3">
                  <EnderecoInfo endereco={pedido.enderecoEntrega} />
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      statusColors[pedido.status] || "bg-gray-500"
                    }`}
                  >
                    {pedido.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(pedido.data).toLocaleString("pt-BR")}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setPedidoEdit(pedido);
                      setForm(pedido);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Editar
                  </button>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-6 text-gray-400">
                Nenhum pedido encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </motion.table>
    </div>
  );
};

export default TabelaPedidos;
