// src/features/clientes/services/clientesService.js
import { supabase } from "../../../supabaseClient";

export const clientesService = {
  // 🔹 Buscar todos os clientes
  fetchClientes: async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");

    if (error) {
      console.error("Erro ao carregar clientes:", error);
      throw error;
    }

    return data || []; // 👈 devolve sempre array
  },

  // 🔹 Adicionar cliente
  adicionarCliente: async (cliente) => {
    const clienteProcessado = {
      ...cliente,
      nome: cliente.nome.toUpperCase(),
      email: cliente.email ? cliente.email.toLowerCase() : null,
    };

    const { data, error } = await supabase
      .from("clientes")
      .insert([clienteProcessado])
      .select();

    if (error) {
      console.error("Erro ao adicionar cliente:", error);
      throw error;
    }

    return data[0]; // 👈 devolve só o cliente criado
  },

  // 🔹 Atualizar cliente
  atualizarCliente: async (id, dadosAtualizados) => {
    const clienteProcessado = {
      ...dadosAtualizados,
      nome: dadosAtualizados.nome.toUpperCase(),
      email: dadosAtualizados.email
        ? dadosAtualizados.email.toLowerCase()
        : null,
    };

    const { data, error } = await supabase
      .from("clientes")
      .update(clienteProcessado)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }

    return data[0]; // 👈 devolve cliente atualizado
  },

  // 🔹 Eliminar cliente
  eliminarCliente: async (id) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) {
      console.error("Erro ao eliminar cliente:", error);
      throw error;
    }

    return true; // 👈 só confirma que apagou
  },
};
