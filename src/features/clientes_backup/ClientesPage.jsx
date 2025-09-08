import React, { useState } from "react";
import ListaClientes from "./components/ListaClientes";
import FormularioCliente from "./components/FormularioCliente";
import Notificacao from "./components/Notificacao";
import { useClientes } from "./hooks/useClientes";

function ClientesPage() {
  // hook customizado
  const {
    clientes,
    loading,
    erro,
    criarCliente,
    editarCliente,
    removerCliente,
  } = useClientes();

  const [notificacao, setNotificacao] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // 🔹 Mostrar notificações
  const mostrarNotificacao = (tipo, mensagem) => {
    setNotificacao({ tipo, mensagem });
    setTimeout(() => setNotificacao(null), 3000);
  };

  // 🔹 Adicionar cliente
  const handleAdicionar = async (novoCliente) => {
    try {
      await criarCliente(novoCliente);
      mostrarNotificacao("sucesso", "Cliente adicionado com sucesso!");
      setMostrarFormulario(false);
    } catch {
      mostrarNotificacao("erro", "Erro ao adicionar cliente");
    }
  };

  // 🔹 Editar cliente
  const handleEditar = async (id, dadosAtualizados) => {
    try {
      await editarCliente(id, dadosAtualizados);
      mostrarNotificacao("sucesso", "Cliente atualizado com sucesso!");
      setClienteSelecionado(null);
      setMostrarFormulario(false);
    } catch {
      mostrarNotificacao("erro", "Erro ao atualizar cliente");
    }
  };

  // 🔹 Eliminar cliente
  const handleEliminar = async (id) => {
    if (!window.confirm("Tem a certeza que deseja eliminar este cliente?"))
      return;

    try {
      await removerCliente(id);
      mostrarNotificacao("sucesso", "Cliente eliminado com sucesso!");
    } catch {
      mostrarNotificacao("erro", "Erro ao eliminar cliente");
    }
  };

  // 🔹 Renderização
  if (loading) return <p>A carregar clientes...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestão de Clientes</h1>

      {notificacao && (
        <Notificacao
          tipo={notificacao.tipo}
          mensagem={notificacao.mensagem}
          onFechar={() => setNotificacao(null)}
        />
      )}

      <button onClick={() => setMostrarFormulario(true)}>+ Novo Cliente</button>

      {mostrarFormulario && (
        <FormularioCliente
          cliente={clienteSelecionado}
          onCancelar={() => {
            setMostrarFormulario(false);
            setClienteSelecionado(null);
          }}
          onSalvar={(dados) =>
            clienteSelecionado
              ? handleEditar(clienteSelecionado.id, dados)
              : handleAdicionar(dados)
          }
        />
      )}

      <ListaClientes
        clientes={clientes}
        onEditar={(cliente) => {
          setClienteSelecionado(cliente);
          setMostrarFormulario(true);
        }}
        onEliminar={(cliente) => handleEliminar(cliente.id)}
      />
    </div>
  );
}

export default ClientesPage;

