import { useState, useEffect } from "react";
import { User, LogOut, Package, Mail, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserPanel = () => {
  const [perfil, setPerfil] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/api/perfis/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Não autorizado");
        return res.json();
      })
      .then((data) => {
        console.log("Perfil carregado:", data);
        setPerfil(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!perfil) {
    return (
      <div className="text-center text-gray-400 py-20">Carregando perfil...</div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-6 py-12">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8 w-full max-w-3xl space-y-8">
        {/* Cabeçalho */}
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

        {/* Endereços */}
        <div className="bg-gray-800/50 rounded-2xl p-6 space-y-2">
          <h3 className="text-lg font-semibold text-amber-400">Meus Endereços</h3>
          {perfil.enderecos?.length > 0 ? (
            perfil.enderecos.map((end, i) => (
              <p key={end.id || i}>
                {end.logradouro}, {end.numero} - {end.cidade}/{end.estado} ({end.cep})
                {end.padrao && " ⭐"}
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
    </section>
  );
};

export default UserPanel;
