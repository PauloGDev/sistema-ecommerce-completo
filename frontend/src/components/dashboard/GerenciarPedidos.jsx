import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Paginacao from "./pedidos/Paginacao";
import TabelaPedidos from "./pedidos/TabelaPedidos";
import FiltroStatus from "./pedidos/FiltroStatus";
import EditarPedidoModal from "./pedidos/EditarPedidoModal";

const GerenciarPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("");
  const [pedidoEdit, setPedidoEdit] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const carregarPedidos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/pedidos?page=${page}&size=10&status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      const data = await res.json();
      setPedidos(data.content || []);
      console.log(pedidos)
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar pedidos", error);
    }
  };

const atualizarPedido = async () => {
  try {
    const token = localStorage.getItem("token");

    // Montar payload no formato do backend
    const payload = {
      usuario: pedidoEdit.usuario ? { id: pedidoEdit.usuario.id } : null,
      itens: (form.itens || []).map((it) => ({
        nomeProduto: it.nome ?? it.nomeProduto,
        quantidade: Number(it.quantidade),
        precoUnitario: Number(it.precoUnitario ?? it.preco ?? 0),
      })),
      total: (form.itens || []).reduce(
        (acc, it) =>
          acc + (Number(it.precoUnitario ?? it.preco ?? 0) * Number(it.quantidade ?? 1)),
        0
      ),
      status: form.status,
      enderecoEntrega: form.enderecoEntrega
        ? { id: form.enderecoEntrega.id }
        : null,
      nomeCompleto: form.nomeCompleto,
      cpf: form.cpf,
      telefone: form.telefone,
      email: form.email,
      linkRastreio: form.linkRastreio || "" 
    };

    const res = await fetch(
      `${API_URL}/pedidos/${pedidoEdit.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Erro ao atualizar pedido");

    setPedidoEdit(null);
    carregarPedidos();
  } catch (error) {
    console.error("Erro ao atualizar pedido", error);
  }
};


useEffect(() => {
  const fetchData = async () => {
    setLoading(true); // <-- Ativa o loading ao começar
    await carregarPedidos();
  };
  fetchData();
}, [page, status]);


  return (
    <div className="p-6 text-gray-200">
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Gerenciar Pedidos
      </motion.h2>

      {/* Filtro de Status */}
      <FiltroStatus status={status} setStatus={setStatus} setPage={setPage} setLoading={setLoading} />

      {/* Tabela de Pedidos */}
      <TabelaPedidos
        pedidos={pedidos}
        setPedidoEdit={setPedidoEdit}
        setForm={setForm}
        loading={loading}
      />

      {/* Paginação */}
      <Paginacao page={page} totalPages={totalPages} setPage={setPage} />

      {/* Modal de Edição */}
      <EditarPedidoModal
        pedidoEdit={pedidoEdit}
        setPedidoEdit={setPedidoEdit}
        form={form}
        setForm={setForm}
        atualizarPedido={atualizarPedido}
      />
    </div>
  );
};

export default GerenciarPedidos;

