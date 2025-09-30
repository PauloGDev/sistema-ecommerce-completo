// src/pages/CarrinhoPage.jsx
import { motion } from "framer-motion";
import PageTitle from "../context/PageTitle";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNotification } from "../context/NotificationContext";
import { useState, useMemo, useEffect } from "react";
import AddressSelector from "../components/checkout/AdressSelector";
import { IMaskInput } from "react-imask";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react"; // spinner animado

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const CarrinhoPage = () => {
  const {
    carrinho,
    incrementarItem,
    decrementarItem,
    removerDoCarrinho,
    loading,
    limparCarrinho,
    setCarrinho,
  } = useCarrinho();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) {
    showNotification("⚠️ Você precisa estar logado para finalizar a compra", "error");
    localStorage.removeItem("token");
    navigate("/login");
    return;
  }

  // Endereço
  const [enderecoEntrega, setEnderecoEntrega] = useState(null);

  // Dados do cliente
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Backup vindo do usuário logado
  const [usuarioData, setUsuarioData] = useState({});

  // Controles para edição opcional
  const [editarTelefone, setEditarTelefone] = useState(false);
  const [editarEmail, setEditarEmail] = useState(false);

  // Tela de carregamento pagamento
  const [pagando, setPagando] = useState(false);

  // Buscar usuário logado
  useEffect(() => {
    const fetchUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8080/api/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCpf(data.cpf || "");
          setTelefone(data.telefone || "");
          setEmail(data.email || "");
          setNomeCompleto(data.nomeCompleto || "");
          setUsuarioData(data);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    };
    fetchUsuario();
  }, []);

  // calcula total
  const total = useMemo(
    () =>
      carrinho.itens?.reduce(
        (sum, item) => sum + (item?.precoUnitario || 0) * item.quantidade,
        0
      ) || 0,
    [carrinho]
  );

  const stripePromise = loadStripe("pk_test_51SC4XyFbXZ2pkRLwnxYuyQ3L1lzXrALcqAZpIjNvIR1DB8aNrjZJJmHR3W1tl8ZuwGvB8yUk9vTgjYXjqb0ICdrP00t3onuoFq");

