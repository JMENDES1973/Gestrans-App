// src/features/clientes/services/clientesService.js
import { supabase } from "../../../supabaseClient";

export const clientesService = {
  // Buscar todos os clientes
  fetchClientes: async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Erro Supabase ao carregar clientes:", error);
        throw new Error(`Erro na base de dados: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error("Erro no serviço de clientes:", err);
      throw err;
    }
  },

  // Adicionar cliente
  adicionarCliente: async (cliente) => {
    try {
      const clienteProcessado = {
        ...cliente,
        nome: cliente.nome?.trim().toUpperCase(),
        email: cliente.email?.trim().toLowerCase() || null,
        nif: cliente.nif?.replace(/\D/g, ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("clientes")
        .insert([clienteProcessado])
        .select();

      if (error) {
        console.error("Erro Supabase ao adicionar cliente:", error);
        if (error.code === '23505') {
          throw new Error("Já existe um cliente com este NIF");
        }
        throw new Error(`Erro na base de dados: ${error.message}`);
      }

      return data[0];
    } catch (err) {
      console.error("Erro no serviço ao adicionar cliente:", err);
      throw err;
    }
  },

  // Atualizar cliente
  atualizarCliente: async (id, dadosAtualizados) => {
    try {
      const clienteProcessado = {
        ...dadosAtualizados,
        nome: dadosAtualizados.nome?.trim().toUpperCase(),
        email: dadosAtualizados.email?.trim().toLowerCase() || null,
        nif: dadosAtualizados.nif?.replace(/\D/g, ''),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("clientes")
        .update(clienteProcessado)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Erro Supabase ao atualizar cliente:", error);
        if (error.code === '23505') {
          throw new Error("Já existe um cliente com este NIF");
        }
        throw new Error(`Erro na base de dados: ${error.message}`);
      }

      return data[0];
    } catch (err) {
      console.error("Erro no serviço ao atualizar cliente:", err);
      throw err;
    }
  },

  // Eliminar cliente
  eliminarCliente: async (id) => {
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro Supabase ao eliminar cliente:", error);
        throw new Error(`Erro na base de dados: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error("Erro no serviço ao eliminar cliente:", err);
      throw err;
    }
  }
};
