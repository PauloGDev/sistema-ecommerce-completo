import { motion } from "framer-motion";
import { X } from "lucide-react";

const UsuarioModalNovo = ({
  novoUsuario,
  setNovoUsuario,
  onClose,
  onCreate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-900 text-white p-6 rounded-xl w-[90%] max-w-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Novo Usuário</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={novoUsuario.username}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, username: e.target.value })
            }
            className="bg-gray-800 px-3 py-2 rounded-lg"
            placeholder="Usuário"
          />
          <input
            type="email"
            value={novoUsuario.email}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, email: e.target.value })
            }
            className="bg-gray-800 px-3 py-2 rounded-lg"
            placeholder="Email"
          />
          <input
            type="password"
            value={novoUsuario.password}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, password: e.target.value })
            }
            className="bg-gray-800 px-3 py-2 rounded-lg"
            placeholder="Senha"
          />
          <select
            value={novoUsuario.roles[0]}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, roles: [e.target.value] })
            }
            className="bg-gray-800 px-3 py-2 rounded-lg"
          >
            <option value="ROLE_USER">Usuário</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select>
          <select
            value={novoUsuario.status}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, status: e.target.value })
            }
            className="bg-gray-800 px-3 py-2 rounded-lg"
          >
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BANIDO">Banido</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-green-500 text-black rounded-lg font-semibold"
          >
            Criar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UsuarioModalNovo;
