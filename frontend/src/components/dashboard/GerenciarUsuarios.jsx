import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Plus } from "lucide-react";
import UsuarioTabela from "./usuarios/UsuarioTabela";
import UsuarioPerfilDrawer from "./usuarios/UsuarioPerfilDrawer";
import UsuarioModalNovo from "./usuarios/UsuarioModalNovo";
import UsuarioModalEdicao from "./usuarios/UsuarioModalEdicao";
import ConfirmDialog from "./ConfirmDialog";

  const API_URL = import.meta.env.VITE_API_URL;
const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [novoUsuario, setNovoUsuario] = useState({
    username: "",
    email: "",
    password: "",
    roles: ["ROLE_USER"],
    status: "ATIVO",
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perfil, setPerfil] = useState(null);
const [confirmOpen, setConfirmOpen] = useState(false);
const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, [page, filtro]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `${API_URL}/usuarios?page=${page}&size=5${filtro ? `&status=${filtro}` : ""}`;
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

  const abrirPerfil = async (usuarioId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/perfis/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar perfil");
      const data = await res.json();
      setPerfil(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Criar novo usuário
const criarUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novoUsuario),
    });

    if (!res.ok) throw new Error("Erro ao criar usuário");
    await fetchUsuarios(); // recarrega lista
    setModalNovo(false);
    setNovoUsuario({
      username: "",
      email: "",
      password: "",
      roles: ["ROLE_USER"],
      status: "ATIVO",
    });
  } catch (err) {
    console.error("Erro criarUsuario:", err);
  }
};

// Atualizar usuário existente
const atualizarUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    const body = { ...usuarioSelecionado };

    // Se não informar novaSenha, mantém a antiga
    if (body.novaSenha) {
      body.password = body.novaSenha;
    }
    delete body.novaSenha;

    const res = await fetch(`${API_URL}/usuarios/${usuarioSelecionado.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Erro ao atualizar usuário");
    await fetchUsuarios();
    setModalOpen(false);
    setUsuarioSelecionado(null);
  } catch (err) {
    console.error("Erro atualizarUsuario:", err);
  }
};

const confirmarExclusao = (id) => {
  setUsuarioParaExcluir(id);
  setConfirmOpen(true);
};

const excluirUsuario = async () => {
  if (!usuarioParaExcluir) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/usuarios/${usuarioParaExcluir}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Erro ao excluir usuário");
    await fetchUsuarios();
  } catch (err) {
    console.error("Erro excluirUsuario:", err);
  } finally {
    setConfirmOpen(false);
    setUsuarioParaExcluir(null);
  }
};


  return (
    <section>
      {/* Header */}
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
      <UsuarioTabela
        usuarios={usuarios}
        loading={loading}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        abrirModal={(u) => { setUsuarioSelecionado(u); setModalOpen(true); }}
        excluirUsuario={(id) => confirmarExclusao(id)}
        abrirPerfil={abrirPerfil}
      />
      
      <ConfirmDialog
  open={confirmOpen}
  title="Excluir Usuário"
  message="Tem certeza que deseja excluir este usuário? Essa ação não poderá ser desfeita."
  onConfirm={excluirUsuario}
  onCancel={() => setConfirmOpen(false)}
/>


      {/* Modais */}
      <AnimatePresence>
        {modalOpen && usuarioSelecionado && (
          <UsuarioModalEdicao
            usuarioSelecionado={usuarioSelecionado}
            setUsuarioSelecionado={setUsuarioSelecionado}
            onClose={() => setModalOpen(false)}
            onSave={atualizarUsuario}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalNovo && (
          <UsuarioModalNovo
            novoUsuario={novoUsuario}
            setNovoUsuario={setNovoUsuario}
            onClose={() => setModalNovo(false)}
            onCreate={() => criarUsuario()}
          />
        )}
      </AnimatePresence>

      {/* Drawer de perfil */}
      <AnimatePresence>
        {perfil && (
          <UsuarioPerfilDrawer perfil={perfil} onClose={() => setPerfil(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GerenciarUsuarios;
