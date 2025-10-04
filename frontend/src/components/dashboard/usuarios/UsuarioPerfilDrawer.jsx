import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Shield } from "lucide-react";

const UsuarioPerfilDrawer = ({ perfil, onClose }) => {
  if (!perfil) return null;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose} // 🔹 fecha ao clicar no fundo
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{  duration: 0.25, ease: "easeOut"  }}
        className="fixed inset-y-0 right-0 w-[420px] bg-gray-950 text-white z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()} // 🔹 evita fechar ao clicar dentro
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 bg-gray-900">
          <h3 className="text-lg font-semibold tracking-wide">Perfil do Usuário</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Dados principais */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-lg font-bold uppercase">
              {perfil.username?.[0] ?? "?"}
            </div>
            <div>
              <p className="text-xl font-bold">{perfil.username}</p>
              <p className="text-sm text-gray-400">{perfil.email}</p>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-3">
            <InfoItem icon={<User />} label="Nome" value={perfil.nome || "—"} />
            <InfoItem icon={<Mail />} label="Email" value={perfil.email || "—"} />
            <InfoItem icon={<Phone />} label="Telefone" value={perfil.telefone || "—"} />
            <InfoItem icon={<Shield />} label="Status" value={perfil.status} />
          </div>

          {/* Endereços */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Endereços</h4>
            {perfil.enderecos?.length > 0 ? (
              <ul className="space-y-3">
                {perfil.enderecos.map((e) => (
                  <li
                    key={e.id}
                    className="p-3 bg-gray-800/70 rounded-lg border border-white/5"
                  >
                    <p className="font-medium">{e.logradouro}, {e.numero}</p>
                    <p className="text-sm text-gray-400">
                      {e.bairro}, {e.cidade}/{e.estado} • {e.cep}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum endereço cadastrado.</p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-800/70 p-3 rounded-lg border border-white/5">
    <div className="text-amber-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default UsuarioPerfilDrawer;
