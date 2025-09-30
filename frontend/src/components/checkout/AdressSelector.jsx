import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Mapeia os campos técnicos -> labels amigáveis
const labels = {
  logradouro: "Rua",
  numero: "Número",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  cep: "CEP",
};

const AddressSelector = ({ onSelect }) => {
  const { showNotification } = useNotification();
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [novoEndereco, setNovoEndereco] = useState({
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    const fetchEnderecos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:8080/api/enderecos/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setEnderecos(data);
          if (data.length > 0) {
            const padrao = data.find((e) => e.padrao) || data[0];
            setEnderecoSelecionado(padrao);
            onSelect(padrao);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar endereços:", err);
      }
    };

    fetchEnderecos();
  }, []);

  const handleSelect = (endereco) => {
    setEnderecoSelecionado(endereco);
    onSelect(endereco);
  };

  const handleDefinirPadrao = async (endereco) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `http://localhost:8080/api/enderecos/${endereco.id}/padrao`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Erro ao definir endereço padrão");

      const enderecoAtualizado = await response.json();

      const novosEnderecos = enderecos.map((e) =>
        e.id === enderecoAtualizado.id
          ? { ...e, padrao: true }
          : { ...e, padrao: false }
      );

      setEnderecos(novosEnderecos);
      setEnderecoSelecionado(enderecoAtualizado);
      onSelect(enderecoAtualizado);
      showNotification("✅ Endereço definido como padrão!", "success");
    } catch (err) {
      console.error(err);
      showNotification("❌ Erro ao definir endereço padrão.", "error");
    }
  };

  const handleSalvarEndereco = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8080/api/enderecos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoEndereco),
      });

      if (!response.ok) throw new Error("Erro ao salvar endereço");

      const enderecoSalvo = await response.json();
      setEnderecos([...enderecos, enderecoSalvo]);
      setEnderecoSelecionado(enderecoSalvo);
      onSelect(enderecoSalvo);

      showNotification("✅ Endereço adicionado com sucesso!", "success");
      setAdicionando(false);
      setNovoEndereco({
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      });
    } catch (err) {
      console.error(err);
      showNotification("❌ Erro ao adicionar endereço.", "error");
    }
  };

  return (
    <div className="mb-10">
      {/* Lista de endereços */}
      {enderecos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {enderecos.map((endereco) => (
            <motion.div
              key={endereco.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              onClick={() => handleSelect(endereco)}
              className={`p-5 rounded-xl cursor-pointer shadow-md transition-all border relative
                ${
                  enderecoSelecionado?.id === endereco.id
                    ? "bg-gray-900 border-amber-500 ring-2 ring-amber-400"
                    : "bg-gradient-to-br from-gray-950 to-gray-900 border-gray-700 hover:border-amber-400"
                }`}
            >
              <div>
                <p className="font-medium text-white">
                  {endereco.logradouro}, {endereco.numero}
                </p>
                <p className="text-sm text-gray-400">
                  {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                </p>
                <p className="text-sm text-gray-400">CEP {endereco.cep}</p>
              </div>

              <div className="mt-3 flex justify-between items-center">
                {endereco.padrao ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-semibold">
                    ⭐ Padrão
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDefinirPadrao(endereco);
                    }}
                    className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                  >
                    Definir como Padrão
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Botão adicionar novo */}
      <button
        onClick={() => setAdicionando(!adicionando)}
        className="mt-6 flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg shadow hover:bg-amber-600 transition"
      >
        {adicionando ? "✖ Cancelar" : "➕ Adicionar Novo Endereço"}
      </button>

      {/* Formulário de novo endereço */}
      {adicionando && (
        <div className="mt-6 space-y-4 bg-gray-950 p-6 rounded-lg border border-gray-800 shadow-lg">
          {Object.keys(novoEndereco).map((campo) => (
            <div key={campo} className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">
                {labels[campo] || campo}
              </label>
              <input
                type="text"
                placeholder={labels[campo] || campo}
                value={novoEndereco[campo]}
                onChange={(e) =>
                  setNovoEndereco({ ...novoEndereco, [campo]: e.target.value })
                }
                className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          ))}
          <button
            onClick={handleSalvarEndereco}
            className="w-full py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            💾 Salvar Endereço
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
