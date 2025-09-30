// src/context/CarrinhoContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CarrinhoContext = createContext();

const API = "http://localhost:8080/api/carrinho";

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
    const response = await fetch(`${API}?usuarioId=${usuarioId}`, defaultOptions());
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
      `${API}/limpar?usuarioId=${usuarioId}`,
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


const incrementarItem = async (produtoId) => {
  try {
    const usuarioId = localStorage.getItem("usuarioId");
    const response = await fetch(
      `${API}/adicionar?usuarioId=${usuarioId}&produtoId=${produtoId}`,
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

const decrementarItem = async (produtoId) => {
  try {
    const usuarioId = localStorage.getItem("usuarioId");
    const response = await fetch(
      `${API}/diminuir?usuarioId=${usuarioId}&produtoId=${produtoId}`,
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



    const adicionarAoCarrinho = async (produtoId, quantidade = 1) => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      const response = await fetch(
        `${API}/adicionar?usuarioId=${usuarioId}&produtoId=${produtoId}&quantidade=${quantidade}`,
        defaultOptions("POST")
      );
      if (response.ok) {
        const data = await response.json();
        setCarrinho(data);
      }
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    }
  };

  const removerDoCarrinho = async (produtoId) => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      const response = await fetch(
        `${API}/remover/${produtoId}?usuarioId=${usuarioId}`,
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
