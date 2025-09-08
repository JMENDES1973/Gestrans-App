import React, { useState } from "react";
import ListaClientes from "./components/ListaClientes.jsx";
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
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });
  const [filtros, setFiltros] = useState({ pesquisa: '' });
  const [fichaDetalhada, setFichaDetalhada] = useState(null);

  // 🔹 Mostrar notificações
  const mostrarNotificacao = (tipo, mensagem) => {
    setNotificacao({ tipo, mensagem });
    setTimeout(() => setNotificacao(null), 3000);
  };

  // Função para ordenar os clientes baseada no campo e direção selecionados
  const ordenarClientes = (clientes) => {
    return [...clientes].sort((a, b) => {
      let valorA = a[ordenacao.campo];
      let valorB = b[ordenacao.campo];
    
      // Garantir que lidamos corretamente com valores nulos ou undefined
      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';
    
      // Converter para string para comparação consistente
      valorA = valorA.toString().toLowerCase();
      valorB = valorB.toString().toLowerCase();
    
      if (ordenacao.direcao === 'asc') {
        return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      } else {
        return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
      }
    });
  };

  // Função para alterar a ordenação
  const alterarOrdenacao = (novoCampo) => {
    setOrdenacao(prev => ({
      campo: novoCampo,
      direcao: prev.campo === novoCampo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
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

// 🔹 Eliminar cliente - versão corrigida
const handleEliminar = async (cliente) => {
  // O componente ListaClientes.jsx envia o objeto cliente completo
  const clienteId = cliente.id;
  const nomeCliente = cliente.nome;
  
  if (!window.confirm(`Tem a certeza que deseja eliminar o cliente "${nomeCliente}"?`)) {
    return;
  }
  
  try {
    await removerCliente(clienteId);
    mostrarNotificacao("sucesso", "Cliente eliminado com sucesso!");
  } catch (error) {
    console.error("Erro ao eliminar cliente:", error);
    mostrarNotificacao("erro", "Erro ao eliminar cliente: " + error.message);
  }
};

  // 🔹 Renderização

  if (loading) return <p>A carregar clientes...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestão de Clientes</h1>

      {/* Sistema de Notificações Melhorado */}
      {notificacao && (
        <Notificacao
          tipo={notificacao.tipo}
          mensagem={notificacao.mensagem}
          onFechar={() => setNotificacao(null)}
          duracao={4000}  // 4 segundos para dar tempo de ler
        />
      )}


{/* Barra de Ferramentas Unificada */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6',
  flexWrap: 'wrap',
  gap: '12px'
}}>
  {/* Secção de Pesquisa */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1',
    minWidth: '300px'
  }}>
    <span style={{ fontWeight: '500', color: '#495057' }}>Pesquisar:</span>
    <input
      type="text"
      placeholder="Nome, NIF ou email..."
      value={filtros?.pesquisa || ''}
      onChange={(e) => setFiltros(prev => ({ ...prev, pesquisa: e.target.value }))}
      style={{
        padding: '8px 12px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '14px',
        flex: '1',
        maxWidth: '300px',
        transition: 'border-color 0.2s ease'
      }}
      onFocus={(e) => e.target.style.borderColor = '#007bff'}
      onBlur={(e) => e.target.style.borderColor = '#ced4da'}
    />
  </div>

  {/* Secção de Ordenação */}
  <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
    <span style={{ fontWeight: '500', color: '#495057' }}>Ordenar:</span>
    {['nome', 'nif', 'email'].map(campo => (
      <button
        key={campo}
        onClick={() => alterarOrdenacao(campo)}
        style={{
          padding: '6px 12px',
          backgroundColor: ordenacao.campo === campo ? '#007bff' : 'white',
          color: ordenacao.campo === campo ? 'white' : '#495057',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {campo.charAt(0).toUpperCase() + campo.slice(1)}
        {ordenacao.campo === campo && (
          <span style={{ fontSize: '12px' }}>
            {ordenacao.direcao === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>
    ))}
  </div>

  {/* Botão de Nova Acção */}
  <button
    onClick={() => setMostrarFormulario(true)}
    style={{
      padding: '8px 16px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
      whiteSpace: 'nowrap'
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
    onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
  >
    + Novo Cliente
  </button>
</div>

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

      {/* Modal de Ficha Detalhada - 90% do ecrã */}
{fichaDetalhada && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      backgroundColor: 'white',
      width: '90%',
      height: '90%',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Cabeçalho da Ficha */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: '#212529' }}>
            {fichaDetalhada.nome}
          </h2>
          <span style={{
            color: '#6c757d',
            fontSize: '14px'
          }}>
            NIF: {fichaDetalhada.nif}
          </span>
        </div>
        
        <button
          onClick={() => setFichaDetalhada(null)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6c757d',
            padding: '8px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Conteúdo da Ficha */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Informações Básicas */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0, color: '#495057' }}>Informações Básicas</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div><strong>Nome:</strong> {fichaDetalhada.nome}</div>
              <div><strong>NIF:</strong> {fichaDetalhada.nif}</div>
              <div><strong>Email:</strong> {fichaDetalhada.email || 'Não informado'}</div>
              <div><strong>Telefone:</strong> {fichaDetalhada.telefone || 'Não informado'}</div>
              <div><strong>Estado:</strong> 
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  backgroundColor: fichaDetalhada.ativo === false ? '#f8d7da' : '#d4edda',
                  color: fichaDetalhada.ativo === false ? '#721c24' : '#155724',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {fichaDetalhada.ativo === false ? 'Inativo' : 'Ativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0, color: '#495057' }}>Endereço</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div><strong>Morada:</strong> {fichaDetalhada.morada || 'Não informado'}</div>
              <div><strong>Código Postal:</strong> {fichaDetalhada.codigopostal || 'Não informado'}</div>
              <div><strong>Localidade:</strong> {fichaDetalhada.localidade || 'Não informado'}</div>
              <div><strong>Distrito:</strong> {fichaDetalhada.distrito || 'Não informado'}</div>
              <div><strong>País:</strong> {fichaDetalhada.pais || 'Portugal'}</div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {fichaDetalhada.observacoes && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0, color: '#495057' }}>Observações</h3>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{fichaDetalhada.observacoes}</p>
          </div>
        )}
      </div>

      {/* Rodapé com Ações */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => {
            setClienteSelecionado(fichaDetalhada);
            setMostrarFormulario(true);
            setFichaDetalhada(null);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Editar Cliente
        </button>
        
        <button
          onClick={() => setFichaDetalhada(null)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}

   <ListaClientes
  clientes={ordenarClientes(clientes.filter(cliente => {
    if (!filtros.pesquisa) return true;
    const pesquisa = filtros.pesquisa.toLowerCase();
    return cliente.nome.toLowerCase().includes(pesquisa) ||
           cliente.nif.includes(pesquisa) ||
           (cliente.email && cliente.email.toLowerCase().includes(pesquisa));
  }))}
  onEditar={(cliente) => {
    setClienteSelecionado(cliente);
    setMostrarFormulario(true);
  }}
  onEliminar={handleEliminar}
  onAbrirFicha={(cliente) => setFichaDetalhada(cliente)}
/>

</div>
  );
}

export default ClientesPage;

