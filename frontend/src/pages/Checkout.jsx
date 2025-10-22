// src/pages/CheckoutPage.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTitle from "../context/PageTitle";
import { useNotification } from "../context/NotificationContext";
import { useState, useMemo, useEffect } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import AddressSelector from "../components/checkout/AdressSelector";
import { IMaskInput } from "react-imask"; // 🔥 substitui o react-input-mask
import { loadStripe } from "@stripe/stripe-js";


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const paymentOptions = [
  { id: "card", label: "Cartão de Crédito/Débito", icon: "💳" },
  { id: "pix", label: "Pix", icon: "⚡" },
  { id: "boleto", label: "Boleto Bancário", icon: "📄" },
  { id: "wallet", label: "Google Pay / Apple Pay", icon: "📱" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { carrinho, setCarrinho  } = useCarrinho();

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
    const API_URL = import.meta.env.VITE_API_URL;


  // Buscar usuário logado
  useEffect(() => {
    const fetchUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCpf(data.cpf || "");
          setTelefone(data.telefone || "");
          setEmail(data.email || "");
          setNomeCompleto(data.nomeCompleto || "");
          setUsuarioData(data); // guarda para fallback
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

const stripePromise = loadStripe("pk_test_51SC4XyFbXZ2pkRLwnxYuyQ3L1lzXrALcqAZpIjNvIR1DB8aNrjZJJmHR3W1tl8ZuwGvB8yUk9vTgjYXjqb0ICdrP00t3onuoFq"); // 🔑 sua PUBLIC KEY do Stripe

const handlePagamento = async () => {
  const token = localStorage.getItem("token");

  if (!enderecoEntrega) {
    showNotification("⚠️ Selecione um endereço antes de pagar.", "warning");
    return;
  }
  if (!cpf || !nomeCompleto) {
    showNotification("⚠️ Nome completo e CPF são obrigatórios.", "warning");
    return;
  }

  // 1️⃣ Cria o pedido
  const pedido = {
    itens: carrinho.itens.map((i) => ({
      nome: i.nomeProduto,
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

  const pedidoRes = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pedido),
  });

  if (!pedidoRes.ok) {
    showNotification("❌ Erro ao criar pedido.", "error");
    return;
  }

  const pedidoData = await pedidoRes.json();

  // 2️⃣ Cria sessão Stripe
const checkoutRes = await fetch(`${API_URL}/pedidos/${pedidoData.id}/checkout`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});


const checkoutData = await checkoutRes.json();
if (checkoutData.error) {
  showNotification("❌ Erro ao iniciar pagamento.", "error");
  return;
}

// CheckoutPage.jsx
const stripe = await stripePromise;

// limpa o backend
await fetch(`${API_URL}/carrinho/limpar?usuarioId=${localStorage.getItem("usuarioId")}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});

// limpa o frontend
setCarrinho({ itens: [], total: 0 });

await stripe.redirectToCheckout({ sessionId: checkoutData.id });


};

  if (!carrinho.itens || carrinho.itens.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        ⚠️ Seu carrinho está vazio.
        <br />
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
        >
          Voltar às Compras
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Checkout | Sublime Perfumes Fracionados" />
      <div className="px-3 sm:px-[5vw] md:px-[2vw] lg:px-[9vw] py-16 max-w-5xl mx-auto">
        {/* Título */}
        <motion.h1
          initial="hidden"
          whileInView="show"
          variants={fadeUp}
          viewport={{ once: true }}
          className="text-3xl text-white font-bold mb-8"
        >
          Checkout
        </motion.h1>

        {/* Endereço */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-10 border bg-gradient-to-br from-black to-gray-900 rounded-lg p-4 text-gray-200"
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
          className="mb-10 border bg-gradient-to-br from-black to-gray-900 rounded-lg p-6 text-gray-200"
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

          {/* Telefone (opcional) */}
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

          {/* Email (opcional) */}
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

        {/* Itens */}
        <div className="space-y-4">
          {carrinho.itens.map((item, i) => (
            <motion.div
              key={item.produtoId || i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between border bg-gradient-to-br from-black to-gray-900 rounded-lg p-4 drop-shadow-lg"
            >
              <div>
                <p className="font-semibold text-white">{item.nomeProduto}</p>
                <p className="text-sm text-gray-200">
                  {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                </p>
              </div>
              <span className="text-amber-400 font-bold">
                R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Pagamento */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10"
        >
          <h2 className="text-xl text-white font-semibold mb-6">
            Escolha o método de pagamento
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`cursor-pointer flex items-center space-x-4 border rounded-xl p-6 transition-all
                  ${
                    paymentMethod === option.id
                      ? "bg-amber-500 border-amber-600 text-white shadow-lg scale-[1.02]"
                      : "bg-gradient-to-br from-black to-gray-900 text-gray-200 hover:scale-[1.01] hover:border-amber-500"
                  }`}
              >
                <span className="text-3xl">{option.icon}</span>
                <span className="font-semibold">{option.label}</span>
              </div>
            ))}
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

export default CheckoutPage;
