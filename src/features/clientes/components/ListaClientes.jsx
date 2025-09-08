// src/features/clientes/components/ListaClientes.jsx
import React from 'react';

const ListaClientes = ({ 
  clientes, 
  onEditar, 
  onEliminar, 
  onAbrirFicha 
}) => {

  // Função auxiliar para formatar telefone de forma consistente
  const formatarTelefone = (telefone) => {
    if (!telefone) return null;
    // Remove espaços e caracteres especiais para verificar se é número português
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Se for número português (9 dígitos), formatar como +351 9XX XXX XXX
    if (numeroLimpo.length === 9 && numeroLimpo.startsWith('9')) {
      return `+351 ${numeroLimpo.slice(0, 3)} ${numeroLimpo.slice(3, 6)} ${numeroLimpo.slice(6)}`;
    }
    
    // Para outros formatos, retornar como está
    return telefone;
  };

  // Função para renderizar contactos telefónicos de forma compacta
  const renderContactosTelefonicos = (cliente) => {
    const contactos = [];
    
    if (cliente.telefone) {
      contactos.push({
        tipo: 'Tel',
        numero: formatarTelefone(cliente.telefone),
        icone: '📞'
      });
    }
    
    if (cliente.telemovel) {
      contactos.push({
        tipo: 'Móvel',
        numero: formatarTelefone(cliente.telemovel),
        icone: '📱'
      });
    }
    
    return contactos;
  };

  // Função para obter cor do indicador de estado
  const getCorEstado = (ativo) => {
    return ativo ? '#28a745' : '#dc3545'; // Verde para ativo, vermelho para inativo
  };

  if (!clientes || clientes.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6c757d'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>Nenhum cliente encontrado</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Adicione o primeiro cliente ou ajuste os filtros de pesquisa
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '16px',
      padding: '20px 0'
    }}>
      {clientes.map((cliente) => {
        const contactosTelefonicos = renderContactosTelefonicos(cliente);
        
        return (
          <div
            key={cliente.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              position: 'relative',
              minHeight: '200px', // Altura mínima para normalizar cards
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Indicador de Estado no Canto Superior Direito */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getCorEstado(cliente.ativo),
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />

            {/* Conteúdo Principal - Flex Grow para ocupar espaço disponível */}
            <div style={{ flex: 1, paddingRight: '24px' }}>
              {/* Linha 1: Nome do Cliente */}
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#212529',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {cliente.nome}
                </h3>
              </div>

              {/* Linha 2: NIF e Estado */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '6px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#6c757d',
                    fontWeight: '500'
                  }}>
                    NIF:
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#495057',
                    fontFamily: 'monospace',
                    backgroundColor: '#f8f9fa',
                    padding: '1px 4px',
                    borderRadius: '3px'
                  }}>
                    {cliente.nif}
                  </span>
                </div>
                
                <span style={{
                  fontSize: '10px',
                  color: getCorEstado(cliente.ativo),
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {cliente.ativo ? 'ATIVO' : 'INATIVO'}
                </span>
              </div>

              {/* Linha 3: Email */}
              {cliente.email && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '12px' }}>📧</span>
                  <a
                    href={`mailto:${cliente.email}`}
                    style={{
                      color: '#007bff',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {cliente.email}
                  </a>
                </div>
              )}

              {/* Linha 4: Contactos Telefónicos - Versão Compacta */}
              {contactosTelefonicos.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '10px',
                  flexWrap: 'wrap'
                }}>
                  {contactosTelefonicos.map((contacto, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>{contacto.icone}</span>
                      <a
                        href={`tel:${contacto.numero}`}
                        style={{
                          color: '#28a745',
                          textDecoration: 'none',
                          fontSize: '11px',
                          fontWeight: '500',
                          fontFamily: 'monospace'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contacto.numero}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Linha 5: Localização - Compacta */}
              {(cliente.localidade || cliente.distrito) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '12px' }}>📍</span>
                  <span style={{
                    fontSize: '11px',
                    color: '#6c757d',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {[cliente.localidade, cliente.distrito].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {/* Perfil Logístico - Ultra Compacto */}
              {(cliente.tipos_servico?.length > 0 || cliente.ambito?.length > 0) && (
                <div style={{
                  padding: '6px 8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#495057',
                    marginBottom: '2px'
                  }}>
                    Perfil Logístico:
                  </div>
                  {cliente.tipos_servico?.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#6c757d', marginBottom: '1px' }}>
                      <strong>Serviços:</strong> {cliente.tipos_servico.slice(0, 1).join(', ')}
                      {cliente.tipos_servico.length > 1 && ` +${cliente.tipos_servico.length - 1}`}
                    </div>
                  )}
                  {cliente.ambito?.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#6c757d' }}>
                      <strong>Âmbito:</strong> {cliente.ambito.slice(0, 1).join(', ')}
                      {cliente.ambito.length > 1 && ` +${cliente.ambito.length - 1}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões de Ação como Ícones no Canto Inferior Direito */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              display: 'flex',
              gap: '8px'
            }}>
              {/* Botão Ver Ficha */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAbrirFicha(cliente);
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Ver Ficha Completa"
              >
                👁️
              </button>

              {/* Botão Editar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar(cliente);
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0056b3';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#007bff';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Editar Cliente"
              >
                ✏️
              </button>
              
              {/* Botão Eliminar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminar(cliente);
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b02a37';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Eliminar Cliente"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListaClientes;