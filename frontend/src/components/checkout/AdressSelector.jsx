import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import {
  Star,
  X,
  PlusCircle,
  Save,
  Trash2,
  Edit2,
  Check,
  XCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const labels = {
  logradouro: "Rua",
  numero: "Número",
  complemento: "Complemento (opcional)",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  cep: "CEP",
};

export default function AddressSelector({ onSelect, perfilId }) {
  const { showNotification } = useNotification();
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [modal, setModal] = useState(null); // {type: 'add'|'edit'|'delete', data: {...}}
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchEnderecos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_URL}/enderecos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEnderecos(data);
        if (data.length > 0) {
          const padrao = data.find((e) => e.padrao) || data[0];
          setEnderecoSelecionado(padrao);
          onSelect(padrao);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar endereços:", err);
    }
  };

  useEffect(() => {
    fetchEnderecos();
  }, []);

  const handleSelect = (endereco) => {
    setEnderecoSelecionado(endereco);
    onSelect(endereco);
  };

  const handleDefinirPadrao = async (endereco) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/enderecos/${endereco.id}/padrao`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error();
      const atualizado = await response.json();

      setEnderecos((prev) =>
        prev.map((e) =>
          e.id === atualizado.id ? { ...e, padrao: true } : { ...e, padrao: false }
        )
      );
      showNotification("Endereço padrão atualizado com sucesso!", "success");
    } catch {
      showNotification("Erro ao definir endereço padrão.", "error");
    }
  };

  const handleSalvarEndereco = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/enderecos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      const salvo = await response.json();
      setEnderecos((prev) => [...prev, salvo]);
      setModal(null);
      showNotification("Endereço adicionado com sucesso!", "success");
    } catch {
      showNotification("Erro ao adicionar endereço.", "error");
    }
  };

  const handleEditarEndereco = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/enderecos/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      const atualizado = await response.json();
      setEnderecos((prev) =>
        prev.map((e) => (e.id === atualizado.id ? atualizado : e))
      );
      setModal(null);
      showNotification("Endereço atualizado com sucesso!", "success");
    } catch {
      showNotification("Erro ao editar endereço.", "error");
    }
  };

  const handleExcluirEndereco = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/enderecos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      setEnderecos((prev) => prev.filter((e) => e.id !== id));
      setModal(null);
      showNotification("Endereço excluído com sucesso!", "success");
    } catch {
      showNotification("Erro ao excluir endereço.", "error");
    }
  };

  return (
    <div className="mb-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {enderecos.map((endereco) => (
          <motion.div
            key={endereco.id}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            onClick={() => handleSelect(endereco)}
            className={`p-5 rounded-xl border cursor-pointer transition ${
              enderecoSelecionado?.id === endereco.id
                ? "bg-gray-900 border-amber-500 ring-2 ring-amber-400"
                : "bg-gray-950 border-gray-800 hover:border-amber-400"
            }`}
          >
            <div>
              <p className="font-medium text-white">
                {endereco.logradouro}, {endereco.numero}
              </p>
              {endereco.complemento && (
                <p className="text-sm text-gray-400">{endereco.complemento}</p>
              )}
              <p className="text-sm text-gray-400">
                {endereco.bairro} - {endereco.cidade}/{endereco.estado}
              </p>
              <p className="text-sm text-gray-400">CEP {endereco.cep}</p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              {endereco.padrao ? (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-semibold">
                  <Star size={14} /> Padrão
                </span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDefinirPadrao(endereco);
                  }}
                  className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-amber-500 hover:text-black"
                >
                  Tornar padrão
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ type: "edit", data: endereco });
                  }}
                  className="text-gray-400 hover:text-amber-500"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ type: "delete", data: endereco });
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => setModal({ type: "add" })}
        className="mt-6 flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg shadow hover:bg-amber-600"
      >
        <PlusCircle size={18} /> Adicionar novo endereço
      </button>

      <AnimatePresence>
        {modal && (
          <Modal
            modal={modal}
            onClose={() => setModal(null)}
            onSave={handleSalvarEndereco}
            onEdit={handleEditarEndereco}
            onDelete={handleExcluirEndereco}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===============================
   COMPONENTE MODAL PERSONALIZADO
================================*/
const Modal = ({ modal, onClose, onSave, onEdit, onDelete }) => {
  const [form, setForm] = useState(modal.data || {});

  const handleSubmit = () => {
    if (modal.type === "add") onSave(form);
    if (modal.type === "edit") onEdit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            {modal.type === "add" && "Novo Endereço"}
            {modal.type === "edit" && "Editar Endereço"}
            {modal.type === "delete" && "Excluir Endereço"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400">
            <X size={20} />
          </button>
        </div>

        {modal.type === "delete" ? (
          <>
            <p className="text-gray-300 mb-4">
              Tem certeza que deseja excluir o endereço <br />
              <strong>{modal.data.logradouro}, {modal.data.numero}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-gray-700 text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => onDelete(modal.data.id)}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Confirmar exclusão
              </button>
            </div>
          </>
        ) : (
          <>
            {Object.keys(labels).map((campo) => (
              <div key={campo} className="flex flex-col mb-3">
                <label className="text-sm text-gray-300 mb-1">
                  {labels[campo]}
                </label>
                <input
                  type="text"
                  value={form[campo] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [campo]: e.target.value })
                  }
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-amber-500"
                />
              </div>
            ))}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-gray-700 text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 py-1 rounded bg-amber-500 text-black font-semibold"
              >
                Salvar
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
