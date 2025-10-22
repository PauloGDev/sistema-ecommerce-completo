import { useEffect, useState } from "react";
import api from "../../context/api";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { FaPix } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

const stripePromise = loadStripe(
  "pk_test_51SGP7P47TnSmtIZzpq8a2ryG0EqF9QEneZsSPtd9JEEkBwqkHvmN9FvSghLqRMfh9Cly1NfI36Ef7BWmeeB9IGlt00XSKBwrrh"
);

const API_URL = import.meta.env.VITE_API_URL;

// Hook de polling
function usePagamentoStatus(pedidoId) {
  const [status, setStatus] = useState("PENDENTE");

  useEffect(() => {
    if (!pedidoId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`${API_URL}/pedidos/${pedidoId}/status`);
        if (res.data.status) {
          setStatus(res.data.status);
          if (res.data.status === "PAGO") clearInterval(interval);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pedido:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pedidoId]);

  return status;
}

function CheckoutForm({ amount, pedidoId, itensPedido, onPago }) {
  const stripe = useStripe();
  const elements = useElements();
  const status = usePagamentoStatus(pedidoId);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "PAGO") {
      setMessage("✅ Pagamento aprovado com sucesso!");
      onPago(); // Notifica o componente pai
    }
  }, [status, onPago]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Ocorreu um erro ao processar o pagamento.");
      setLoading(false);
      return;
    }

    if (paymentIntent) {
      try {
        await api.post(`${API_URL}/payment/confirmar/${pedidoId}`, {
          paymentIntentId: paymentIntent.id,
        });
        console.log("🔄 Confirmação enviada ao backend.");
      } catch (err) {
        console.error("Erro ao confirmar pagamento no backend:", err);
      }

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("✅ Pagamento aprovado com sucesso!");
          onPago();
          break;
        case "processing":
          setMessage("⏳ Pagamento em processamento...");
          break;
        case "requires_payment_method":
          setMessage("❌ O pagamento não foi concluído. Tente novamente.");
          break;
        default:
          setMessage("⚠️ Status de pagamento inesperado.");
      }
    }

    setLoading(false);
  };

  const handlePixWhatsApp = () => {
    const whatsappNumber = "5585984642900";
    const produtos = itensPedido
      .map(
        (item) =>
          `🧴 *${item.nomeProduto || item.nome}*\n   Quantidade: ${item.quantidade}x\n   Preço: R$ ${(item.precoUnitario || item.preco)
            .toFixed(2)
            .replace(".", ",")}\n`
      )
      .join("\n");

    const msg = `🛍️ *Pedido #${pedidoId}*\n\nOlá! Gostaria de pagar meu pedido via *Pix* 💸\n\n${produtos}\n💰 *Total: R$ ${amount
      .toFixed(2)
      .replace(".", ",")}*\n\n📍 Aguardo os dados para o pagamento.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || loading}
          className="mt-4 w-full bg-amber-400 text-black font-semibold py-3 rounded-lg hover:bg-amber-300 transition"
        >
          {loading ? "Processando..." : `Pagar R$ ${amount.toFixed(2)}`}
        </button>
      </form>

      {message && <p className="text-green-500 mt-3">{message}</p>}
      {status === "PENDENTE" && (
        <p className="text-yellow-400 text-sm mt-2">
          Aguardando confirmação do pagamento…
        </p>
      )}

      <div className="text-center border-t border-white/10 pt-4">
        <p className="text-sm text-gray-300 mb-3">
          Prefere pagar via Pix direto?
        </p>
        <button
          onClick={handlePixWhatsApp}
          className="flex items-center justify-center gap-2 w-full bg-white text-green-600 font-semibold py-3 rounded-lg border border-green-500 hover:bg-green-50 transition"
        >
          <FaPix className="w-6 h-6 text-[#00BFA5]" />
          Pagar com Pix via WhatsApp
        </button>
      </div>
    </div>
  );
}

export default function PagamentoInline({ total, pedidoId, itensPedido = [] }) {
  const [clientSecret, setClientSecret] = useState("");
  const [pago, setPago] = useState(false);

  useEffect(() => {
    if (!pedidoId || !total) return;

    api
      .post(`${API_URL}/payment/create-payment-intent`, { amount: total, pedidoId })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch((err) => console.error("Erro ao criar PaymentIntent:", err));
  }, [total, pedidoId]);

  const options = {
    appearance: { theme: "night" },
    clientSecret,
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl text-white text-center relative overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Pagamento Seguro</h2>

      <AnimatePresence mode="wait">
        {!pago ? (
          clientSecret ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm
                  amount={total}
                  pedidoId={pedidoId}
                  itensPedido={itensPedido}
                  onPago={() => setPago(true)}
                />
              </Elements>
            </motion.div>
          ) : (
            <p className="text-gray-400 text-sm">Carregando método de pagamento…</p>
          )
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 py-10"
          >
            <FaCheckCircle className="text-green-400 text-6xl animate-bounce" />
            <h3 className="text-2xl font-semibold">Pagamento aprovado!</h3>
            <p className="text-gray-300">Obrigado por comprar com a Sublime Perfumes 💛</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
