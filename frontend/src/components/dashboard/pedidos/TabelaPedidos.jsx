import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import PropTypes from "prop-types";
import EnderecoInfo from "./EnderecoInfo";

// Cores de status
const statusColors = {
  PENDENTE: "bg-yellow-500 text-black",
  PAGO: "bg-green-500 text-black",
  ENVIADO: "bg-blue-500 text-white",
  CONCLUIDO: "bg-emerald-600 text-white",
  CANCELADO: "bg-red-500 text-white",
};

// Formatador de moeda
const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Formatador de data
const formatDate = (date) => {
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// Função para formatar telefone no padrão BR
const formatPhone = (phone) => {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
};

// Linha de pedido (memoizada)
const PedidoRowComponent = ({ pedido, i, isExpanded, onExpand, setPedidoEdit, setForm }) => {
  return (
    <>
      {/* Linha principal */}
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
        onClick={() => onExpand(pedido.id)}
        aria-expanded={isExpanded}
      >
        <td className="p-3 font-medium text-gray-100">{pedido.id}</td>
        <td className="p-3">{pedido.usuario.username}</td>
        <td className="p-3 hidden md:table-cell">{pedido?.cpf || "—"}</td>
        <td className="p-3 hidden md:table-cell">{formatPhone(pedido?.telefone)}</td>
        <td className="p-3 hidden md:table-cell truncate max-w-[180px]">{pedido?.email || "—"}</td>
        <td className="p-3 text-amber-400 font-bold whitespace-nowrap">
          {formatMoney.format(pedido.total)}
        </td>
        <td className="p-3 hidden md:table-cell">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              statusColors[pedido.status] || "bg-gray-500 text-white"
            }`}
          >
            {pedido.status}
          </span>
        </td>
        <td className="p-3 hidden md:table-cell text-gray-300">{formatDate(pedido.data)}</td>
        <td className="p-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPedidoEdit(pedido);
              setForm(pedido);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            Editar
          </button>

          {/* 🔹 Botão de Rastreio */}
          {pedido.linkRastreio && (
            <a
              href={pedido.linkRastreio}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600 text-center"
            >
              Ver Rastreio
            </a>
          )}
        </td>
      </motion.tr>

      {/* Linha expandida */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900"
          >
            <td colSpan={9} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-200">
                {/* Itens do pedido */}
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                  <h4 className="font-semibold mb-2 text-lg">Itens do Pedido</h4>
                  <ul className="space-y-1 text-sm">
                    {pedido.itens.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          ({item.quantidade}x) {item.nome || item.nomeProduto}
                        </span>
                        <span className="text-amber-400">
                          {formatMoney.format(item.precoUnitario * item.quantidade)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Informações do pedido */}
                <div className="space-y-4">
                  {/* Dados do Usuário */}
                  {pedido.usuarioDTO && (
                    <div className="bg-gray-800 p-4 rounded-lg shadow">
                      <h4 className="font-semibold mb-2 text-lg">Dados do Usuário</h4>
                      <p className="text-sm"><strong>Nome:</strong> {pedido.usuarioDTO.nome}</p>
                      <p className="text-sm"><strong>Username:</strong> {pedido.usuarioDTO.username}</p>
                      <p className="text-sm"><strong>Email:</strong> {pedido.usuarioDTO.email}</p>
                      <p className="text-sm"><strong>Status:</strong> {pedido.usuarioDTO.status}</p>
                    </div>
                  )}

                  {/* Dados do Cliente no Pedido */}
                  <div className="bg-gray-800 p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2 text-lg">Dados do Cliente (Pedido)</h4>
                    <p className="text-sm mb-4"><strong>Usuário:</strong> {pedido?.usuario.username || "—"}</p>
                    <p className="text-sm"><strong>Nome:</strong> {pedido?.nomeCompleto || "—"}</p>
                    <p className="text-sm"><strong>CPF:</strong> {pedido?.cpf || "—"}</p>
                    <p className="text-sm"><strong>Telefone:</strong> {formatPhone(pedido?.telefone)}</p>
                    <p className="text-sm"><strong>Email:</strong> {pedido?.email || "—"}</p>
                  </div>

                  {/* Endereço de Entrega */}
                  <div className="bg-gray-800 p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2 text-lg">Endereço de Entrega</h4>
                    <EnderecoInfo endereco={pedido.enderecoEntrega} />
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

PedidoRowComponent.propTypes = {
  pedido: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  setPedidoEdit: PropTypes.func.isRequired,
  setForm: PropTypes.func.isRequired,
};

const PedidoRow = memo(PedidoRowComponent);

// Skeleton de carregamento
const SkeletonRow = ({ columns = 9, index = 0 }) => {
  // Define larguras diferentes por coluna para ficar mais realista
  const columnWidths = ["20%", "25%", "15%", "15%", "30%", "15%", "20%", "15%", "25%"];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-700"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          {i === 6 ? (
            // Simula uma tag de status
            <motion.div
              className="h-4 rounded-full bg-gray-600"
              style={{ width: columnWidths[i] }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.1 }}
            />
          ) : i === 8 ? (
            // Simula botões de ação
            <div className="flex gap-2">
              <motion.div
                className="h-4 rounded bg-gray-600"
                style={{ width: "50%" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.1 }}
              />
              <motion.div
                className="h-4 rounded bg-gray-600"
                style={{ width: "30%" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.15 }}
              />
            </div>
          ) : (
            // Colunas de texto normal
            <motion.div
              className="h-4 bg-gray-600 rounded"
              style={{ width: columnWidths[i] }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.1 }}
            />
          )}
        </td>
      ))}
    </motion.tr>
  );
};

// -------------------------------
// Tabela principal
// -------------------------------
const TabelaPedidos = ({ pedidos, setPedidoEdit, setForm, loading }) => {
  const [expandedId, setExpandedId] = useState(null);

  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <motion.table
        initial="hidden"
        animate="show"
        className="min-w-full bg-gray-800 rounded-lg overflow-hidden"
      >
        <thead className="bg-gray-700 text-gray-200 text-sm">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Cliente</th>
            <th className="p-3 text-left hidden md:table-cell">CPF</th>
            <th className="p-3 text-left hidden md:table-cell">Telefone</th>
            <th className="p-3 text-left hidden md:table-cell">Email</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left hidden md:table-cell">Status</th>
            <th className="p-3 text-left hidden md:table-cell">Data</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} index={i} />)
            : pedidos.length > 0
            ? pedidos.map((pedido, i) => (
                <PedidoRow
                  key={pedido.id}
                  pedido={pedido}
                  i={i}
                  isExpanded={expandedId === pedido.id}
                  onExpand={handleExpand}
                  setPedidoEdit={setPedidoEdit}
                  setForm={setForm}
                />
              ))
            : (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-400">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
        </tbody>
      </motion.table>
    </div>
  );
};

TabelaPedidos.propTypes = {
  pedidos: PropTypes.array.isRequired,
  setPedidoEdit: PropTypes.func.isRequired,
  setForm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default TabelaPedidos;
