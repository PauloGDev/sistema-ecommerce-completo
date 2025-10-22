import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PageTitle from "../../context/PageTitle";
import PagamentoInline from "./PagamentoInline";
import api from "../../context/api";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { total, pedidoId } = location.state || {};

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!pedidoId || !total) {
      navigate("/carrinho");
      return;
    }

    const fetchPedido = async () => {
      try {
        const res = await api.get(`${API_URL}/pedidos/${pedidoId}`);
        setPedido(res.data);
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [pedidoId, total, navigate]);

  return (
    <motion.div
      className="max-w-5xl mx-auto py-20 px-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <PageTitle title="Checkout | Sublime Perfumes Fracionados" />

      {/* Cabeçalho */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold text-white tracking-tight">
          Finalizar Pagamento
        </h1>
        <p className="text-gray-300 mt-3 text-sm max-w-md mx-auto leading-relaxed">
          Revise seu pedido e conclua sua compra com segurança.
        </p>
      </div>

      {/* RESUMO + PAGAMENTO lado a lado no desktop */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* RESUMO DO PEDIDO */}
        <div className="bg-white/10 border border-white/10 shadow-xl rounded-2xl p-8 text-white transition-all duration-500 hover:shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-3">
            Resumo do Pedido
          </h2>

          {loading ? (
            <p className="text-gray-400">Carregando itens...</p>
          ) : (
            <>
              {pedido?.itens?.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between py-4 border-b border-white/10"
                >
                  <div className="flex items-center gap-4">
                    {/* Imagem responsiva e arredondada */}
                    <img
                      src={item.imagemUrl}
                      alt={item.nomeProduto}
                      className="w-16 h-16 object-cover rounded-lg border border-white/10"
                    />
                    <div>
                      <p className="font-medium text-sm sm:text-base">{item.nomeProduto}</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-amber-400 font-semibold text-sm sm:text-base">
                    R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                  </span>
                </motion.div>
              ))}

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-amber-400">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* PAGAMENTO */}
        <div className="bg-white/10 border border-white/10 shadow-xl rounded-2xl p-8 text-white transition-all duration-500 hover:shadow-2xl">
          {loading ? (
            <p className="text-gray-400">Carregando pagamento...</p>
          ) : pedido ? (
            <>
              <PagamentoInline
                total={total}
                pedidoId={pedidoId}
                itensPedido={pedido.itens}
              />
              <p className="text-sm pt-8 text-gray-300 mb-5 leading-relaxed">
                Insira os dados do seu cartão e finalize a compra. Todas as transações são
                criptografadas e protegidas pela Stripe.
              </p>
            </>
          ) : (
            <p className="text-red-400">
              Erro ao carregar o pedido. Tente novamente.
            </p>
          )}
        </div>

      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Pagamentos processados com segurança pela{" "}
        <span className="text-white font-medium">Stripe</span>.
      </p>
    </motion.div>
  );
};

export default CheckoutPage;
