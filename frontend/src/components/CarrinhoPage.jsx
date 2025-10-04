// src/pages/CarrinhoPage.jsx
import { motion } from "framer-motion";
import PageTitle from "../context/PageTitle";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNotification } from "../context/NotificationContext";
import { useState, useMemo, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { AlertTriangle, Hourglass, Loader2, MinusCircle, PlusCircle, Trash2 } from "lucide-react";

// Components
import CarrinhoLista from "../components/carrinho/CarrinhoLista";
import EnderecoEntregaBox from "../components/carrinho/EnderecoEntregaBox";
import DadosClienteForm from "../components/carrinho/DadosClienteForm";
import ResumoCarrinho from "../components/carrinho/ResumoCarrinho";

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
  } = useCarrinho();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const usuarioId = localStorage.getItem("usuarioId");
if (!usuarioId) {
  showNotification(
    <><AlertTriangle className="inline w-4 h-4 mr-1" /> Você precisa estar logado para finalizar a compra</>, 
    "error"
  );
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
          produtoId: i.produtoId,
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
      <div className="text-center py-20 text-gray-400 flex flex-col items-center">
      <Hourglass className="w-8 h-8 animate-spin mb-3" />
      <p>Carregando carrinho...</p>
    </div>

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
        <CarrinhoLista
          itens={carrinho.itens}
          fadeUp={fadeUp}
          incrementar={(id) => {
          incrementarItem(id);
          showNotification(<><PlusCircle className="inline w-4 h-4 mr-1" /> Produto atualizado</>, "info");
        }}
          decrementar={(id) => {
          decrementarItem(id);
          showNotification(<><MinusCircle className="inline w-4 h-4 mr-1" /> Produto atualizado</>, "info");
        }}
        remover={(id) => {
          removerDoCarrinho(id);
          showNotification(<><Trash2 className="inline w-4 h-4 mr-1" /> Produto removido do carrinho</>, "error");
        }}
        />

        {/* Endereço */}
        <EnderecoEntregaBox fadeUp={fadeUp} onSelect={setEnderecoEntrega} />

        {/* Dados do Cliente */}
        <DadosClienteForm
          fadeUp={fadeUp}
          nomeCompleto={nomeCompleto}
          setNomeCompleto={setNomeCompleto}
          cpf={cpf}
          setCpf={setCpf}
          telefone={telefone}
          setTelefone={setTelefone}
          email={email}
          setEmail={setEmail}
          usuarioData={usuarioData}
          editarTelefone={editarTelefone}
          setEditarTelefone={setEditarTelefone}
          editarEmail={editarEmail}
          setEditarEmail={setEditarEmail}
        />

        {/* Resumo */}
        <ResumoCarrinho fadeUp={fadeUp} total={total} handlePagamento={handlePagamento} />
      </div>
    </div>
  );
};

export default CarrinhoPage;
