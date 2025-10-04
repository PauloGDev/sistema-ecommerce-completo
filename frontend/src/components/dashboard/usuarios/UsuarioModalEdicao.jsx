import { motion } from "framer-motion";
import { X, Eye, EyeOff, User, Mail, Lock, Shield } from "lucide-react";
import { useState } from "react";

const UsuarioModalEdicao = ({
  usuarioSelecionado,
  setUsuarioSelecionado,
  onClose,
  onSave,
}) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="bg-gray-950 text-white p-6 rounded-2xl w-[90%] max-w-xl shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-5">
          <h3 className="text-xl font-bold tracking-wide">
            ✨ Editar Usuário
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex flex-col gap-4">
          <InputField
            icon={<User className="w-4 h-4" />}
            type="text"
            value={usuarioSelecionado.username ?? ""}
            onChange={(e) =>
              setUsuarioSelecionado({ ...usuarioSelecionado, username: e.target.value })
            }
            placeholder="Nome de usuário"
          />

          <InputField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            value={usuarioSelecionado.email ?? ""}
            onChange={(e) =>
              setUsuarioSelecionado({ ...usuarioSelecionado, email: e.target.value })
            }
            placeholder="Email"
          />

          {/* Nova senha */}
          <div className="relative flex items-center">
            <InputField
              icon={<Lock className="w-4 h-4" />}
              type={mostrarSenha ? "text" : "password"}
              value={usuarioSelecionado.novaSenha ?? ""}
              onChange={(e) =>
                setUsuarioSelecionado({
                  ...usuarioSelecionado,
                  novaSenha: e.target.value,
                })
              }
              placeholder="Nova senha (opcional)"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((m) => !m)}
              className="absolute right-3 p-1 text-gray-400 hover:text-white transition"
            >
              {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Cargo */}
          <SelectField
            icon={<Shield className="w-4 h-4" />}
            value={usuarioSelecionado.roles?.[1] ?? "ROLE_USER"}
            onChange={(e) =>
              setUsuarioSelecionado({
                ...usuarioSelecionado,
                roles: [e.target.value],
              })
            }
            options={[
              { value: "ROLE_USER", label: "Usuário" },
              { value: "ROLE_ADMIN", label: "Administrador" },
            ]}
          />

          {/* Status */}
          <SelectField
            icon={<Shield className="w-4 h-4" />}
            value={usuarioSelecionado.status ?? "ATIVO"}
            onChange={(e) =>
              setUsuarioSelecionado({
                ...usuarioSelecionado,
                status: e.target.value,
              })
            }
            options={[
              { value: "ATIVO", label: "Ativo" },
              { value: "INATIVO", label: "Inativo" },
              { value: "BANIDO", label: "Banido" },
            ]}
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold shadow-md"
          >
            Salvar Alterações
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ icon, ...props }) => (
  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border border-white/10 focus-within:border-amber-400 transition">
    <span className="text-amber-400">{icon}</span>
    <input
      {...props}
      className="flex-1 bg-transparent outline-none text-sm"
    />
  </div>
);

const SelectField = ({ icon, value, onChange, options }) => (
  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border border-white/10 focus-within:border-amber-400 transition">
    <span className="text-amber-400">{icon}</span>
    <select
      value={value}
      onChange={onChange}
      className="flex-1 bg-transparent outline-none text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-gray-900">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default UsuarioModalEdicao;
