import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import EnderecoInfo from "./EnderecoInfo";

const statusColors = {
  PENDENTE: "bg-yellow-500 text-black",
  PAGO: "bg-green-500 text-black",
  ENVIADO: "bg-blue-500 text-white",
  CONCLUIDO: "bg-emerald-600 text-white",
  CANCELADO: "bg-red-500 text-white",
};

const EditarPedidoModal = ({
  pedidoEdit,
  setPedidoEdit,
  form,
  setForm,
  atualizarPedido,
}) => {
  if (!pedidoEdit) return null;

  const atualizarItem = (index, field, value) => {
    const novosItens = [...form.itens];
    novosItens[index] = { ...novosItens[index], [field]: value };
    setForm({ ...form, itens: novosItens });
  };

  const removerItem = (index) => {
    const novosItens = form.itens.filter((_, i) => i !== index);
    setForm({ ...form, itens: novosItens });
  };

  const adicionarItem = () => {
    setForm({
      ...form,
      itens: [
        ...(form.itens || []),
        { nome: "", quantidade: 1, precoUnitario: 0 }, // 🔹 ajustado
      ],
    });
  };

  // 🔹 recalcula total sempre que itens mudarem
  useEffect(() => {
    const novoTotal =
      form.itens?.reduce(
        (acc, item) =>
          acc + (item.quantidade || 0) * (item.precoUnitario || 0),
        0
      ) || 0;

    setForm((f) => ({ ...f, total: novoTotal }));
  }, [form.itens]);

  return (
    <AnimatePresence>
      {pedidoEdit && (
        <motion.div
          key={"modal"}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
          key="modal-content"
            className="bg-gray-900 p-6 rounded-lg w-[500px] text-gray-200 relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setPedidoEdit(null)}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Editar Pedido</h3>

            {/* Cliente */}
            <label className="block mb-2">Cliente</label>
            <input
              type="text"
              value={form.nomeCompleto || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  nomeCompleto: e.target.value,
                })
              }
              className="w-full p-2 rounded bg-gray-800 text-white mb-3"
            />

            {/* Endereço */}
            <label className="block mb-2">Endereço de Entrega</label>
            <div className="bg-gray-800 p-3 rounded mb-3">
              <EnderecoInfo endereco={form.enderecoEntrega} />
            </div>

            {/* Status */}
            <label className="block mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={`w-full p-2 rounded mb-3 ${
                statusColors[form.status] || "bg-gray-800 text-white"
              }`}
            >
              {Object.keys(statusColors).map((s) => (
                <option className="bg-gray-800 text-white" key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Itens */}
            <label className="block mb-2">Itens</label>
            <div className="space-y-3 mb-3">
              {form.itens?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-800 p-2 rounded"
                >
                    <input
                    type="text"
                    value={item.nomeProduto || ""}
                    onChange={(e) => atualizarItem(idx, "nomeProduto", e.target.value)}
                    className="flex-1 p-1 rounded bg-gray-700 text-white"
                    placeholder="Produto"
                    />

                    <input
                    type="number"
                    value={item.quantidade}
                    min={1}
                    onChange={(e) =>
                        atualizarItem(idx, "quantidade", Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 p-1 rounded bg-gray-700 text-white"
                    placeholder="Qtd"
                    />

                    <input
                    type="number"
                    value={item.precoUnitario}
                    min={0}
                    step={1}
                    onChange={(e) =>
                        atualizarItem(idx, "precoUnitario", Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-24 p-1 rounded bg-gray-700 text-white"
                    placeholder="Preço"
                    />

                  <button
                    onClick={() => removerItem(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={adicionarItem}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded mb-3"
            >
              <Plus size={16} /> Adicionar Item
            </button>

            {/* Total */}
            <p className="text-lg font-semibold text-amber-400">
              Total: R$ {form.total?.toFixed(2) || "0.00"}
            </p>

            {/* Ações */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setPedidoEdit(null)}
                className="px-4 py-2 rounded bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={atualizarPedido}
                className="px-4 py-2 rounded bg-amber-500 text-black"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditarPedidoModal;
