// src/pages/ClientesPage.js - VERSÃO COMPLETA E FUNCIONAL
import React, { useState, useEffect } from 'react';
import '../App.css';
import { supabase } from '../supabaseClient';

// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================
const ESTADOS_CLIENTE = ['potencial', 'cliente', 'inativo'];
const PRAZOS_PAGAMENTO = [0, 15, 30, 60, 90];
const PAISES_PADRAO = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Itália'];
const CAMPOS_OBRIGATORIOS = ['nome', 'nif'];

// ========================================
// UTILITÁRIOS E VALIDAÇÕES
// ========================================
const UtilValidacao = {
  validarNIF: (nif) => {
    const nifString = nif.toString().replace(/\s/g, '');
    if (!/^\d{9}$/.test(nifString)) {
      return { valido: false, erro: 'NIF deve ter exatamente 9 dígitos' };
    }
    const digitos = nifString.split('').map(Number);
    const primeiroDigito = digitos[0];
    if (![1, 2, 3, 5, 6, 8, 9].includes(primeiroDigito)) {
      return { valido: false, erro: `Primeiro dígito inválido: ${primeiroDigito}. Deve ser 1, 2, 3, 5, 6, 8 ou 9` };
    }
    let soma = 0;
    for (let i = 0; i < 8; i++) {
      soma += digitos[i] * (9 - i);
    }
    const resto = soma % 11;
    const digitoControloEsperado = resto < 2 ? 0 : 11 - resto;
    const digitoControloFornecido = digitos[8];
    if (digitoControloFornecido !== digitoControloEsperado) {
      return { 
        valido: false, 
        erro: `Dígito de controlo incorreto. Esperado: ${digitoControloEsperado}, fornecido: ${digitoControloFornecido}`,
        sugestaoCorrecao: nifString.slice(0, 8) + digitoControloEsperado
      };
    }
    return { valido: true, erro: null };
  },

  obterTipoEntidade: (nif) => {
    const primeiroDigito = parseInt(nif.toString()[0]);
    switch (primeiroDigito) {
      case 1: case 2: case 3: return "Pessoa Singular";
      case 5: case 6: return "Pessoa Coletiva Pública";
      case 8: return "Empresário em Nome Individual";
      case 9: return "Pessoa Coletiva Irregular ou Não Residente";
      default: return "Tipo não identificado";
    }
  },

  formatarNIF: (nif) => {
    const nifLimpo = nif.toString().replace(/\s/g, '');
    if (nifLimpo.length === 9) {
      return `${nifLimpo.slice(0, 3)} ${nifLimpo.slice(3, 6)} ${nifLimpo.slice(6, 9)}`;
    }
    return nif;
  },

  consultarNIF: async (nif) => {
    try {
      const validacao = UtilValidacao.validarNIF(nif);
      if (!validacao.valido) {
        return { sucesso: false, erro: validacao.erro };
      }
      const response = await fetch(`https://www.nif.pt/api/json/${nif}`);
      if (!response.ok) throw new Error('Erro na consulta do NIF');
      const dados = await response.json();
      if (dados.result === 'success' && dados.records) {
        const nifData = dados.records[nif];
        if (nifData) {
          return {
            sucesso: true,
            dados: {
              nome: nifData.title || '',
              morada: nifData.address || '',
              codigo_postal: nifData.pc4 && nifData.pc3 ? `${nifData.pc4}-${nifData.pc3}` : '',
              localidade: nifData.city || '',
              cae: nifData.cae || '',
              sector_atividade: nifData.activity || ''
            }
          };
        }
      }
      return { sucesso: false, erro: 'NIF não encontrado na base de dados' };
    } catch (error) {
      console.error('Erro ao consultar NIF:', error);
      return { sucesso: false, erro: 'Erro na consulta. Verifique a ligação à internet.' };
    }
  },

  validarEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
};

