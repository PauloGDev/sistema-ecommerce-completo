import { createContext, useContext, useState, useEffect } from "react";

const CarrinhoContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

const defaultOptions = (method = "GET") => ({
  method,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const CarrinhoProvider = ({ children }) => {
  // 🔹 Inicializa como objeto, não como array
  const [carrinho, setCarrinho] = useState({
    itens: [],
    total: 0,
  });

const carregarCarrinho = async () => {
  try {
    const usuarioId = localStorage.getItem("usuarioId"); // exemplo
    const response = await fetch(`${API_URL}/carrinho?usuarioId=${usuarioId}`, defaultOptions());
    if (response.ok) {
      const data = await response.json();
      setCarrinho(data);
      console.log(data)
    }
  } catch (err) {
    console.error("Erro ao carregar carrinho:", err);
  }
};

const limparCarrinho = async () => {
  try {
    const usuarioId = localStorage.getItem("usuarioId");
    const response = await fetch(
      `${API_URL}/carrinho/limpar?usuarioId=${usuarioId}`,
      defaultOptions("POST")
    );
    if (response.ok) {
      const data = await response.json();
      setCarrinho(data); // usa o carrinho atualizado vindo do backend
    }
  } catch (err) {
    console.error("Erro ao limpar carrinho:", err);
  }
};

async function adicionarAoCarrinho(produtoId, variacaoId, quantidade = 1, precoUnitario) {
  const usuarioId = localStorage.getItem("usuarioId");
  const response = await fetch(`${API_URL}/carrinho/adicionar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId, produtoId, variacaoId, quantidade, precoUnitario }),
  });

  if (response.ok) {
    const data = await response.json();
    setCarrinho(data);
  }
}

const incrementarItem = async (produtoId, precoUnitario) => {
  try {
    const usuarioId = localStorage.getItem("usuarioId");
    const response = await fetch(
      `${API_URL}/carrinho/aumentar?usuarioId=${usuarioId}&produtoId=${produtoId}&precoUnitario=${precoUnitario}`,
      defaultOptions("POST")
    );
    if (response.ok) {
      const data = await response.json();
      setCarrinho(data);
    }
  } catch (err) {
    console.error("Erro ao incrementar item:", err);
  }
};

const decrementarItem = async (produtoId, precoUnitario) => {
  try {
    const usuarioId = localStorage.getItem("usuarioId");
    const response = await fetch(
      `${API_URL}/carrinho/diminuir?usuarioId=${usuarioId}&produtoId=${produtoId}&precoUnitario=${precoUnitario}`,
      defaultOptions("POST")
    );
    if (response.ok) {
      const data = await response.json();
      setCarrinho(data);
    }
  } catch (err) {
    console.error("Erro ao decrementar item:", err);
  }
};

  const removerDoCarrinho = async (produtoId) => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      const response = await fetch(
        `${API_URL}/carrinho/remover/${produtoId}?usuarioId=${usuarioId}`,
        defaultOptions("DELETE")
      );
      if (response.ok) {
        const data = await response.json();
        setCarrinho(data);
      }
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };


  useEffect(() => {
    carregarCarrinho();
  }, []);

  return (
    <CarrinhoContext.Provider
      value={{ carrinho, setCarrinho, adicionarAoCarrinho, removerDoCarrinho, incrementarItem, decrementarItem, limparCarrinho}}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => useContext(CarrinhoContext);
