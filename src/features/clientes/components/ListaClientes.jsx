// src/features/clientes/components/ListaClientes.jsx
import React from "react";

const ListaClientes = ({ clientes, onEditar, onEliminar, onAbrirFicha }) => {
  // Verificação de estado vazio com apresentação melhorada
  if (!clientes || clientes.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ color: '#6c757d', marginBottom: '8px' }}>
          Nenhum cliente registado
        </h3>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Adicione o primeiro cliente para começar
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho com estatísticas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#495057', 
          fontSize: '18px' 
        }}>
          Clientes ({clientes.length})
        </h3>
      </div>

      {/* Grid de Cards - Layout responsivo que se adapta ao tamanho do ecrã */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => onAbrirFicha && onAbrirFicha(cliente)}
            // Efeitos de hover que indicam interatividade
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Cabeçalho do Card - versão limpa */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 4px 0',
                  color: '#212529',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {cliente.nome}
                </h4>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  backgroundColor: cliente.ativo === false ? '#f8d7da' : '#d4edda',
                  color: cliente.ativo === false ? '#721c24' : '#155724',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {cliente.ativo === false ? 'Inativo' : 'Ativo'}
                </span>
              </div>
            </div>

            {/* Informações do Cliente organizadas com ícones */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                <strong style={{ 
                  color: '#495057', 
                  minWidth: '60px',
                  marginRight: '8px'
                }}>
                  NIF:
                </strong>
                <span style={{ color: '#212529' }}>
                  {cliente.nif}
                </span>
              </div>

              {cliente.email && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <strong style={{ 
                    color: '#495057', 
                    minWidth: '60px',
                    marginRight: '8px'
                  }}>
                    Email:
                  </strong>
                  <span style={{ color: '#212529' }}>
                    {cliente.email}
                  </span>
                </div>
              )}

              {cliente.telefone && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <strong style={{ 
                    color: '#495057', 
                    minWidth: '60px',
                    marginRight: '8px'
                  }}>
                    Tel:
                  </strong>
                  <span style={{ color: '#212529' }}>
                    {cliente.telefone}
                  </span>
                </div>
              )}
            </div>

            {/* Área de Ações com indicação discreta */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #e9ecef'
            }}>
              <span style={{
                fontSize: '11px',
                color: '#adb5bd',
                fontStyle: 'italic'
              }}>
                Clique no card para detalhes
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditar(cliente);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  Editar
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminar(cliente);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaClientes;