const handlePagamento = async () => {
  setPagando(true);
  const token = localStorage.getItem("token");

  if (!enderecoEntrega) {
    showNotification("⚠️ Selecione um endereço antes de pagar.", "warning");
    setPagando(false);
    return;
  }
  if (!cpf || !nomeCompleto) {
    showNotification("⚠️ Nome completo e CPF são obrigatórios.", "warning");
    setPagando(false);
    return;
  }

  try {
    // 1️⃣ Cria o pedido
    const pedido = {
      itens: carrinho.itens.map((i) => ({
        produtoId: i.produtoId, // 👈 necessário para o backend
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
      })),
      total,
      enderecoId: enderecoEntrega.id,
      nomeCompleto,
      cpf,
      telefone: editarTelefone ? telefone : usuarioData.telefone || telefone || "",
      email: editarEmail ? email : usuarioData.email || email || "",
    };

    const pedidoRes = await fetch("http://localhost:8080/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pedido),
    });

    if (!pedidoRes.ok) {
      showNotification("❌ Erro ao criar pedido.", "error");
      setPagando(false);
      return;
    }

    const pedidoData = await pedidoRes.json();

    // 2️⃣ Inicia checkout Stripe
    const checkoutRes = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoData.id}/checkout`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const checkoutData = await checkoutRes.json();
    if (checkoutData.error) {
      showNotification("❌ Erro ao iniciar pagamento.", "error");
      setPagando(false);
      return;
    }

    const stripe = await stripePromise;
    limparCarrinho();
    await stripe.redirectToCheckout({ sessionId: checkoutData.id });
  } catch (err) {
    console.error("Erro no pagamento:", err);
    showNotification("❌ Erro inesperado.", "error");
    setPagando(false);
  }
};

  // 🔥 Tela de carregamento full-screen
  if (pagando) {
    return (
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 text-white z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 size={70} className="text-amber-400" />
        </motion.div>
        <motion.p
          className="mt-6 text-lg font-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Redirecionando para o pagamento seguro...
        </motion.p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">⏳ Carregando carrinho...</div>
    );
  }

  if (!carrinho || carrinho.itens?.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <PageTitle title="Carrinho | Sublime Perfumes Fracionados" />
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-6"
        >
          🛒 Seu carrinho está vazio
        </motion.h1>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Carrinho | Sublime Perfumes Fracionados" />
      <div className="px-3 sm:px-[5vw] md:px-[2vw] lg:px-[9vw] py-16 max-w-5xl mx-auto">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl text-white font-bold mb-8"
        >
          Meu Carrinho
        </motion.h1>

        {/* Lista de itens */}
        <div className="space-y-4">
          {carrinho.itens.map((item, i) => (
            <motion.div
              key={item.produtoId}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between border bg-gradient-to-br from-black to-gray-900 rounded-lg p-4 drop-shadow-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`/imagens/produtos/${item.produtoId}.jpg`}
                  alt={item.nomeProduto}
                  className="w-16 h-16 object-contain rounded-md"
                />
                <div>
                  <p className="font-semibold text-white">{item.nomeProduto}</p>
                  <p className="text-sm text-gray-200">
                    R$ {item.precoUnitario.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    decrementarItem(item.produtoId);
                    showNotification("➖ Produto atualizado", "info");
                  }}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>

                <span className="min-w-[24px] text-center text-white">
                  {item.quantidade}
                </span>

                <button
                  onClick={() => {
                    incrementarItem(item.produtoId);
                    showNotification("➕ Produto atualizado", "info");
                  }}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  removerDoCarrinho(item.produtoId);
                  showNotification("🗑️ Produto removido do carrinho", "error");
                }}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </motion.div>
          ))}
        </div>

        {/* Endereço */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 border bg-gradient-to-br from-black to-gray-900 rounded-lg p-4 text-gray-200"
        >
          <h2 className="text-lg font-semibold text-white mb-2">
            Endereço de Entrega
          </h2>
          <AddressSelector onSelect={setEnderecoEntrega} />
        </motion.div>

        {/* Dados do Cliente */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 border bg-gradient-to-br from-black to-gray-900 rounded-lg p-6 text-gray-200"
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Dados do Cliente
          </h2>

          {/* Nome Completo */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Nome Completo</label>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Seu nome completo"
            />
          </div>

          {/* CPF */}
          <div className="mb-4">
            <label className="block text-sm mb-1">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              value={cpf}
              onAccept={(value) => setCpf(value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="000.000.000-00"
            />
          </div>

          {/* Telefone */}
          <div className="mb-4">
            <label className="block text-sm mb-1 flex justify-between items-center">
              <span>Telefone (opcional)</span>
              {!editarTelefone && (
                <button
                  onClick={() => setEditarTelefone(true)}
                  className="text-amber-400 text-lg hover:underline"
                >
                  Editar
                </button>
              )}
            </label>
            {editarTelefone ? (
              <IMaskInput
                mask="+55 00 0 0000-0000"
                value={telefone}
                onAccept={(value) => setTelefone(value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                placeholder="+55 11 9 9999-9999"
              />
            ) : (
              <div className="p-2 rounded bg-gray-800 text-gray-300">
                {usuarioData.telefone || "Nenhum telefone cadastrado"}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm mb-1 flex justify-between items-center">
              <span>E-mail (opcional)</span>
              {!editarEmail && (
                <button
                  onClick={() => setEditarEmail(true)}
                  className="text-amber-400 text-lg hover:underline"
                >
                  Editar
                </button>
              )}
            </label>
            {editarEmail ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
                placeholder="seu@email.com"
              />
            ) : (
              <div className="p-2 rounded bg-gray-800 text-gray-300">
                {usuarioData.email || "Nenhum e-mail cadastrado"}
              </div>
            )}
          </div>
        </motion.div>

        {/* Resumo */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 border-t pt-6 flex justify-between items-center"
        >
          <span className="text-xl font-bold text-amber-400">
            Total: R$ {total.toFixed(2)}
          </span>
          <button
            onClick={handlePagamento}
            className="px-8 py-4 text-lg bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
          >
            Pagar Agora
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CarrinhoPage;
