import { useEffect, useState } from "react";
import CarrosselProdutos from "./CarrosselProdutos";
import { Loader2 } from "lucide-react";

const ProdutosDestaque = () => {
  const [destaques, setDestaques] = useState([]);
  const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchDestaques = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/produtos/destaques`);
        if (!res.ok) throw new Error("Erro ao carregar produtos em destaque");
        const data = await res.json();

        // Delay curto para suavizar a transição visual
        setTimeout(() => {
          setDestaques(data);
          setLoading(false);
        }, 700);
      } catch (err) {
        console.error(err);
        setDestaques([]);
        setLoading(false);
      }
    };

    fetchDestaques();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-6 sm:px-10 lg:px-20 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gray-800/50 p-4 shadow-lg flex flex-col gap-3 animate-pulse"
            >
              <div className="w-full aspect-square bg-gray-700 rounded-xl" />
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto" />
              <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto" />
              <div className="h-8 bg-gray-700 rounded w-full mt-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return <CarrosselProdutos titulo="Produtos em Destaque" produtos={destaques} />;
};

export default ProdutosDestaque;
