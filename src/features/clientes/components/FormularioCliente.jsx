// src/features/clientes/components/FormularioCliente.jsx
import React, { useState, useEffect } from "react";
import SeletorCAE from "./SeletorCAE";

const FormularioCliente = ({ cliente, onSalvar, onCancelar }) => {
  // Estado do formulário completamente alinhado com a estrutura final da tabela clientes
  const [formData, setFormData] = useState({
    // Campos obrigatórios da tabela
    nome: "",
    nif: "",
    tipo_cliente: "empresa", // Valor padrão: 'particular' ou 'empresa'
    
    // Campos de contacto
    telefone: "",
    telemovel: "",
    email: "",
    contacto_geral: "", // Campo de texto livre para informações de contacto gerais
    
    // Campos de endereço
    morada: "",
    codigo_postal: "",
    localidade: "",
    pais: "Portugal", // Valor padrão da tabela
    distrito: "",
    
    // Identificação e atividade (campos específicos do negócio)
    pais_id: "PT", // País do NIF para validação específica
    cae: "", // Código de Atividade Económica
    
    // Estado simplificado - apenas ativo/inativo
    ativo: true, // Boolean - sistema simplificado conforme migração
    
    // Observações
    observacoes: "",
    
    // Campos JSONB para seleções múltiplas (funcionalidades avançadas)
    tipos_servico: [], // Array para tipos de serviço oferecidos
    ambito: [], // Array para âmbito geográfico
    modalidades: [] // Array para modalidades de transporte
  });

  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);

  // Carregar dados do cliente para edição - alinhado com estrutura real da tabela
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || "",
        nif: cliente.nif || "",
        tipo_cliente: cliente.tipo_cliente || "empresa",
        telefone: cliente.telefone || "",
        telemovel: cliente.telemovel || "",
        email: cliente.email || "",
        contacto_geral: cliente.contacto_geral || "",
        morada: cliente.morada || "",
        codigo_postal: cliente.codigo_postal || "",
        localidade: cliente.localidade || "",
        pais: cliente.pais || "Portugal",
        distrito: cliente.distrito || "",
        pais_id: cliente.pais_id || "PT",
        cae: cliente.cae || "",
        
        // Sistema simplificado - apenas boolean ativo
        ativo: cliente.ativo !== false,
        
        observacoes: cliente.observacoes || "",
        
        // Campos JSONB - garantir que são arrays válidos
        tipos_servico: Array.isArray(cliente.tipos_servico) ? cliente.tipos_servico : [],
        ambito: Array.isArray(cliente.ambito) ? cliente.ambito : [],
        modalidades: Array.isArray(cliente.modalidades) ? cliente.modalidades : []
      });
    }
  }, [cliente]);

  // Validações melhoradas alinhadas com a estrutura da base de dados
  const validarCampo = (nome, valor) => {
    switch (nome) {
      case 'nome':
        if (!valor.trim()) return 'Nome é obrigatório';
        if (valor.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        return null;
      
      case 'nif':
        if (!valor) return 'NIF é obrigatório';
        const nifLimpo = valor.replace(/\D/g, '');
        if (formData.pais_id === 'PT') {
          if (nifLimpo.length !== 9) return 'NIF português deve ter 9 dígitos';
        } else {
          if (nifLimpo.length < 3) return 'Número de identificação deve ter pelo menos 3 dígitos';
        }
        return null;
      
      case 'tipo_cliente':
        const tiposValidos = ['particular', 'empresa'];
        if (!tiposValidos.includes(valor)) return 'Tipo de cliente inválido';
        return null;
      
      case 'email':
        if (!valor) return null; // Email é opcional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) return 'Email inválido';
        return null;
      
      case 'telefone':
      case 'telemovel':
        if (!valor) return null; // Campos opcionais
        const telefoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!telefoneRegex.test(valor)) return 'Formato de telefone inválido';
        return null;
      
      case 'codigo_postal':
        if (!valor) return null; // Opcional
        if (formData.pais === 'Portugal') {
          if (!/^\d{4}-\d{3}$/.test(valor)) return 'Formato português deve ser XXXX-XXX';
        }
        return null;
      
      case 'cae':
        if (!valor) return null; // CAE é opcional
        const caeLimpo = valor.replace(/\D/g, '');
        if (caeLimpo.length !== 5) return 'CAE deve ter 5 dígitos';
        return null;

      default:
        return null;
    }
  };

  // Função de mudança de campos com formatação automática inteligente
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let novoValor = type === 'checkbox' ? checked : value;
    
    // Formatação automática específica por campo para melhorar experiência do utilizador
    if (name === 'nome') {
      // Converter nome para maiúsculas para consistência
      novoValor = value.toUpperCase();
    } else if (name === 'email') {
      // Converter email para minúsculas para evitar problemas de case
      novoValor = value.toLowerCase();
    } else if (name === 'nif') {
      // Formatação de NIF baseada no país selecionado
      if (formData.pais_id === 'PT') {
        novoValor = value.replace(/\D/g, '').slice(0, 9);
      } else {
        novoValor = value.slice(0, 20); // Flexibilidade para NIFs estrangeiros
      }
    } else if (name === 'cae') {
      // CAE deve ter apenas 5 dígitos
      novoValor = value.replace(/\D/g, '').slice(0, 5);
    } else if (name === 'codigo_postal') {
      // Formatação automática de código postal português
      if (formData.pais === 'Portugal') {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 4) {
          novoValor = digits;
        } else {
          novoValor = `${digits.slice(0, 4)}-${digits.slice(4, 7)}`;
        }
      } else {
        novoValor = value; // Permitir formatos livres para outros países
      }
    }
    
    // Atualizar estado do formulário
    setFormData(prev => ({ ...prev, [name]: novoValor }));
    
    // Validação em tempo real para feedback imediato
    const erro = validarCampo(name, novoValor);
    setErros(prev => {
      const novosErros = { ...prev };
      if (erro) {
        novosErros[name] = erro;
      } else {
        delete novosErros[name];
      }
      return novosErros;
    });
  };

  // Gestão de seleções múltiplas para campos JSONB (funcionalidade futura)
  const handleArrayChange = (campo, valor, checked) => {
    setFormData(prev => {
      const arrayAtual = prev[campo] || [];
      let novoArray;
      
      if (checked) {
        novoArray = [...arrayAtual, valor];
      } else {
        novoArray = arrayAtual.filter(item => item !== valor);
      }
      
      return { ...prev, [campo]: novoArray };
    });
  };

  // Submissão do formulário com validação completa
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação completa antes de submeter
    const novosErros = {};
    Object.keys(formData).forEach(campo => {
      const erro = validarCampo(campo, formData[campo]);
      if (erro) novosErros[campo] = erro;
    });
    
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para envio, garantindo compatibilidade com estrutura da tabela
      const dadosParaEnvio = {
        ...formData,
        // Garantir que campos obrigatórios estão presentes e formatados
        nome: formData.nome.trim().toUpperCase(),
        nif: formData.nif.replace(/\D/g, ''),
        email: formData.email ? formData.email.toLowerCase() : null,
        // Campos JSONB mantidos como arrays
        tipos_servico: formData.tipos_servico,
        ambito: formData.ambito,
        modalidades: formData.modalidades
      };
      
      await onSalvar(dadosParaEnvio);
    } catch (error) {
      setErros({ submit: 'Erro ao salvar cliente. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para renderizar campos padronizados com estilo consistente
  const renderCampo = (nome, label, tipo = 'text', obrigatorio = false, placeholder = '') => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        marginBottom: '4px',
        fontWeight: '500',
        color: '#495057',
        fontSize: '14px'
      }}>
        {label}
        {obrigatorio && <span style={{ color: '#dc3545' }}> *</span>}
      </label>
      <input
        type={tipo}
        name={nome}
        value={formData[nome] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${erros[nome] ? '#dc3545' : '#ced4da'}`,
          borderRadius: '4px',
          fontSize: '14px',
          transition: 'border-color 0.2s ease',
          boxSizing: 'border-box',
          backgroundColor: erros[nome] ? '#fff5f5' : 'white'
        }}
        onFocus={(e) => {
          if (!erros[nome]) e.target.style.borderColor = '#007bff';
        }}
        onBlur={(e) => {
          if (!erros[nome]) e.target.style.borderColor = '#ced4da';
        }}
      />
      {erros[nome] && (
        <span style={{
          color: '#dc3545',
          fontSize: '12px',
          marginTop: '4px',
          display: 'block'
        }}>
          {erros[nome]}
        </span>
      )}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90%',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Cabeçalho do modal com design profissional */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{
            margin: 0,
            color: '#212529',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
        </div>

        {/* Conteúdo principal do formulário com scroll */}
        <form onSubmit={handleSubmit} style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Seção 1: Identificação Principal */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              Identificação do Cliente
            </h3>
            
            {/* Tipo de Cliente - escolha fundamental que afeta outras validações */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Tipo de Cliente *
              </label>
              <select
                name="tipo_cliente"
                value={formData.tipo_cliente}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${erros.tipo_cliente ? '#dc3545' : '#ced4da'}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="empresa">Empresa</option>
                <option value="particular">Particular</option>
              </select>
              {erros.tipo_cliente && (
                <span style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  {erros.tipo_cliente}
                </span>
              )}
            </div>
            
            {/* País e NIF - validação inteligente baseada no país */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500',
                  color: '#495057',
                  fontSize: '14px'
                }}>
                  País *
                </label>
                <select
                  name="pais_id"
                  value={formData.pais_id}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    border: `1px solid ${erros.pais_id ? '#dc3545' : '#ced4da'}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="PT">PT</option>
                  <option value="ES">ES</option>
                  <option value="FR">FR</option>
                  <option value="DE">DE</option>
                  <option value="IT">IT</option>
                  <option value="UK">UK</option>
                  <option value="NL">NL</option>
                  <option value="BE">BE</option>
                  <option value="LU">LU</option>
                  <option value="CH">CH</option>
                  <option value="AT">AT</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
              
              <div>
                {renderCampo('nif', 'NIF/Número de Identificação Fiscal', 'text', true, 
                  formData.pais_id === 'PT' ? 'Ex: 123456789' : 'Número de identificação do país selecionado')}
              </div>
            </div>
            
            {/* Nome - campo obrigatório com formatação automática */}
            {renderCampo('nome', 'Nome da Empresa/Cliente', 'text', true, 'Ex: EMPRESA EXEMPLO LDA')}
            
            {/* CAE - apenas para empresas, usando o SeletorCAE quando disponível */}
            {formData.tipo_cliente === 'empresa' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500',
                  color: '#495057',
                  fontSize: '14px'
                }}>
                  CAE - Código de Atividade Económica
                </label>
                {/* 
                  Nota: O SeletorCAE pode ser usado aqui quando a tabela codigos_cae estiver implementada.
                  Por agora, usamos um campo simples que aceita códigos CAE de 5 dígitos.
                */}
                <input
                  type="text"
                  name="cae"
                  value={formData.cae || ''}
                  onChange={handleChange}
                  placeholder="12345"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${erros.cae ? '#dc3545' : '#ced4da'}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    backgroundColor: erros.cae ? '#fff5f5' : 'white'
                  }}
                  onFocus={(e) => {
                    if (!erros.cae) e.target.style.borderColor = '#007bff';
                  }}
                  onBlur={(e) => {
                    if (!erros.cae) e.target.style.borderColor = '#ced4da';
                  }}
                />
                {erros.cae && (
                  <span style={{
                    color: '#dc3545',
                    fontSize: '12px',
                    marginTop: '4px',
                    display: 'block'
                  }}>
                    {erros.cae}
                  </span>
                )}
                <small style={{
                  color: '#6c757d',
                  fontSize: '12px',
                  display: 'block',
                  marginTop: '4px'
                }}>
                  Código oficial de 5 dígitos da atividade principal da empresa
                </small>
              </div>
            )}
          </div>

          {/* Seção 2: Contactos */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              Contactos
            </h3>
            
            {renderCampo('email', 'Email', 'email', false, 'exemplo@empresa.pt')}
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {renderCampo('telefone', 'Telefone Fixo', 'tel', false, '+351 22 123 4567')}
              {renderCampo('telemovel', 'Telemóvel', 'tel', false, '+351 912 345 678')}
            </div>
            
            {/* Campo contacto_geral - texto livre para informações específicas */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Contacto Geral
              </label>
              <textarea
                name="contacto_geral"
                value={formData.contacto_geral}
                onChange={handleChange}
                rows={3}
                placeholder="Informações gerais de contacto, horários, responsáveis..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Seção 3: Morada */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              Morada
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {renderCampo('morada', 'Morada', 'text', false, 'Rua da Empresa, nº 123')}
              {renderCampo('codigo_postal', 'Código Postal', 'text', false, '4470-123')}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '16px'
            }}>
              {renderCampo('localidade', 'Localidade', 'text', false, 'Maia')}
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500',
                  color: '#495057',
                  fontSize: '14px'
                }}>
                  Distrito
                </label>
                <select
                  name="distrito"
                  value={formData.distrito}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="Porto">Porto</option>
                  <option value="Lisboa">Lisboa</option>
                  <option value="Braga">Braga</option>
                  <option value="Aveiro">Aveiro</option>
                  <option value="Coimbra">Coimbra</option>
                  <option value="Leiria">Leiria</option>
                  <option value="Santarém">Santarém</option>
                  <option value="Setúbal">Setúbal</option>
                  <option value="Faro">Faro</option>
                  <option value="Évora">Évora</option>
                  <option value="Beja">Beja</option>
                  <option value="Castelo Branco">Castelo Branco</option>
                  <option value="Guarda">Guarda</option>
                  <option value="Portalegre">Portalegre</option>
                  <option value="Viana do Castelo">Viana do Castelo</option>
                  <option value="Vila Real">Vila Real</option>
                  <option value="Bragança">Bragança</option>
                  <option value="Viseu">Viseu</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500',
                  color: '#495057',
                  fontSize: '14px'
                }}>
                  País da Morada
                </label>
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Portugal">Portugal</option>
                  <option value="Espanha">Espanha</option>
                  <option value="França">França</option>
                  <option value="Alemanha">Alemanha</option>
                  <option value="Itália">Itália</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 4: Informações Logísticas - Necessidades e Características Operacionais */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              Perfil Logístico do Cliente
            </h3>
            
            {/* Tipos de Serviços Necessários */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Tipos de Serviços Necessários
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                {['FTL (Carga Completa)', 'LTL (Carga Parcial)', 'Groupage', 'Expresso/Urgente', 'Distribuição Local', 'Transporte Dedicado'].map(servico => (
                  <label key={servico} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tipos_servico.includes(servico)}
                      onChange={(e) => handleArrayChange('tipos_servico', servico, e.target.checked)}
                      style={{ transform: 'scale(1.1)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#495057' }}>{servico}</span>
                  </label>
                ))}
              </div>
              <small style={{
                color: '#6c757d',
                fontSize: '12px',
                display: 'block',
                marginTop: '6px'
              }}>
                Selecione os tipos de serviços de transporte que este cliente necessita regularmente
              </small>
            </div>

            {/* Âmbito Geográfico de Atuação */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Mercados/Âmbito Geográfico
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                {['Nacional (Portugal)', 'Península Ibérica', 'Europa Ocidental', 'Europa Central', 'Europa de Leste', 'Reino Unido', 'Países Nórdicos', 'Intercontinental'].map(ambito => (
                  <label key={ambito} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.ambito.includes(ambito)}
                      onChange={(e) => handleArrayChange('ambito', ambito, e.target.checked)}
                      style={{ transform: 'scale(1.1)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#495057' }}>{ambito}</span>
                  </label>
                ))}
              </div>
              <small style={{
                color: '#6c757d',
                fontSize: '12px',
                display: 'block',
                marginTop: '6px'
              }}>
                Indique os mercados geográficos onde o cliente tem necessidades de transporte
              </small>
            </div>

            {/* Modalidades de Transporte */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Modalidades de Transporte
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                {['Rodoviário', 'Marítimo', 'Aéreo', 'Ferroviário', 'Multimodal'].map(modalidade => (
                  <label key={modalidade} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.modalidades.includes(modalidade)}
                      onChange={(e) => handleArrayChange('modalidades', modalidade, e.target.checked)}
                      style={{ transform: 'scale(1.1)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#495057' }}>{modalidade}</span>
                  </label>
                ))}
              </div>
              <small style={{
                color: '#6c757d',
                fontSize: '12px',
                display: 'block',
                marginTop: '6px'
              }}>
                Modalidades de transporte que o cliente utiliza ou está interessado em utilizar
              </small>
            </div>

            {/* Resumo Visual das Seleções */}
            <div style={{
              padding: '12px',
              backgroundColor: '#e7f3ff',
              borderRadius: '6px',
              border: '1px solid #b8daff'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#004085' }}>
                Resumo do Perfil Logístico:
              </h4>
              <div style={{ fontSize: '13px', color: '#004085', lineHeight: '1.4' }}>
                {formData.tipos_servico.length > 0 && (
                  <div><strong>Serviços:</strong> {formData.tipos_servico.join(', ')}</div>
                )}
                {formData.ambito.length > 0 && (
                  <div><strong>Mercados:</strong> {formData.ambito.join(', ')}</div>
                )}
                {formData.modalidades.length > 0 && (
                  <div><strong>Modalidades:</strong> {formData.modalidades.join(', ')}</div>
                )}
                {formData.tipos_servico.length === 0 && formData.ambito.length === 0 && formData.modalidades.length === 0 && (
                  <div style={{ fontStyle: 'italic', color: '#6c757d' }}>
                    Nenhuma característica logística selecionada
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 5: Informações Adicionais - simplificada com sistema ativo/inativo */}
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '18px',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              Informações Adicionais
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                placeholder="Notas adicionais sobre o cliente..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            {/* Sistema simplificado ativo/inativo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                style={{ 
                  transform: 'scale(1.3)',
                  accentColor: '#28a745'
                }}
              />
              <div style={{ flex: 1 }}>
                <label style={{
                  fontWeight: '500',
                  color: '#495057',
                  fontSize: '14px',
                  display: 'block',
                  cursor: 'pointer'
                }}
                onClick={() => handleChange({
                  target: { name: 'ativo', type: 'checkbox', checked: !formData.ativo }
                })}
                >
                  Cliente Ativo
                </label>
                <small style={{
                  color: '#6c757d',
                  fontSize: '12px'
                }}>
                  {formData.ativo 
                    ? 'Cliente disponível para novas operações comerciais' 
                    : 'Cliente inativo - não disponível para novas operações'
                  }
                </small>
              </div>
            </div>
          </div>

          {/* Mensagem de erro geral */}
          {erros.submit && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              {erros.submit}
            </div>
          )}
        </form>

        {/* Rodapé com botões de ação */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#5a6268';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#6c757d';
            }}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#218838';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#28a745';
            }}
          >
            {loading ? 'Salvando...' : (cliente ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioCliente;