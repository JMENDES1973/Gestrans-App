// src/features/clientes/components/FichaDetalhadaCliente.jsx
import React from 'react';

const FichaDetalhadaCliente = ({ cliente, onFechar, onEditar }) => {
  // Função auxiliar para formatar data de forma legível
  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função auxiliar para formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return null;
    const numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 9 && numeroLimpo.startsWith('9')) {
      return `+351 ${numeroLimpo.slice(0, 3)} ${numeroLimpo.slice(3, 6)} ${numeroLimpo.slice(6)}`;
    }
    return telefone;
  };

  // Função para renderizar badge de estado
  const renderBadgeEstado = (ativo) => (
    <span style={{
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      backgroundColor: ativo ? '#d4edda' : '#f8d7da',
      color: ativo ? '#155724' : '#721c24',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: `2px solid ${ativo ? '#c3e6cb' : '#f5c6cb'}`
    }}>
      {ativo ? '● ATIVO' : '● INATIVO'}
    </span>
  );

  // Função para renderizar campo em linha horizontal
  const renderCampoHorizontal = (label, valor, tipo = 'text', width = 'auto') => {
    let valorFormatado = valor;
    
    if (tipo === 'email' && valor) {
      valorFormatado = (
        <a 
          href={`mailto:${valor}`} 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          📧 {valor}
        </a>
      );
    } else if (tipo === 'telefone' && valor) {
      const numeroFormatado = formatarTelefone(valor);
      valorFormatado = (
        <a 
          href={`tel:${numeroFormatado}`} 
          style={{ 
            color: '#28a745', 
            textDecoration: 'none',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          📞 {numeroFormatado}
        </a>
      );
    } else if (tipo === 'telemovel' && valor) {
      const numeroFormatado = formatarTelefone(valor);
      valorFormatado = (
        <a 
          href={`tel:${numeroFormatado}`} 
          style={{ 
            color: '#28a745', 
            textDecoration: 'none',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          📱 {numeroFormatado}
        </a>
      );
    } else if (!valor || valor === '') {
      valorFormatado = <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Não informado</span>;
    }

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        marginBottom: '12px',
        width: width
      }}>
        <div style={{
          minWidth: '140px',
          fontWeight: '600',
          color: '#495057',
          fontSize: '14px',
          paddingRight: '16px',
          textAlign: 'right'
        }}>
          {label}:
        </div>
        <div style={{
          flex: 1,
          color: '#212529',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {valorFormatado}
        </div>
      </div>
    );
  };

  return (
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
        width: '95%',
        height: '90%',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Cabeçalho Principal - Redesenhado para Máximo Impacto Visual */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '32px',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '28px',
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {cliente.nome}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '16px',
                opacity: 0.9
              }}>
                <span>NIF: {cliente.nif}</span>
                <span>|</span>
                <span>{cliente.tipo_cliente === 'empresa' ? 'Empresa' : 'Particular'}</span>
                {cliente.cae && (
                  <>
                    <span>|</span>
                    <span>CAE: {cliente.cae}</span>
                  </>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {renderBadgeEstado(cliente.ativo)}
              <button
                onClick={onFechar}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Layout Horizontal Otimizado */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px'
        }}>
          {/* Seção 1: Contactos Primários - Layout Horizontal */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              fontWeight: '600',
              borderBottom: '3px solid #007bff',
              paddingBottom: '8px',
              display: 'inline-block'
            }}>
              Contactos Primários
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '24px'
            }}>
              <div>
                {renderCampoHorizontal('Email', cliente.email, 'email')}
              </div>
              <div>
                {renderCampoHorizontal('Telefone', cliente.telefone, 'telefone')}
              </div>
              <div>
                {renderCampoHorizontal('Telemóvel', cliente.telemovel, 'telemovel')}
              </div>
            </div>

            {cliente.contacto_geral && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{
                  fontWeight: '600',
                  color: '#495057',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Informações de Contacto Geral:
                </div>
                <div style={{
                  color: '#212529',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {cliente.contacto_geral}
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Informações de Localização - Layout Horizontal */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              fontWeight: '600',
              borderBottom: '3px solid #28a745',
              paddingBottom: '8px',
              display: 'inline-block'
            }}>
              📍 Localização e Endereço
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '24px',
              marginBottom: '16px'
            }}>
              <div>
                {renderCampoHorizontal('Morada', cliente.morada)}
              </div>
              <div>
                {renderCampoHorizontal('Código Postal', cliente.codigo_postal)}
              </div>
              <div>
                {renderCampoHorizontal('Localidade', cliente.localidade)}
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}>
              <div>
                {renderCampoHorizontal('Distrito', cliente.distrito)}
              </div>
              <div>
                {renderCampoHorizontal('País', cliente.pais)}
              </div>
            </div>
          </div>

          {/* Seção 3: Perfil Logístico - Se Existir */}
          {(cliente.tipos_servico?.length > 0 || cliente.ambito?.length > 0 || cliente.modalidades?.length > 0) && (
            <div style={{
              backgroundColor: '#fff8e1',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #ffecb3'
            }}>
              <h2 style={{
                margin: '0 0 20px 0',
                color: '#f57f17',
                fontSize: '18px',
                fontWeight: '600',
                borderBottom: '3px solid #ffa726',
                paddingBottom: '8px',
                display: 'inline-block'
              }}>
                🚛 Perfil Logístico
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '24px'
              }}>
                {cliente.tipos_servico?.length > 0 && (
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      Tipos de Serviços:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {cliente.tipos_servico.map((servico, index) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          backgroundColor: '#e3f2fd',
                          color: '#1565c0',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: '1px solid #bbdefb'
                        }}>
                          {servico}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cliente.ambito?.length > 0 && (
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      Âmbito Geográfico:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {cliente.ambito.map((zona, index) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          backgroundColor: '#f3e5f5',
                          color: '#7b1fa2',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: '1px solid #e1bee7'
                        }}>
                          {zona}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cliente.modalidades?.length > 0 && (
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      Modalidades:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {cliente.modalidades.map((modalidade, index) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          backgroundColor: '#e8f5e8',
                          color: '#2e7d32',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: '1px solid #c8e6c9'
                        }}>
                          {modalidade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção 4: Observações - Se Existir */}
          {cliente.observacoes && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                margin: '0 0 16px 0',
                color: '#495057',
                fontSize: '18px',
                fontWeight: '600',
                borderBottom: '3px solid #6c757d',
                paddingBottom: '8px',
                display: 'inline-block'
              }}>
                📝 Observações
              </h2>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                color: '#212529',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {cliente.observacoes}
              </div>
            </div>
          )}

          {/* Seção 5: Informações de Sistema e Estatísticas - Layout Horizontal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Informações de Sistema */}
            <div style={{
              backgroundColor: '#f1f3f4',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #dadce0'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: '#5f6368',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                ⚙️ Informações de Sistema
              </h3>
              
              <div style={{ display: 'grid', gap: '8px' }}>
                {renderCampoHorizontal('Criado em', formatarData(cliente.created_at))}
                {renderCampoHorizontal('Atualizado em', formatarData(cliente.updated_at))}
                {cliente.data_criacao && renderCampoHorizontal('Data de Registo', formatarData(cliente.data_criacao))}
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: '#495057',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                📊 Resumo
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: cliente.ativo ? '#d4edda' : '#f8d7da',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: cliente.ativo ? '#155724' : '#721c24'
                  }}>
                    {cliente.ativo ? 'ATIVO' : 'INATIVO'}
                  </div>
                </div>

                <div style={{
                  padding: '8px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1565c0'
                  }}>
                    {cliente.tipo_cliente === 'empresa' ? 'B2B' : 'B2C'}
                  </div>
                </div>

                <div style={{
                  padding: '8px',
                  backgroundColor: '#fff3e0',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#ef6c00'
                  }}>
                    {(cliente.tipos_servico?.length || 0) + (cliente.ambito?.length || 0) + (cliente.modalidades?.length || 0)}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>Características</div>
                </div>

                <div style={{
                  padding: '8px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#2e7d32'
                  }}>
                    {[cliente.email, cliente.telefone, cliente.telemovel].filter(Boolean).length}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>Contactos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações - Redesenhado */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => {
              onEditar(cliente);
              onFechar();
            }}
            style={{
              padding: '14px 28px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,123,255,0.3)';
            }}
          >
            ✏️ Editar Cliente
          </button>
          
          <button
            onClick={onFechar}
            style={{
              padding: '14px 28px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#545b62';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6c757d';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FichaDetalhadaCliente;