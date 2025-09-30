import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Loader2 } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !senha) {
      setMensagem("⚠️ Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      setMensagem("");

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: senha }),
      });

      if (!res.ok) throw new Error("Credenciais inválidas");

      const data = await res.json();
      localStorage.setItem("token", data.token);

      setMensagem("✅ Login realizado com sucesso!");
      navigate("/dashboard"); // Redireciona para o dashboard
    } catch (err) {
      setMensagem("❌ Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <LogIn className="w-7 h-7 text-amber-400" /> Login
        </h1>

        {mensagem && (
          <p className="text-center text-sm mb-4">{mensagem}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-gray-300">Usuário</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-amber-400 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">Senha</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-amber-400 outline-none"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold py-3 rounded-lg hover:bg-amber-300 transition"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Entrando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Entrar
              </>
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default Register;
