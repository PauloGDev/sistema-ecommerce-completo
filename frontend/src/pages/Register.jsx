import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Loader2 } from "lucide-react";
import { IMaskInput } from "react-imask";

const Register = () => {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [email, setEmail] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enderecos, setEnderecos] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const validarSenha = (senha) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (username.length < 6) {
      setMensagem("⚠️ O nome de usuário deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!validarSenha(senha)) {
      setMensagem(
        "⚠️ A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("⚠️ As senhas não coincidem.");
      return;
    }

    if (!email) {
      setMensagem("⚠️ O e-mail é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      setMensagem("");

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: senha,
          email,
          nomeCompleto,
          telefone,
          cpf,
          enderecos,
        }),
      });

      const data = await res.text();
      if (!res.ok) throw new Error(data);

      setMensagem("✅ Registro realizado com sucesso!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMensagem("❌ Erro ao registrar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-amber-400" /> Registrar
        </h1>

        {mensagem && <p className="text-center text-sm mb-4">{mensagem}</p>}

        <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Usuário */}
          <div className="sm:col-span-2">
            <label className="block mb-1 text-gray-300 text-sm">Usuário</label>
            <input
              type="text"
              placeholder="Escolha um nome de usuário"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">E-mail</label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              required
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">Nome Completo</label>
            <input
              type="text"
              placeholder="Seu nome completo"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
          </div>

          {/* CPF */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              placeholder="000.000.000-00"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={cpf}
              onAccept={(value) => setCpf(value)}
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">Telefone</label>
            <IMaskInput
              mask="(00) 00000-0000"
              placeholder="(00) 00000-0000"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={telefone}
              onAccept={(value) => setTelefone(value)}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block mb-1 text-gray-300 text-sm">Confirmar Senha</label>
            <input
              type="password"
              placeholder="Repita sua senha"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 outline-none text-sm"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {/* Botão */}
          <div className="sm:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold py-3 rounded-lg hover:bg-amber-300 transition text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Registrar
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  );
};

export default Register;
