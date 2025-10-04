import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 🔹 Subcomponente para edição de endereços
const EnderecoForm = ({ enderecos, onChange, onAdd, onRemove }) => {
  const handleChange = (index, field, value) => {
    const novos = [...enderecos];
    novos[index] = { ...novos[index], [field]: value };
    onChange(novos);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-amber-400 mb-3">Endereços</h3>
      <div className="space-y-4">
        {enderecos.map((end, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
          >
            <input
              type="text"
              placeholder="Logradouro"
              value={end.logradouro}
              onChange={(e) => handleChange(index, "logradouro", e.target.value)}
              className="sm:col-span-4 p-2 rounded bg-gray-900 border border-gray-700"
            />
            <input
              type="text"
              placeholder="Número"
              value={end.numero}
              onChange={(e) => handleChange(index, "numero", e.target.value)}
              className="sm:col-span-2 p-2 rounded bg-gray-900 border border-gray-700"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={end.cidade}
              onChange={(e) => handleChange(index, "cidade", e.target.value)}
              className="sm:col-span-3 p-2 rounded bg-gray-900 border border-gray-700"
            />
            <input
              type="text"
              placeholder="Estado"
              value={end.estado}
              onChange={(e) => handleChange(index, "estado", e.target.value)}
              className="sm:col-span-1 p-2 rounded bg-gray-900 border border-gray-700"
            />
            <input
              type="text"
              placeholder="CEP"
              value={end.cep}
              onChange={(e) => handleChange(index, "cep", e.target.value)}
              className="sm:col-span-2 p-2 rounded bg-gray-900 border border-gray-700"
            />
            <button
              onClick={() => onRemove(index)}
              className="sm:col-span-6 px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-4 px-4 py-2 bg-emerald-500 rounded-lg hover:bg-emerald-400 text-sm font-medium"
      >
        + Adicionar Endereço
      </button>
    </div>
  );
};

const EditarPerfilModal = ({ isOpen, onClose, perfilAtual, onSave }) => {
  const [perfil, setPerfil] = useState({
    nomeCompleto: "",
    telefone: "",
    cpf: "",
    enderecos: [],
  });

  useEffect(() => {
    if (perfilAtual) {
      setPerfil({
        nomeCompleto: perfilAtual.nomeCompleto || "",
        telefone: perfilAtual.telefone || "",
        cpf: perfilAtual.cpf || "",
        enderecos: perfilAtual.enderecos || [],
      });
    }
  }, [perfilAtual]);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(perfil);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fundo escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-8">
              <h2 className="text-2xl font-bold">Editar Perfil</h2>

              {/* Dados pessoais */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm text-gray-400">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nomeCompleto"
                    value={perfil.nomeCompleto}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-400">
                      Telefone
                    </label>
                    <input
                      type="text"
                      name="telefone"
                      value={perfil.telefone}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-400">
                      CPF
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={perfil.cpf}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Endereços */}
              <EnderecoForm
                enderecos={perfil.enderecos}
                onChange={(novos) => setPerfil({ ...perfil, enderecos: novos })}
                onAdd={() =>
                  setPerfil({
                    ...perfil,
                    enderecos: [
                      ...perfil.enderecos,
                      { logradouro: "", numero: "", cidade: "", estado: "", cep: "" },
                    ],
                  })
                }
                onRemove={(index) =>
                  setPerfil({
                    ...perfil,
                    enderecos: perfil.enderecos.filter((_, i) => i !== index),
                  })
                }
              />

              {/* Ações */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-semibold transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditarPerfilModal;