// ========================================
// SERVIÇOS DE BASE DE DADOS
// ========================================
const DatabaseService = {
  fetchClientes: async () => {
    try {
      const { data, error } = await supabase.from('clientes').select('*').order('nome');
      if (error) throw error;
      return { sucesso: true, dados: data || [] };
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return { sucesso: false, erro: error.message };
    }
  },

  adicionarCliente: async (cliente) => {
    try {
      const clienteProcessado = {
        ...cliente,
        tipos_servico: cliente.tipos_servico || [],
        ambito: cliente.ambito || [],
        modalidades: cliente.modalidades || [],
        nome: cliente.nome.toUpperCase(),
        email: cliente.email ? cliente.email.toLowerCase() : null
      };
      const { data, error } = await supabase.from('clientes').insert([clienteProcessado]).select();
      if (error) throw error;
      return { sucesso: true, dados: data[0] };
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      return { sucesso: false, erro: error.message };
    }
  },

  atualizarCliente: async (id, dadosAtualizados) => {
    try {
      const clienteProcessado = {
        ...dadosAtualizados,
        tipos_servico: dadosAtualizados.tipos_servico || [],
        ambito: dadosAtualizados.ambito || [],
        modalidades: dadosAtualizados.modalidades || [],
        nome: dadosAtualizados.nome.toUpperCase(),
        email: dadosAtualizados.email ? dadosAtualizados.email.toLowerCase() : null
      };
      const { data, error } = await supabase.from('clientes').update(clienteProcessado).eq('id', id).select();
      if (error) throw error;
      return { sucesso: true, dados: data[0] };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return { sucesso: false, erro: error.message };
    }
  },

  eliminarCliente: async (id) => {
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao eliminar cliente:', error);
      return { sucesso: false, erro: error.message };
    }
  }
};

// ========================================
// COMPONENTES DE UI
// ========================================
const LoadingComponent = () => (
  <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>
    <div style={{marginBottom: '10px'}}>⏳</div>
    Carregando clientes...
  </div>
);

const NotificacaoComponent = ({ tipo, mensagem, onClose }) => {
  const cores = {
    sucesso: { bg: '#d4edda', texto: '#155724', borda: '#c3e6cb' },
    erro: { bg: '#f8d7da', texto: '#721c24', borda: '#f5c6cb' },
    aviso: { bg: '#fff3cd', texto: '#856404', borda: '#ffeaa7' }
  };
  const cor = cores[tipo] || cores.aviso;
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', backgroundColor: cor.bg, color: cor.texto,
      border: `1px solid ${cor.borda}`, padding: '15px 20px', borderRadius: '5px', zIndex: 1001,
      maxWidth: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span>{mensagem}</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer',
          marginLeft: '10px', color: cor.texto
        }}>×</button>
      </div>
    </div>
  );
};

