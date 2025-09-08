// src/features/clientes/hooks/useClientes.js
import { useState, useEffect } from "react";
import { clientesService } from "../services/clientesService";

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Carregar clientes
  const carregarClientes = async () => {
  setLoading(true);
  setErro(null);
  try {
    const data = await clientesService.fetchClientes();
    console.log("DEBUG clientes carregados:", data); // 👈
    setClientes(data);
  } catch (err) {
    console.error("Erro ao carregar clientes:", err);
    setErro("Erro ao carregar clientes");
  } finally {
    setLoading(false);
  }
};

  // Adicionar cliente
  const criarCliente = async (novoCliente) => {
    try {
      const cliente = await clientesService.adicionarCliente(novoCliente);
      setClientes((prev) => [...prev, cliente]);
      return cliente;
    } catch (err) {
      throw new Error("Erro ao adicionar cliente");
    }
  };

  // Atualizar cliente
  const editarCliente = async (id, dadosAtualizados) => {
    try {
      const clienteAtualizado = await clientesService.atualizarCliente(id, dadosAtualizados);
      setClientes((prev) =>
        prev.map((c) => (c.id === id ? clienteAtualizado : c))
      );
      return clienteAtualizado;
    } catch (err) {
      throw new Error("Erro ao atualizar cliente");
    }
  };

  // Eliminar cliente
  const removerCliente = async (id) => {
    try {
      await clientesService.eliminarCliente(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      throw new Error("Erro ao eliminar cliente");
    }
  };

  // Carregar ao montar
  useEffect(() => {
    carregarClientes();
  }, []);

  return {
    clientes,
    loading,
    erro,
    carregarClientes,
    criarCliente,
    editarCliente,
    removerCliente,
  };
};
