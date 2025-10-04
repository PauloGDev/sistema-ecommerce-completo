import { motion } from "framer-motion";
import { IMaskInput } from "react-imask";

const DadosClienteForm = ({
  fadeUp,
  nomeCompleto,
  setNomeCompleto,
  cpf,
  setCpf,
  telefone,
  setTelefone,
  email,
  setEmail,
  usuarioData,
  editarTelefone,
  setEditarTelefone,
  editarEmail,
  setEditarEmail,
}) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mt-10 border bg-gradient-to-br from-black to-gray-900 rounded-lg p-6 text-gray-200"
    >
      <h2 className="text-lg font-semibold text-white mb-4">Dados do Cliente</h2>

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
          <span>Telefone (padrão)</span>
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
          <span>E-mail (padrão)</span>
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
  );
};

export default DadosClienteForm;
