import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import PageTitle from "../context/PageTitle";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Truck,
  Package,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const statusColors = {
  PENDENTE: "bg-yellow-500 text-black",
  PAGO: "bg-green-500 text-white",
  ENVIADO: "bg-blue-500 text-white",
  ENTREGUE: "bg-emerald-600 text-white",
  CANCELADO: "bg-red-500 text-white",
};

const statusIcons = {
  PENDENTE: <Clock size={14} />,
  PAGO: <CreditCard size={14} />,
  ENVIADO: <Truck size={14} />,
  ENTREGUE: <Package size={14} />,
  CANCELADO: <AlertCircle size={14} />,
};

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const isValidUrl = (url) => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/pedidos/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar pedidos");
        return res.json();
      })
      .then((data) => {
        // ✅ Ordena por data (mais recente primeiro)
        const ordenados = data.sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        );
        console.log("Pedidos recebidos (ordenados):", ordenados);
        setPedidos(ordenados);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const matchSearch =
        pedido.id.toString().includes(search) ||
        pedido.itens.some((item) =>
          item.nomeProduto.toLowerCase().includes(search.toLowerCase())
        );
      const matchStatus =
        statusFilter === "TODOS" || pedido.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pedidos, search, statusFilter]);

  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const pedidosPaginados = pedidosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="pt-20">
      <PageTitle title="Meus Pedidos | Sublime Perfumes" />
      <div className="px-4 sm:px-[5vw] md:px-[2vw] lg:px-[9vw] py-16 max-w-5xl mx-auto">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-3xl font-bold text-white mb-8 flex items-center gap-2"
        >
          <Package size={28} className="text-amber-400" /> Meus Pedidos
        </motion.h1>

        {/* Barra de pesquisa e filtro */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 flex-1">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por número ou produto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent w-full text-sm text-white outline-none"
            />
          </div>

          <select
            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="TODOS">Todos os status</option>
            {Object.keys(statusColors).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">⏳ Carregando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-gray-400">⚠️ Você ainda não possui pedidos.</p>
        ) : pedidosFiltrados.length === 0 ? (
          <p className="text-gray-400">🔍 Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-6">
            {pedidosPaginados.map((pedido, i) => (
              <motion.div
                key={pedido.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.1 }}
                className="border border-gray-700 rounded-xl bg-gradient-to-br from-black via-gray-900 to-black shadow-lg p-5"
              >
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Package size={18} className="text-amber-400" />
                      Pedido #{pedido.id}
                    </h2>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />{" "}
                      {new Date(pedido.data).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full mt-2 sm:mt-0 ${
                      statusColors[pedido.status] || "bg-gray-500 text-white"
                    }`}
                  >
                    {statusIcons[pedido.status]} {pedido.status}
                  </span>
                </div>

                {/* Itens */}
                <div className="divide-y divide-gray-700">
                  {pedido.itens.map((item, idx) => (
                    <div
                      key={`${pedido.id}-${idx}`}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <div>
                          <p className="text-white text-sm">
                            {item.nomeProduto}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.quantidade}x R${" "}
                            {item.precoUnitario.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="text-amber-400 font-bold">
                        R${" "}
                        {(item.quantidade * item.precoUnitario).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total + Ações */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-t border-gray-700 mt-4 pt-3 gap-3">
                  <span className="font-semibold text-white">Total:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold text-lg">
                      R$ {pedido.total.toFixed(2)}
                    </span>

                    {/* Só mostra botão de pagar se estiver PENDENTE ou CANCELADO */}
                    {(pedido.status === "PENDENTE" ||
                      pedido.status === "CANCELADO") && (
                      <button
                        onClick={() =>
                          navigate("/checkout", {
                            state: { total: pedido.total, pedidoId: pedido.id },
                          })
                        }
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1 rounded-lg text-sm transition"
                      >
                        <CreditCard size={16} /> Pagar
                      </button>
                    )}
                  </div>
                </div>

                {/* Rastreio */}
              <div className="mt-4">
                {pedido.status === "ENVIADO" && isValidUrl(pedido.linkRastreio) ? (
                  <a
                    href={
                      pedido.linkRastreio.startsWith("http")
                        ? pedido.linkRastreio
                        : `https://${pedido.linkRastreio}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition transform"
                  >
                    <Truck className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Acompanhar entrega</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg">
                    <Truck size={16} />{" "}
                    <span>
                      {pedido.status === "ENVIADO"
                        ? "Aguardando atualização do rastreio..."
                        : pedido.status === "ENTREGUE" || pedido.status === "CONCLUIDO"
                        ? "Pedido entregue com sucesso!"
                        : pedido.status === "CANCELADO"
                        ? "Pedido cancelado, tente novamente."
                        : "Aguarde, seu pedido ainda não foi enviado."}
                    </span>
                  </div>
                )}
              </div>


              </motion.div>
            ))}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-lg text-white text-sm disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-gray-400 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-lg text-white text-sm disabled:opacity-50"
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosPage;
