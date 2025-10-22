import { useState, useEffect } from "react";
import { User, LogOut, Package, Mail, Edit, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditarPerfilModal from "./painel-usuario/EditarPerfilModal";

const UserPanel = () => {
  const [perfil, setPerfil] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    carregarPerfil();
  }, [navigate]);

  const carregarPerfil = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/perfis/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Não autorizado");
        return res.json();
      })
      .then((data) => {
        setTimeout(() => {
          setPerfil(data);
          setLoading(false);
        }, 600);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  };

  const handleSave = (perfilAtualizado) => {
    const token = localStorage.getItem("token");
    setSaving(true);
    fetch(`${API_URL}/perfis/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(perfilAtualizado),
    })
      .then((res) => res.json())
      .then(() => {
        setModalOpen(false);
        carregarPerfil();
      })
      .finally(() => setSaving(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white animate-fade-in">
        <div className="bg-white/10 p-8 rounded-2xl w-full max-w-3xl space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-700 rounded w-1/4" />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 space-y-3">
            <div className="h-5 bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-3/4" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-700 rounded-xl" />
            <div className="h-12 bg-gray-700 rounded-xl" />
          </div>

          <div className="flex justify-center mt-6">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // 🔸 PERFIL NÃO ENCONTRADO
  if (!perfil) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-white/10 p-8 rounded-2xl text-center max-w-md">
          <User className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Perfil não encontrado</h2>
          <p className="text-gray-400 mb-4">
            Você ainda não configurou seu perfil. Complete suas informações para continuar.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition"
          >
            Criar meu perfil
          </button>
        </div>

        <EditarPerfilModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          perfilAtual={perfil}
          onSave={handleSave}
        />
      </section>
    );
  }

  // 🔸 PERFIL CARREGADO
  return (
    <section className="relative min-h-screen bg-gray-900 text-white flex items-center justify-center px-6 py-12 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8 w-full max-w-3xl space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <User className="w-14 h-14 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold">
                Olá, {perfil.nomeCompleto || perfil.username}!
              </h2>
              <p className="text-amber-400">Telefone: {perfil.telefone || "-"}</p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {perfil.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 transition"
          >
            <Edit className="w-4 h-4" /> Editar
          </button>
        </div>

        {/* Endereços */}
        <div className="bg-gray-800/50 rounded-2xl p-6 space-y-2">
          <h3 className="text-lg font-semibold text-amber-400">Meus Endereços</h3>
          {perfil.enderecos?.length > 0 ? (
            perfil.enderecos.map((end, i) => (
              <p key={end.id || i} className="flex items-center gap-2">
                {end.logradouro}, {end.numero} - {end.cidade}/{end.estado} ({end.cep})
                {end.padrao && <Star className="w-4 h-4 text-amber-400" />}
              </p>
            ))
          ) : (
            <p className="text-gray-400">Nenhum endereço cadastrado</p>
          )}
        </div>

        {/* Ações */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/meus-pedidos")}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition"
          >
            <Package className="w-5 h-5" /> Meus Pedidos
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </div>

      {/* 🔹 Overlay de Loading Global (salvando ou processando) */}
      {saving && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
          <p className="text-gray-200 text-sm">Salvando alterações...</p>
        </div>
      )}

      <EditarPerfilModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        perfilAtual={perfil}
        onSave={handleSave}
      />
    </section>
  );
};

export default UserPanel;
