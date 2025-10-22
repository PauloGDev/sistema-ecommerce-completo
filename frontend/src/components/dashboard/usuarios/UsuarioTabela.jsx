import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const statusColors = {
  ATIVO: "bg-green-500/20 text-green-400",
  INATIVO: "bg-gray-500/20 text-gray-400",
  BANIDO: "bg-red-500/20 text-red-400",
};

// Skeleton Row para usuários
const SkeletonUsuarioRow = ({ index }) => {
  const columnWidths = ["10%", "25%", "30%", "15%", "10%", "20%"]; // larguras diferentes por coluna
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-t border-white/10"
    >
      {columnWidths.map((w, i) => (
        <td key={i} className="px-4 py-3">
          {i === 3 ? (
            // Simula tag de status
            <motion.div
              className="h-4 rounded-full bg-gray-600"
              style={{ width: w }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.1 }}
            />
          ) : i === 5 ? (
            // Simula botões de ação
            <div className="flex gap-2 justify-end">
              <motion.div
                className="h-4 rounded bg-gray-600"
                style={{ width: "40%" }}
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
            // Colunas de texto
            <motion.div
              className="h-4 bg-gray-600 rounded"
              style={{ width: w }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: i * 0.1 }}
            />
          )}
        </td>
      ))}
    </motion.tr>
  );
};

const UsuarioTabela = ({
  usuarios,
  loading,
  page,
  totalPages,
  setPage,
  abrirModal,
  excluirUsuario,
  abrirPerfil,
}) => {
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonUsuarioRow key={i} index={i} />)
              : usuarios.length === 0
              ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )
              : usuarios.map((u, index) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-white/10 cursor-pointer hover:bg-white/5"
                    onClick={() => abrirPerfil(u.id)}
                  >
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          statusColors[u.status] || "bg-gray-600/20 text-gray-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-bold ${
                        u.roles?.includes("ROLE_ADMIN")
                          ? "text-amber-400"
                          : "text-green-600"
                      }`}
                    >
                      {u.roles?.includes("ROLE_ADMIN") ? "Admin" : "Usuário"}
                    </td>
                    <td
                      className="px-4 py-3 text-right flex gap-2 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => abrirModal(u)}
                        className="px-3 py-1 rounded-md bg-amber-400 text-black font-semibold hover:bg-amber-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirUsuario(u.id)}
                        className="px-3 py-1 rounded-md bg-red-500 text-white font-semibold hover:bg-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {page + 1} de {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </>
  );
};

export default UsuarioTabela;
