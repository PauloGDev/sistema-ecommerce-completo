// src/components/produto/ProdutosRelacionados.jsx
import { useEffect, useState } from "react";
import CarrosselProdutos from "./CarrosselProdutos";

const ProdutosRelacionados = ({ produtoId, categoriaId }) => {
  const [relacionados, setRelacionados] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRelacionados = async () => {
      try {
        const res = await fetch(`${API_URL}/produtos/categoria/${categoriaId}`);
        if (!res.ok) throw new Error("Erro ao carregar relacionados");
        const data = await res.json();
        setRelacionados(data.filter((p) => p.id !== produtoId));
      } catch (err) {
        console.error(err);
        setRelacionados([]);
      }
    };
    if (categoriaId) fetchRelacionados();
  }, [produtoId, categoriaId]);

  return <CarrosselProdutos titulo="🛍️ Produtos Relacionados" produtos={relacionados} />;
};

export default ProdutosRelacionados;