// MODAL DE CORREÇÃO NIF - SUBSTITUI OS ALERTAS PROBLEMÁTICOS
const ModalCorrecaoNIF = ({ mostrar, dados, onAceitar, onFechar }) => {
  if (!mostrar || !dados) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 2000, display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
        border: '3px solid #dc3545', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '28px', color: '#dc3545', marginRight: '12px' }}>⚠️</div>
          <h3 style={{ margin: 0, color: '#dc3545', fontSize: '20px', fontWeight: 'bold' }}>
            NIF Inválido
          </h3>
        </div>
        <div style={{ marginBottom: '25px' }}>
          <p style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px', lineHeight: '1.5' }}>
            <strong>Problema:</strong> {dados.erro}
          </p>
          {dados.sugestaoCorrecao && (
            <div style={{
              backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '6px',
              padding: '15px', marginBottom: '15px'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#155724', fontSize: '16px', fontWeight: 'bold' }}>
                💡 Sugestão de Correção:
              </p>
              <p style={{
                margin: '0', color: '#155724', fontSize: '18px', fontFamily: 'monospace',
                fontWeight: 'bold', textAlign: 'center', padding: '8px', backgroundColor: '#fff',
                borderRadius: '4px', border: '1px solid #c3e6cb'
              }}>
                {UtilValidacao.formatarNIF(dados.sugestaoCorrecao)}
              </p>
            </div>
          )}
          <p style={{ margin: '0', color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
            Por favor, corrija o NIF antes de continuar.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          {dados.sugestaoCorrecao && (
            <button onClick={() => onAceitar(dados.sugestaoCorrecao)} style={{
              backgroundColor: '#28a745', color: 'white', padding: '12px 20px', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
            }}>
              ✅ Usar NIF Corrigido
            </button>
          )}
          <button onClick={onFechar} style={{
            backgroundColor: '#dc3545', color: 'white', padding: '12px 20px', border: 'none',
            borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
          }}>
            ❌ Corrigir Manualmente
          </button>
        </div>
      </div>
    </div>
  );
};

const FiltrosComponent = ({ filtros, onFiltroChange }) => (
  <div style={{
    backgroundColor: '#f8f9fa', padding: '15px 20px', borderRadius: '6px',
    marginBottom: '15px', border: '1px solid #e9ecef'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <span style={{fontWeight: 'bold', fontSize: '14px', color: '#495057'}}>🔍 Filtros:</span>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <label style={{fontWeight: '500', fontSize: '14px', color: '#495057'}}>Estado:</label>
        <select value={filtros.estado} onChange={(e) => onFiltroChange('estado', e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', minWidth: '120px' }}>
          <option value="Todos">Todos</option>
          {ESTADOS_CLIENTE.map(estado => (
            <option key={estado} value={estado}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '200px'}}>
        <label style={{fontWeight: '500', fontSize: '14px', color: '#495057'}}>Pesquisar:</label>
        <input type="text" placeholder="Nome, NIF, email..." value={filtros.pesquisa}
          onChange={(e) => onFiltroChange('pesquisa', e.target.value)}
          style={{ flex: '1', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
        />
      </div>
    </div>
  </div>
);

const ListaClientesComponent = ({ clientes, onEditarCliente, onEliminarCliente, clienteExpandido, onToggleExpansao }) => (
  <div>
    {clientes.map(cliente => (
      <div key={cliente.id} style={{
        border: '1px solid #dee2e6', margin: '5px 0', backgroundColor: '#fff',
        borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 15px', backgroundColor: cliente.estado === 'cliente' ? '#e8f5e9' : '#fff3e0',
          borderBottom: clienteExpandido === cliente.id ? '1px solid #e9ecef' : 'none', minHeight: '50px'
        }}>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <strong style={{fontSize: '16px', color: '#2c3e50'}}>{cliente.nome}</strong>
              <span style={{
                backgroundColor: cliente.estado === 'cliente' ? '#4caf50' : '#ff9800',
                color: 'white', padding: '2px 6px', borderRadius: '10px',
                fontSize: '10px', fontWeight: 'bold'
              }}>
                {cliente.estado.toUpperCase()}
              </span>
            </div>
            <div style={{fontSize: '13px', color: '#6c757d', display: 'flex', gap: '15px'}}>
              <span><strong>NIF:</strong> {UtilValidacao.formatarNIF(cliente.nif)}</span>
              {cliente.email && <span><strong>Email:</strong> {cliente.email}</span>}
              {cliente.contacto_geral && <span><strong>Contacto:</strong> {cliente.contacto_geral}</span>}
            </div>
          </div>
          <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
            <button onClick={() => onToggleExpansao(cliente.id)} style={{
              backgroundColor: '#6c757d', color: 'white', padding: '6px 10px', border: 'none',
              borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
            }}>
              {clienteExpandido === cliente.id ? '▲' : '▼'}
            </button>
            <button onClick={() => onEditarCliente(cliente)} style={{
              backgroundColor: '#007bff', color: 'white', padding: '6px 10px', border: 'none',
              borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
            }}>✏️</button>
            <button onClick={() => onEliminarCliente(cliente)} style={{
              backgroundColor: '#dc3545', color: 'white', padding: '6px 10px', border: 'none',
              borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
            }}>🗑️</button>
          </div>
        </div>
        {clienteExpandido === cliente.id && (
          <div style={{padding: '15px', backgroundColor: '#f8f9fa'}}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <h4 style={{marginTop: 0, marginBottom: '8px', color: '#495057', fontSize: '14px'}}>📍 Morada</h4>
                <p style={{margin: '3px 0', fontSize: '13px'}}>{cliente.morada || 'Não definida'}</p>
                <p style={{margin: '3px 0', fontSize: '13px'}}>{cliente.codigo_postal} {cliente.localidade}</p>
                <p style={{margin: '3px 0', fontSize: '13px'}}>{cliente.pais}</p>
              </div>
              <div>
                <h4 style={{marginTop: 0, marginBottom: '8px', color: '#495057', fontSize: '14px'}}>📞 Contactos</h4>
                {cliente.telefone && <p style={{margin: '3px 0', fontSize: '13px'}}>Tel: {cliente.telefone}</p>}
                {cliente.telemovel && <p style={{margin: '3px 0', fontSize: '13px'}}>Móvel: {cliente.telemovel}</p>}
                {cliente.email && <p style={{margin: '3px 0', fontSize: '13px'}}>Email: {cliente.email}</p>}
              </div>
              <div>
                <h4 style={{marginTop: 0, marginBottom: '8px', color: '#495057', fontSize: '14px'}}>💼 Informações Comerciais</h4>
                <p style={{margin: '3px 0', fontSize: '13px'}}>CAE: {cliente.cae || 'Não definido'}</p>
                <p style={{margin: '3px 0', fontSize: '13px'}}>Prazo Pagamento: {cliente.prazo_pagamento_dias} dias</p>
                {cliente.volume_negocio_anual && (
                  <p style={{margin: '3px 0', fontSize: '13px'}}>
                    Volume Anual: €{parseFloat(cliente.volume_negocio_anual).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {cliente.observacoes && (
              <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #dee2e6'}}>
                <h4 style={{marginTop: 0, marginBottom: '8px', color: '#495057', fontSize: '14px'}}>📝 Observações</h4>
                <p style={{margin: 0, fontStyle: 'italic', color: '#6c757d', fontSize: '13px'}}>
                  {cliente.observacoes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
);

const SeccaoFormulario = ({ titulo, cor, children }) => (
  <div style={{marginBottom: '25px'}}>
    <h3 style={{
      marginBottom: '15px', color: 'white', backgroundColor: cor, padding: '10px 15px',
      borderRadius: '6px', margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold'
    }}>
      {titulo}
    </h3>
    <div style={{
      backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px',
      border: `2px solid ${cor}`, borderTop: 'none'
    }}>
      {children}
    </div>
  </div>
);

// ========================================
// FORMULÁRIO PRINCIPAL COM VALIDAÇÃO NIF
// ========================================
const FormularioCliente = ({ dados, onDadosChange, onConsultaNIF, modo = 'adicionar' }) => {
  const [modalCorrecao, setModalCorrecao] = useState({ mostrar: false, dados: null });
  
  const handleInputChange = (campo, valor) => {
    console.log(`Atualizando campo ${campo} com valor:`, valor);
    onDadosChange(prev => ({ ...prev, [campo]: valor }));
  };

  const mostrarModalCorrecao = (validacao) => {
    setModalCorrecao({ mostrar: true, dados: validacao });
  };

  const aceitarCorrecao = (nifCorrigido) => {
    handleInputChange('nif', nifCorrigido);
    setModalCorrecao({ mostrar: false, dados: null });
  };

  const fecharModal = () => {
    setModalCorrecao({ mostrar: false, dados: null });
    setTimeout(() => {
      const nifInput = document.querySelector('input[maxLength="9"]');
      if (nifInput) {
        nifInput.focus();
        nifInput.select();
      }
    }, 100);
  };

  const getCorBordaNIF = () => {
    if (!dados.nif || dados.nif.length === 0) return '#ced4da';
    if (dados.nif.length < 9) return '#ffc107';
    const validacao = UtilValidacao.validarNIF(dados.nif);
    return validacao.valido ? '#28a745' : '#dc3545';
  };

  const getIndicadorNIF = () => {
    if (!dados.nif || dados.nif.length === 0) return '';
    if (dados.nif.length < 9) return '...';
    const validacao = UtilValidacao.validarNIF(dados.nif);
    return validacao.valido ? '✓' : '✗';
  };

  return (
    <div>
      <ModalCorrecaoNIF
        mostrar={modalCorrecao.mostrar}
        dados={modalCorrecao.dados}
        onAceitar={aceitarCorrecao}
        onFechar={fecharModal}
      />

      <SeccaoFormulario titulo="📋 Dados Básicos" cor="#28a745">
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 140px 150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '20px'
        }}>
          <label><strong>NIF: *</strong></label>
          <div style={{position: 'relative'}}>
            <input 
              type="text" maxLength="9" pattern="[0-9]{9}" value={dados.nif || ''}
              onChange={async (e) => {
                const novoNif = e.target.value.replace(/\D/g, '');
                handleInputChange('nif', novoNif);
                if (modo === 'adicionar' && novoNif.length === 9) {
                  console.log('Validando NIF:', novoNif);
                  const validacao = UtilValidacao.validarNIF(novoNif);
                  if (validacao.valido) {
                    console.log('NIF válido:', novoNif, 'Tipo:', UtilValidacao.obterTipoEntidade(novoNif));
                    if (onConsultaNIF) await onConsultaNIF(novoNif);
                  } else {
                    console.log('NIF inválido:', validacao.erro);
                    if (validacao.sugestaoCorrecao) {
                      console.log('Sugestão de correção:', validacao.sugestaoCorrecao);
                    }
                  }
                }
              }}
              onBlur={(e) => {
                const nif = e.target.value;
                if (nif.length === 9) {
                  const validacao = UtilValidacao.validarNIF(nif);
                  if (!validacao.valido) mostrarModalCorrecao(validacao);
                } else if (nif.length > 0) {
                  mostrarModalCorrecao({ erro: 'NIF deve ter exatamente 9 dígitos', sugestaoCorrecao: null });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  const nif = e.target.value;
                  if (nif.length > 0 && nif.length < 9) {
                    e.preventDefault();
                    mostrarModalCorrecao({
                      erro: 'NIF deve ter exatamente 9 dígitos. Complete o NIF antes de avançar.',
                      sugestaoCorrecao: null
                    });
                    return;
                  }
                  if (nif.length === 9) {
                    const validacao = UtilValidacao.validarNIF(nif);
                    if (!validacao.valido) {
                      e.preventDefault();
                      mostrarModalCorrecao(validacao);
                      return;
                    }
                  }
                }
              }}
              style={{
                width: '100%', padding: '8px', borderRadius: '4px',
                border: '2px solid', borderColor: getCorBordaNIF()
              }}
              required placeholder="123456789"
            />
            {dados.nif && dados.nif.length > 0 && (
              <div style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '14px', fontWeight: 'bold',
                color: dados.nif.length === 9 && UtilValidacao.validarNIF(dados.nif).valido 
                  ? '#28a745' : dados.nif.length === 9 ? '#dc3545' : '#ffc107'
              }}>
                {getIndicadorNIF()}
              </div>
            )}
          </div>
          
          <label><strong>Nome da Empresa: *</strong></label>
          <input 
            type="text" value={dados.nome || ''}
            onChange={(e) => handleInputChange('nome', e.target.value.toUpperCase())}
            onFocus={(e) => {
              if (dados.nif && dados.nif.length > 0) {
                if (dados.nif.length < 9) {
                  mostrarModalCorrecao({
                    erro: 'Complete o NIF (9 dígitos) antes de preencher o nome da empresa.',
                    sugestaoCorrecao: null
                  });
                  return;
                }
                const validacao = UtilValidacao.validarNIF(dados.nif);
                if (!validacao.valido) {
                  mostrarModalCorrecao({
                    ...validacao,
                    erro: validacao.erro + '\n\nCorreia o NIF antes de preencher o nome da empresa.'
                  });
                  return;
                }
              }
            }}
            style={{
              width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da',
              opacity: dados.nif && dados.nif.length === 9 && UtilValidacao.validarNIF(dados.nif).valido ? 1 : 0.7
            }}
            required placeholder="Nome da empresa"
          />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '150px 120px 150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '20px'
        }}>
          <label><strong>CAE:</strong></label>
          <input 
            type="text" maxLength="5" value={dados.cae || ''}
            onChange={(e) => handleInputChange('cae', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="62010"
          />
          <label><strong>Sector Atividade:</strong></label>
          <input 
            type="text" value={dados.sector_atividade || ''}
            onChange={(e) => handleInputChange('sector_atividade', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="Descrição da atividade"
          />
        </div>

        {dados.nif && dados.nif.length === 9 && UtilValidacao.validarNIF(dados.nif).valido && (
          <div style={{
            backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px',
            padding: '10px', marginTop: '10px', fontSize: '14px', color: '#155724'
          }}>
            <strong>NIF Válido:</strong> {UtilValidacao.formatarNIF(dados.nif)} - {UtilValidacao.obterTipoEntidade(dados.nif)}
          </div>
        )}
      </SeccaoFormulario>

      <SeccaoFormulario titulo="📞 Informação de Contacto" cor="#17a2b8">
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 160px 150px 160px',
          gap: '15px', alignItems: 'center', marginBottom: '15px'
        }}>
          <label><strong>Telefone:</strong></label>
          <input 
            type="text" maxLength="15" value={dados.telefone || ''}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="212345678"
          />
          <label><strong>Telemóvel:</strong></label>
          <input 
            type="text" maxLength="15" value={dados.telemovel || ''}
            onChange={(e) => handleInputChange('telemovel', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="912345678"
          />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '150px 1fr 150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '20px'
        }}>
          <label><strong>Email:</strong></label>
          <input 
            type="email" value={dados.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
            style={{
              width: '100%', padding: '8px', borderRadius: '4px',
              border: dados.email && !UtilValidacao.validarEmail(dados.email) 
                ? '2px solid #dc3545' : '1px solid #ced4da'
            }}
            placeholder="empresa@exemplo.pt"
          />
          <label><strong>Contacto Principal:</strong></label>
          <input 
            type="text" value={dados.contacto_geral || ''}
            onChange={(e) => handleInputChange('contacto_geral', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="Nome da pessoa de contacto"
          />
        </div>
      </SeccaoFormulario>

      <SeccaoFormulario titulo="📍 Morada" cor="#6f42c1">
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '15px'
        }}>
          <label><strong>Morada:</strong></label>
          <input 
            type="text" value={dados.morada || ''}
            onChange={(e) => handleInputChange('morada', e.target.value.toUpperCase())}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="Rua, número, andar, etc."
          />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '150px 140px 150px 1fr 150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '20px'
        }}>
          <label><strong>Código Postal:</strong></label>
          <input 
            type="text" value={dados.codigo_postal || ''}
            onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="0000-000"
          />
          <label><strong>Localidade:</strong></label>
          <input 
            type="text" value={dados.localidade || ''}
            onChange={(e) => handleInputChange('localidade', e.target.value.toUpperCase())}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="Cidade"
          />
          <label><strong>País:</strong></label>
          <select value={dados.pais || 'Portugal'}
            onChange={(e) => handleInputChange('pais', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}>
            {PAISES_PADRAO.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>
      </SeccaoFormulario>

      <SeccaoFormulario titulo="💼 Informação Comercial" cor="#fd7e14">
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 1fr 150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '15px'
        }}>
          <label><strong>Estado:</strong></label>
          <select value={dados.estado || 'potencial'}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}>
            {ESTADOS_CLIENTE.map(estado => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
          <label><strong>Volume Anual (€):</strong></label>
          <input 
            type="number" min="0" step="0.01" value={dados.volume_negocio_anual || ''}
            onChange={(e) => handleInputChange('volume_negocio_anual', e.target.value)}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}
            placeholder="Estimativa opcional"
          />
        </div>
        
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 1fr',
          gap: '15px', alignItems: 'center', marginBottom: '20px'
        }}>
          <label><strong>Prazo Pagamento:</strong></label>
          <select value={dados.prazo_pagamento_dias || 30}
            onChange={(e) => handleInputChange('prazo_pagamento_dias', parseInt(e.target.value))}
            style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da'}}>
            {PRAZOS_PAGAMENTO.map(prazo => (
              <option key={prazo} value={prazo}>
                {prazo === 0 ? 'Pronto pagamento' : `${prazo} dias`}
              </option>
            ))}
          </select>
        </div>
      </SeccaoFormulario>

      <SeccaoFormulario titulo="📝 Observações" cor="#6c757d">
        <div style={{
          display: 'grid', gridTemplateColumns: '150px 1fr',
          gap: '15px', alignItems: 'start', marginBottom: '20px'
        }}>
          <label><strong>Observações:</strong></label>
          <textarea 
            value={dados.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            style={{
              width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da',
              minHeight: '100px', resize: 'vertical'
            }}
            placeholder="Notas internas, observações especiais, histórico de relacionamento..."
          />
        </div>
      </SeccaoFormulario>
    </div>
  );
};

// ========================================
// MODAIS
// ========================================
const ModalAdicionarCliente = ({ dadosCliente, onDadosChange, onSubmit, onClose, onConsultaNIF }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, display: 'flex',
    justifyContent: 'center', alignItems: 'center'
  }}>
    <div style={{
      backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '12px',
      padding: '0', overflow: 'hidden', border: '3px solid #28a745',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 30px', backgroundColor: '#28a745', color: 'white'
      }}>
        <h2 style={{margin: 0, fontSize: '24px'}}>Adicionar Novo Cliente</h2>
        <button onClick={onClose} style={{
          backgroundColor: 'transparent', color: 'white', border: '2px solid white',
          borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
          fontSize: '20px', fontWeight: 'bold'
        }}>×</button>
      </div>
      <div style={{ padding: '30px', height: 'calc(100% - 140px)', overflowY: 'auto' }}>
        <FormularioCliente 
          dados={dadosCliente} onDadosChange={onDadosChange}
          onConsultaNIF={onConsultaNIF} modo="adicionar"
        />
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          borderTop: '2px solid #28a745', paddingTop: '25px', marginTop: '30px'
        }}>
          <button type="button" onClick={onSubmit} style={{
            backgroundColor: '#28a745', color: 'white', padding: '15px 30px',
            border: 'none', cursor: 'pointer', borderRadius: '8px',
            fontSize: '16px', fontWeight: 'bold', minWidth: '150px'
          }}>
            Adicionar Cliente
          </button>
          <button type="button" onClick={onClose} style={{
            backgroundColor: '#6c757d', color: 'white', padding: '15px 30px',
            border: 'none', cursor: 'pointer', borderRadius: '8px',
            fontSize: '16px', minWidth: '150px'
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ModalEditarCliente = ({ cliente, dadosEdicao, onDadosChange, onSalvar, onClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, display: 'flex',
    justifyContent: 'center', alignItems: 'center'
  }}>
    <div style={{
      backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '12px',
      padding: '0', overflow: 'hidden', border: '3px solid #007bff',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 30px', backgroundColor: '#007bff', color: 'white'
      }}>
        <h2 style={{margin: 0, fontSize: '24px'}}>Editar Cliente: {cliente.nome}</h2>
        <button onClick={onClose} style={{
          backgroundColor: 'transparent', color: 'white', border: '2px solid white',
          borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
          fontSize: '20px', fontWeight: 'bold'
        }}>×</button>
      </div>
      <div style={{ padding: '30px', height: 'calc(100% - 140px)', overflowY: 'auto' }}>
        <FormularioCliente dados={dadosEdicao} onDadosChange={onDadosChange} modo="editar" />
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          borderTop: '2px solid #007bff', paddingTop: '25px', marginTop: '30px'
        }}>
          <button type="button" onClick={onSalvar} style={{
            backgroundColor: '#28a745', color: 'white', padding: '15px 30px',
            border: 'none', cursor: 'pointer', borderRadius: '8px',
            fontSize: '16px', fontWeight: 'bold', minWidth: '150px'
          }}>
            Guardar Alterações
          </button>
          <button type="button" onClick={onClose} style={{
            backgroundColor: '#6c757d', color: 'white', padding: '15px 30px',
            border: 'none', cursor: 'pointer', borderRadius: '8px',
            fontSize: '16px', minWidth: '150px'
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacao, setNotificacao] = useState(null);
  const [filtros, setFiltros] = useState({ estado: 'Todos', pesquisa: '' });
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});
  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [dadosNovoCliente, setDadosNovoCliente] = useState({
    nome: '', nif: '', cae: '', telefone: '', telemovel: '', email: '', contacto_geral: '',
    morada: '', codigo_postal: '', localidade: '', pais: 'Portugal', estado: 'potencial',
    tipos_servico: [], ambito: [], modalidades: [], volume_negocio_anual: '',
    sector_atividade: '', prazo_pagamento_dias: 30, ativo: true, observacoes: ''
  });

  const carregarClientes = async () => {
    setLoading(true);
    const resultado = await DatabaseService.fetchClientes();
    if (resultado.sucesso) {
      setClientes(resultado.dados);
    } else {
      mostrarNotificacao('erro', 'Erro ao carregar clientes: ' + resultado.erro);
    }
    setLoading(false);
  };

  const mostrarNotificacao = (tipo, mensagem) => {
    setNotificacao({ tipo, mensagem });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const clientesFiltrados = clientes.filter(cliente => {
    if (filtros.estado !== 'Todos' && cliente.estado !== filtros.estado) return false;
    if (filtros.pesquisa) {
      const pesquisa = filtros.pesquisa.toLowerCase();
      return (
        cliente.nome.toLowerCase().includes(pesquisa) ||
        cliente.nif.includes(pesquisa) ||
        (cliente.email && cliente.email.toLowerCase().includes(pesquisa))
      );
    }
    return true;
  });

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleAdicionarCliente = async (e) => {
    e.preventDefault();
    for (const campo of CAMPOS_OBRIGATORIOS) {
      if (!dadosNovoCliente[campo]) {
        mostrarNotificacao('erro', `Campo obrigatório: ${campo}`);
        return;
      }
    }
    if (dadosNovoCliente.email && !UtilValidacao.validarEmail(dadosNovoCliente.email)) {
      mostrarNotificacao('erro', 'Email inválido');
      return;
    }
    const validacaoNIF = UtilValidacao.validarNIF(dadosNovoCliente.nif);
    if (!validacaoNIF.valido) {
      let mensagemErro = `NIF inválido: ${validacaoNIF.erro}`;
      if (validacaoNIF.sugestaoCorrecao) {
        mensagemErro += `\n\nSugestão: ${UtilValidacao.formatarNIF(validacaoNIF.sugestaoCorrecao)}`;
      }
      mostrarNotificacao('erro', mensagemErro);
      return;
    }
    const resultado = await DatabaseService.adicionarCliente(dadosNovoCliente);
    if (resultado.sucesso) {
      setClientes(prev => [...prev, resultado.dados]);
      setModalAdicionar(false);
      resetarFormulario();
      mostrarNotificacao('sucesso', 'Cliente adicionado com sucesso!');
    } else {
      mostrarNotificacao('erro', 'Erro ao adicionar cliente: ' + resultado.erro);
    }
  };

  const handleEditarCliente = async () => {
    for (const campo of CAMPOS_OBRIGATORIOS) {
      if (!dadosEdicao[campo]) {
        mostrarNotificacao('erro', `Campo obrigatório: ${campo}`);
        return;
      }
    }
    if (dadosEdicao.email && !UtilValidacao.validarEmail(dadosEdicao.email)) {
      mostrarNotificacao('erro', 'Email inválido');
      return;
    }
    const validacaoNIF = UtilValidacao.validarNIF(dadosEdicao.nif);
    if (!validacaoNIF.valido) {
      let mensagemErro = `NIF inválido: ${validacaoNIF.erro}`;
      if (validacaoNIF.sugestaoCorrecao) {
        mensagemErro += `\n\nSugestão: ${UtilValidacao.formatarNIF(validacaoNIF.sugestaoCorrecao)}`;
      }
      mostrarNotificacao('erro', mensagemErro);
      return;
    }
    const resultado = await DatabaseService.atualizarCliente(clienteEditando.id, dadosEdicao);
    if (resultado.sucesso) {
      setClientes(prev => prev.map(c => c.id === clienteEditando.id ? resultado.dados : c));
      setClienteEditando(null);
      setDadosEdicao({});
      mostrarNotificacao('sucesso', 'Cliente editado com sucesso!');
    } else {
      mostrarNotificacao('erro', 'Erro ao editar cliente: ' + resultado.erro);
    }
  };

  const handleEliminarCliente = async (cliente) => {
    if (!window.confirm(`Tem certeza que deseja eliminar ${cliente.nome}?`)) return;
    const resultado = await DatabaseService.eliminarCliente(cliente.id);
    if (resultado.sucesso) {
      setClientes(prev => prev.filter(c => c.id !== cliente.id));
      mostrarNotificacao('sucesso', 'Cliente eliminado com sucesso!');
    } else {
      mostrarNotificacao('erro', 'Erro ao eliminar cliente: ' + resultado.erro);
    }
  };

  const handleConsultaNIF = async (nif) => {
    if (nif.length === 9) {
      const resultado = await UtilValidacao.consultarNIF(nif);
      if (resultado.sucesso) {
        setDadosNovoCliente(prev => ({
          ...prev, nif,
          nome: resultado.dados.nome || prev.nome,
          morada: resultado.dados.morada || prev.morada,
          codigo_postal: resultado.dados.codigo_postal || prev.codigo_postal,
          localidade: resultado.dados.localidade || prev.localidade,
          cae: resultado.dados.cae || prev.cae,
          sector_atividade: resultado.dados.atividade || prev.sector_atividade
        }));
        const mensagem = resultado.mensagem || `Empresa encontrada: ${resultado.dados.nome}`;
        mostrarNotificacao('sucesso', mensagem);
      } else {
        mostrarNotificacao('aviso', resultado.erro);
      }
    }
  };

  const resetarFormulario = () => {
    setDadosNovoCliente({
      nome: '', nif: '', cae: '', telefone: '', telemovel: '', email: '', contacto_geral: '',
      morada: '', codigo_postal: '', localidade: '', pais: 'Portugal', estado: 'potencial',
      tipos_servico: [], ambito: [], modalidades: [], volume_negocio_anual: '',
      sector_atividade: '', prazo_pagamento_dias: 30, ativo: true, observacoes: ''
    });
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  if (loading) return <LoadingComponent />;

  return (
    <div>
      {notificacao && (
        <NotificacaoComponent 
          tipo={notificacao.tipo} mensagem={notificacao.mensagem}
          onClose={() => setNotificacao(null)}
        />
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa',
        borderRadius: '8px', border: '1px solid #e9ecef'
      }}>
        <div>
          <h1 style={{margin: 0, color: '#2c3e50'}}>Gestão de Clientes</h1>
          <p style={{margin: '5px 0 0 0', color: '#6c757d'}}>
            Total: {clientesFiltrados.length} cliente(s)
          </p>
        </div>
        <button onClick={() => setModalAdicionar(true)} style={{
          backgroundColor: '#28a745', color: 'white', padding: '12px 24px',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px',
          fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Adicionar Cliente
        </button>
      </div>

      <FiltrosComponent filtros={filtros} onFiltroChange={handleFiltroChange} />

      <div style={{marginBottom: '20px'}}>
        {clientesFiltrados.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa',
            borderRadius: '8px', border: '1px solid #e9ecef', color: '#6c757d'
          }}>
            <div style={{fontSize: '48px', marginBottom: '10px'}}>📭</div>
            <h3 style={{margin: '10px 0'}}>Nenhum cliente encontrado</h3>
            <p>Ajuste os filtros ou adicione um novo cliente.</p>
          </div>
        ) : (
          <ListaClientesComponent 
            clientes={clientesFiltrados}
            onEditarCliente={(cliente) => {
              setClienteEditando(cliente);
              setDadosEdicao({...cliente});
            }}
            onEliminarCliente={handleEliminarCliente}
            clienteExpandido={clienteExpandido}
            onToggleExpansao={(id) => setClienteExpandido(prev => prev === id ? null : id)}
          />
        )}
      </div>

      {modalAdicionar && (
        <ModalAdicionarCliente 
          dadosCliente={dadosNovoCliente} onDadosChange={setDadosNovoCliente}
          onSubmit={handleAdicionarCliente} onClose={() => setModalAdicionar(false)}
          onConsultaNIF={handleConsultaNIF}
        />
      )}

      {clienteEditando && (
        <ModalEditarCliente 
          cliente={clienteEditando} dadosEdicao={dadosEdicao} onDadosChange={setDadosEdicao}
          onSalvar={handleEditarCliente} onClose={() => setClienteEditando(null)}
        />
      )}
    </div>
  );
}

export default ClientesPage;