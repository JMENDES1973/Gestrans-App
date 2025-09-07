// src/features/clientes/ClientesPage.js
import React, { useState } from "react";
import useClientes from "./hooks/useClientes";

// Estes componentes ainda vais criar dentro de src/features/clientes/components/
import ListaClientes from "./components/ListaClientes";
import FormularioCliente from "./components/FormularioCliente";
import ModalCliente from "./components/ModalCliente";
import Notificacao from "./components/Notificacao";

const ClientesPage = () => {
  const {
    clientes,
    carregarClientes,
    adicionarCliente,
    atualizarCliente,
    apagarCliente,
    erro,
  } = useClientes();

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [notificacao, setNotificacao] = useState(null);

  const handleAdicionar = async (dados) => {
    try {
      await adicionarCliente(dados);
      setNotificacao({ tipo: "sucesso", mensagem: "Cliente adicionado!" });
      setMostrarModal(false);
    } catch (e) {
      setNotificacao({ tipo: "erro", mensagem: "Erro ao adicionar cliente." });
    }
  };

  const handleAtualizar = async (dados) => {
    try {
      await atualizarCliente(clienteSelecionado.id, dados);
      setNotificacao({ tipo: "sucesso", mensagem: "Cliente atualizado!" });
      setClienteSelecionado(null);
      setMostrarModal(false);
    } catch (e) {
      setNotificacao({ tipo: "erro", mensagem: "Erro ao atualizar cliente." });
    }
  };

  const handleApagar = async (id) => {
    try {
      await apagarCliente(id);
      setNotificacao({ tipo: "sucesso", mensagem: "Cliente removido!" });
    } catch (e) {
      setNotificacao({ tipo: "erro", mensagem: "Erro ao remover cliente." });
    }
  };

  return (
    <div>
      <h1>Gestão de Clientes</h1>

      <button onClick={() => setMostrarModal(true)}>Novo Cliente</button>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <ListaClientes
        clientes={clientes}
        onEditar={(cliente) => {
          setClienteSelecionado(cliente);
          setMostrarModal(true);
        }}
        onApagar={handleApagar}
      />

      <ModalCliente
        aberto={mostrarModal}
        onFechar={() => {
          setMostrarModal(false);
          setClienteSelecionado(null);
        }}
      >
        <FormularioCliente
          cliente={clienteSelecionado}
          onGuardar={clienteSelecionado ? handleAtualizar : handleAdicionar}
        />
      </ModalCliente>

      {notificacao && (
        <Notificacao
          tipo={notificacao.tipo}
          mensagem={notificacao.mensagem}
          onFechar={() => setNotificacao(null)}
        />
      )}
    </div>
  );
};

export default ClientesPage;
