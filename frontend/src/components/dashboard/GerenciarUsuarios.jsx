// src/components/dashboard/GerenciarUsuarios.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Eye, EyeOff, Trash2, Plus } from "lucide-react";

const statusColors = {
  ATIVO: "bg-green-500/20 text-green-400",
  INATIVO: "bg-gray-500/20 text-gray-400",
  BANIDO: "bg-red-500/20 text-red-400",
};

const API_URL = "http://localhost:8080/api/usuarios";

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    username: "",
    email: "",
    password: "",
    roles: ["USER"], // precisa ser array
    status: "ATIVO",
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Buscar usuários da API
  useEffect(() => {
    fetchUsuarios();
  }, [page, filtro]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `${API_URL}?page=${page}&size=5${filtro ? `&status=${filtro}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      const data = await res.json();
      setUsuarios(data.content);
      setTotalPages(data.totalPages);
      console.log(data.content)
    } catch (err) {
      console.error("Erro no fetchUsuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (usuario) => {
    setUsuarioSelecionado({ ...usuario, novaSenha: "" }); // campo para redefinição
    setMostrarSenha(false);
    setModalOpen(true);
  };

  const salvarAlteracoes = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { ...usuarioSelecionado };

      // se foi preenchida, envia como password
      if (usuarioSelecionado.novaSenha?.trim()) {
        payload.password = usuarioSelecionado.novaSenha;
      }
      delete payload.novaSenha;

      // garantir que roles seja array
      if (typeof payload.roles === "string") {
        payload.roles = [payload.roles];
      }

      const res = await fetch(`${API_URL}/${usuarioSelecionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao salvar alterações");
      await fetchUsuarios();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const excluirUsuario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir usuário");
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
    }
  };

  const criarUsuario = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = { ...novoUsuario };
      if (typeof payload.roles === "string") {
        payload.roles = [payload.roles]; // backend espera array
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao criar usuário");
      await fetchUsuarios();
      setModalNovo(false);
      setNovoUsuario({
        username: "",
        email: "",
        password: "",
        roles: ["ROLES_USER"],
        status: "ATIVO",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section>
      {/* Header animado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 mb-6"
      >
        <div className="flex items-center gap-3">
          <User className="w-7 h-7 text-amber-400" />
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold"
        >
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </motion.div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10"
        >
          <option value="">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="BANIDO">Banido</option>
        </select>
      </div>

      {/* Tabela */}
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
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
                  Carregando usuários...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              usuarios.map((u, index) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-white/10"
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
                  <td className="px-4 py-3 text-right flex gap-2 justify-end">
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
              ))
            )}
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

      {/* Modal de edição */}
      <AnimatePresence>
        {modalOpen && usuarioSelecionado && (
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
                <h3 className="text-xl font-bold">Editar Usuário</h3>
                <button onClick={() => setModalOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={usuarioSelecionado.username ?? ""}
                  onChange={(e) =>
                    setUsuarioSelecionado({
                      ...usuarioSelecionado,
                      username: e.target.value,
                    })
                  }
                  className="bg-gray-800 px-3 py-2 rounded-lg"
                  placeholder="Usuário"
                />
                <input
                  type="email"
                  value={usuarioSelecionado.email ?? ""}
                  onChange={(e) =>
                    setUsuarioSelecionado({
                      ...usuarioSelecionado,
                      email: e.target.value,
                    })
                  }
                  className="bg-gray-800 px-3 py-2 rounded-lg"
                  placeholder="Email"
                />

                {/* Nova senha */}
                <div className="flex items-center gap-2">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={usuarioSelecionado.novaSenha ?? ""}
                    onChange={(e) =>
                      setUsuarioSelecionado({
                        ...usuarioSelecionado,
                        novaSenha: e.target.value,
                      })
                    }
                    className="bg-gray-800 px-3 py-2 rounded-lg flex-1"
                    placeholder="Nova senha (opcional)"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((m) => !m)}
                    className="p-2 bg-gray-700 rounded-lg"
                  >
                    {mostrarSenha ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <select
                  value={usuarioSelecionado.roles?.[0] ?? "ROLE_USER"}
                  onChange={(e) =>
                    setUsuarioSelecionado({
                      ...usuarioSelecionado,
                      roles: [e.target.value], // garantir array
                    })
                  }
                  className="bg-gray-800 px-3 py-2 rounded-lg"
                >
                  <option value="ROLE_USER">Usuário</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
                <select
                  value={usuarioSelecionado.status ?? "ATIVO"}
                  onChange={(e) =>
                    setUsuarioSelecionado({
                      ...usuarioSelecionado,
                      status: e.target.value,
                    })
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
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarAlteracoes}
                  className="px-4 py-2 bg-amber-400 text-black rounded-lg font-semibold"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de novo usuário */}
      <AnimatePresence>
        {modalNovo && (
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
                <button onClick={() => setModalNovo(false)}>
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
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarUsuario}
                  className="px-4 py-2 bg-green-500 text-black rounded-lg font-semibold"
                >
                  Criar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GerenciarUsuarios;
