import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const statusColors = {
  ATIVO: "bg-green-500/20 text-green-400",
  INATIVO: "bg-gray-500/20 text-gray-400",
  BANIDO: "bg-red-500/20 text-red-400",
};

const UsuarioRow = ({ usuario, index, onEditar, onExcluir, onPerfil }) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border-t border-white/10 cursor-pointer hover:bg-white/5"
    onClick={() => onPerfil(usuario)}
  >
    <td className="px-4 py-3">{usuario.id}</td>
    <td className="px-4 py-3">{usuario.username}</td>
    <td className="px-4 py-3">{usuario.email}</td>
    <td className="px-4 py-3">
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          statusColors[usuario.status] || "bg-gray-600/20 text-gray-300"
        }`}
      >
        {usuario.status}
      </span>
    </td>
    <td
      className={`px-4 py-3 font-bold ${
        usuario.roles?.includes("ROLE_ADMIN")
          ? "text-amber-400"
          : "text-green-600"
      }`}
    >
      {usuario.roles?.includes("ROLE_ADMIN") ? "Admin" : "Usuário"}
    </td>
    <td
      className="px-4 py-3 text-right flex gap-2 justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onEditar(usuario)}
        className="px-3 py-1 rounded-md bg-amber-400 text-black font-semibold hover:bg-amber-300"
      >
        Editar
      </button>
      <button
        onClick={() => onExcluir(usuario.id)}
        className="px-3 py-1 rounded-md bg-red-500 text-white font-semibold hover:bg-red-400"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </td>
  </motion.tr>
);

export default UsuarioRow;
