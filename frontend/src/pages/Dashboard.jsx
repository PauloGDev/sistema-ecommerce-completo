import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import PageTitle from "../context/PageTitle";
import GerenciarProdutos from "../components/dashboard/GerenciarProdutos";
import GerenciarUsuarios from "../components/dashboard/GerenciarUsuarios";
import GerenciarPedidos from "../components/dashboard/GerenciarPedidos";
import Sidebar from "../components/dashboard/SideBar";

const Dashboard = () => {
  const [section, setSection] = useState("produtos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Atualiza seção baseada no hash da URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["produtos", "usuarios", "pedidos"].includes(hash)) {
        setSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const changeSection = (key) => {
    window.location.hash = key;
    setSidebarOpen(false);
  };

  const renderSection = {
    produtos: <GerenciarProdutos />,
    usuarios: <GerenciarUsuarios />,
    pedidos: <GerenciarPedidos />,
  }[section];

  return (
    <section className="min-h-screen bg-gray-900 text-white flex">
      {/* Botão mobile */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-amber-400 text-black md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar fixa */}
      <Sidebar
        section={section}
        changeSection={changeSection}
        sidebarOpen={sidebarOpen}
      />

      {/* Conteúdo que rola sozinho */}
      <main className="flex-1 h-screen overflow-y-auto p-8 pt-28 md:pt-20">
        <PageTitle title={`Dashboard | ${section}`} />
        <div className="mt-6">{renderSection}</div>
      </main>
    </section>
  );
};

export default Dashboard;
