// src/components/produto/ProdutosRelacionados.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProdutosRelacionados = ({ produtoId, categoriaId }) => {
  const [relacionados, setRelacionados] = useState([]);

  useEffect(() => {
    const fetchRelacionados = async () => {
      try {
        // exemplo: buscar produtos pela mesma categoria, mas diferente ID
        const res = await fetch(`http://localhost:8080/api/produtos/categoria/${categoriaId}`);
        if (!res.ok) throw new Error("Erro ao carregar relacionados");
        const data = await res.json();

        // filtra o produto atual
        const filtrados = data.filter((p) => p.id !== produtoId);

        setRelacionados(filtrados);
      } catch (err) {
        console.error(err);
        setRelacionados([]);
      }
    };

    if (categoriaId) fetchRelacionados();
  }, [produtoId, categoriaId]);

  if (relacionados.length === 0) return null;

  return (
    <div className="mt-16 px-6 sm:px-10 lg:px-20">
      <h2 className="text-2xl font-bold text-white mb-6">
        Você também pode gostar
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {relacionados.map((p) => (
          <Link
            key={p.id}
            to={`/produtos/${p.slug}`}
            className="bg-gray-900 rounded-xl shadow-lg hover:scale-105 transition transform overflow-hidden"
          >
            <img
              src={p.imagemUrl}
              alt={p.nome}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white truncate">
                {p.nome}
              </h3>
              <p className="text-amber-400 font-bold mt-2">
                R$ {p.precoBase?.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProdutosRelacionados;
