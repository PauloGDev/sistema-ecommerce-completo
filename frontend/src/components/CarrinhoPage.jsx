import { motion } from "framer-motion";
import PageTitle from "../context/PageTitle";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNotification } from "../context/NotificationContext";
import { useState, useMemo, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { AlertTriangle, Hourglass, Loader2, MinusCircle, PlusCircle, Trash2 } from "lucide-react";

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

  const API_URL = import.meta.env.VITE_API_URL;
   const [fretes, setFretes] = useState([]);
const [freteSelecionado, setFreteSelecionado] = useState(null);
const [enderecoEntrega, setEnderecoEntrega] = useState(null);

  // Dados do cliente
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [perfilId, setPerfilId] = useState("");

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

      try {
        const res = await fetch(`${API_URL}/perfis/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCpf(data.cpf || "");
          setTelefone(data.telefone || "");
          setEmail(data.email || "");
          setNomeCompleto(data.nomeCompleto || "");
          setUsuarioData(data);
          setPerfilId(data.perfilId)
          console.log(data)
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

  const totalComFrete = useMemo(() => {
  const subtotal = carrinho.itens?.reduce(
    (sum, item) => sum + (item?.precoUnitario || 0) * item.quantidade,
    0
  ) || 0;
  const valorFrete = freteSelecionado ? parseFloat(freteSelecionado.price) : 0;
  return subtotal + valorFrete;
}, [carrinho, freteSelecionado]);


  const stripePromise = loadStripe(
    "pk_test_51SGP7P47TnSmtIZzpq8a2ryG0EqF9QEneZsSPtd9JEEkBwqkHvmN9FvSghLqRMfh9Cly1NfI36Ef7BWmeeB9IGlt00XSKBwrrh"
  );

  function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}


const handlePagamento = async () => {
  setPagando(true);
  const token = localStorage.getItem("token");

  if (!enderecoEntrega) {
    showNotification("Selecione um endereço antes de pagar.", "warning");
    setPagando(false);
    return;
  }
  if (!validarCPF(cpf)) {
  showNotification("CPF inválido. Verifique e tente novamente.", "error");
  setPagando(false);
  return;
}

  try {
    const pedido = {
      itens: carrinho.itens.map((i) => ({
        produtoId: i.produtoId,
        nomeProduto: i.nomeProduto,
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

    const pedidoRes = await fetch(`${API_URL}/pedidos/criar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pedido),
    });

    // 🚨 Se deu erro
    if (!pedidoRes.ok) {
      const errorText = await pedidoRes.text();
      if (errorText.includes("CPF inválido")) {
        showNotification("CPF inválido. Verifique os dados e tente novamente.", "error");
      } else {
        showNotification("Erro ao criar pedido.", "error");
      }
      setPagando(false);
      return;
    }

    // ✅ Se deu certo
    const pedidoData = await pedidoRes.json();
    limparCarrinho();
    navigate("/checkout", { state: { total, pedidoId: pedidoData.id } });

  } catch (err) {
    console.error("Erro no pagamento:", err);
    showNotification("Erro inesperado.", "error");
    setPagando(false);
  }
};



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
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-950 text-white">
      <PageTitle title="Carrinho | Sublime Perfumes Fracionados" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="bg-gray-900/80 border border-gray-800 rounded-full p-6 mb-6 shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293 2.707A1 1 0 007.618 17h8.764a1 1 0 00.911-1.293L16 13M7 13V6h13"
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-bold mb-3"
        >
          Seu carrinho está vazio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 mb-8 max-w-md"
        >
          Parece que você ainda não adicionou nenhum perfume. Explore nossa coleção e encontre o aroma perfeito para você.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => navigate("/produtos")}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg shadow-md transition-all duration-300 hover:scale-[1.03]"
          >
            Ver Produtos
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}


  return (
    <div>
      <PageTitle title="Carrinho | Sublime Perfumes Fracionados" />
      <div className="pt-20 px-3 sm:px-[5vw] md:px-[2vw] lg:px-[9vw] py-16 max-w-5xl mx-auto">
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
        <EnderecoEntregaBox fadeUp={fadeUp} onSelect={setEnderecoEntrega} perfilId={perfilId} />

        {fretes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-800 p-4 rounded-xl border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Opções de Frete</h3>
            <div className="flex flex-col gap-2">
              {fretes.map((f) => (
                <label
                  key={f.id}
                  className={`p-3 rounded-lg cursor-pointer border transition ${
                    freteSelecionado?.id === f.id
                      ? "border-amber-500 bg-gray-700"
                      : "border-gray-700 hover:bg-gray-700/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="frete"
                    className="mr-2 accent-amber-500"
                    checked={freteSelecionado?.id === f.id}
                    onChange={() => setFreteSelecionado(f)}
                  />
                  <span className="text-gray-300 font-medium">{f.name}</span>
                  <span className="ml-3 text-amber-400 font-semibold">
                    R$ {f.price.replace(".", ",")}
                  </span>
                  <span className="ml-3 text-sm text-gray-400">
                    {f.delivery_time} dias úteis
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}


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

        <ResumoCarrinho fadeUp={fadeUp} total={totalComFrete} handlePagamento={handlePagamento} />
      </div>
    </div>
  );
};

export default CarrinhoPage;
