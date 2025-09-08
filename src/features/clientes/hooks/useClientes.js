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
      console.log("DEBUG clientes carregados:", data);
      setClientes(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setErro("Erro ao carregar clientes. Verifique a conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar cliente
  const criarCliente = async (novoCliente) => {
    try {
      // Validação básica antes de enviar
      if (!novoCliente.nome?.trim()) {
        throw new Error("Nome é obrigatório");
      }
      if (!novoCliente.nif?.trim()) {
        throw new Error("NIF é obrigatório");
      }

      const cliente = await clientesService.adicionarCliente(novoCliente);
      setClientes((prev) => [cliente, ...prev]); // Adicionar no início
      return cliente;
    } catch (err) {
      console.error("Erro ao criar cliente:", err);
      throw new Error(err.message || "Erro ao adicionar cliente");
    }
  };

  // Atualizar cliente
  const editarCliente = async (id, dadosAtualizados) => {
    try {
      // Validação básica antes de enviar
      if (!dadosAtualizados.nome?.trim()) {
        throw new Error("Nome é obrigatório");
      }
      if (!dadosAtualizados.nif?.trim()) {
        throw new Error("NIF é obrigatório");
      }

      const clienteAtualizado = await clientesService.atualizarCliente(id, dadosAtualizados);
      setClientes((prev) =>
        prev.map((c) => (c.id === id ? clienteAtualizado : c))
      );
      return clienteAtualizado;
    } catch (err) {
      console.error("Erro ao editar cliente:", err);
      throw new Error(err.message || "Erro ao atualizar cliente");
    }
  };

  // Eliminar cliente
  const removerCliente = async (id) => {
    try {
      await clientesService.eliminarCliente(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao remover cliente:", err);
      throw new Error(err.message || "Erro ao eliminar cliente");
    }
  };

  // Buscar cliente por ID
  const buscarClientePorId = (id) => {
    return clientes.find(cliente => cliente.id === id);
  };

  // Estatísticas dos clientes - aqui está a melhoria principal!
  const estatisticas = {
    total: clientes.length,
    ativos: clientes.filter(c => c.ativo !== false).length,
    inativos: clientes.filter(c => c.ativo === false).length,
    empresas: clientes.filter(c => c.tipo === 'Empresa').length,
    particulares: clientes.filter(c => c.tipo === 'Particular').length
  };

  // Carregar ao montar
  useEffect(() => {
    carregarClientes();
  }, []);

  return {
    clientes,
    loading,
    erro,
    estatisticas, // Nova funcionalidade!
    carregarClientes,
    criarCliente,
    editarCliente,
    removerCliente,
    buscarClientePorId // Nova funcionalidade!
  };
};
