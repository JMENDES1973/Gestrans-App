// src/features/clientes/components/FormularioCliente.jsx
import React, { useState, useEffect } from "react";

const FormularioCliente = ({ cliente, onSalvar, onCancelar }) => {
  // Estado do formulário expandido com todos os campos necessários
  const [formData, setFormData] = useState({
    pais_id: "PT",
    nif: "",
    nome: "",
    cae: "",
    morada: "",
    codigo_postal: "",
    localidade: "",
    pais: "",
    email: "",
    telefone: "",
    telemovel: "",
    contacto_geral: "",
    estado: "prospeto",
    tipos_servico: [], // Array para seleções múltiplas
    ambito: [], // Array para países de atuação
    modalidades: [], // Array para modalidades de transporte
    observacoes: "",
    ativo: true
  });

  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);

  // useEffect corrigido para incluir todos os novos campos
  useEffect(() => {
    if (cliente) {
      setFormData({
        pais_id: cliente.pais_id || "PT",
        nome: cliente.nome || "",
        nif: cliente.nif || "",
        cae: cliente.cae || "",
        morada: cliente.morada || "",
        codigo_postal: cliente.codigo_postal || "",
        localidade: cliente.localidade || "",
        pais: cliente.pais || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        telemovel: cliente.telemovel || "",
        contacto_geral: cliente.contacto_geral || "",
        estado: cliente.estado || "prospeto",
        tipos_servico: cliente.tipos_servico || [],
        ambito: cliente.ambito || [],
        modalidades: cliente.modalidades || [],
        observacoes: cliente.observacoes || "",
        ativo: cliente.ativo !== false
      });
   }
  }, [cliente]);

  // Função de validação expandida com todos os novos campos
  const validarCampo = (nome, valor) => {
    switch (nome) {
      case 'pais_id':
        if (!valor) return 'País do NIF é obrigatório';
        return null;

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
      
      case 'email':
        if (!valor) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) return 'Email inválido';
        return null;
      
      case 'telefone':
        if (!valor) return null;
        const telefoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!telefoneRegex.test(valor)) return 'Telefone inválido';
        return null;
      
      case 'telemovel':
        if (!valor) return null;
        const telemovelRegex = /^[\d\s\-\+\(\)]+$/;
        if (!telemovelRegex.test(valor)) return 'Telemóvel inválido';
        return null;
      
      case 'codigopostal':
        if (!valor) return null;
        if (formData.pais === 'Portugal') {
          if (!/^\d{4}-\d{3}$/.test(valor)) return 'Formato português deve ser XXXX-XXX';
        }
        return null;
      
      case 'cae':
        if (!valor) return null; // CAE é opcional mas recomendado
        const caeLimpo = valor.replace(/\D/g, '');
        if (caeLimpo.length !== 5) return 'CAE deve ter 5 dígitos';
        return null;

      case 'estado':
        const estadosValidos = ['prospeto', 'ativo', 'inativo'];
        if (!estadosValidos.includes(valor)) return 'Estado inválido';
        return null;

      case 'tipos_servico':
        if (!valor || valor.length === 0) return 'Selecione pelo menos um tipo de serviço';
        return null;

      case 'ambito':
        if (!valor || valor.length === 0) return 'Selecione pelo menos um país de atuação';
        return null;

      case 'modalidades':
        if (!valor || valor.length === 0) return 'Selecione pelo menos uma modalidade';
        return null;
         
      default:
        return null;
    }
  };

  // Função handleChange melhorada com formatação inteligente
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let novoValor = type === 'checkbox' ? checked : value;
    
    // Formatação automática baseada no campo e contexto
    if (name === 'nome') {
      novoValor = value.toUpperCase();
    } else if (name === 'email') {
      novoValor = value.toLowerCase();
    } else if (name === 'nif') {
      if (formData.pais_id === 'PT') {
        novoValor = value.replace(/\D/g, '').slice(0, 9);
      } else {
        novoValor = value.slice(0, 20); // Permite mais flexibilidade para NIFs estrangeiros
      }
    } else if (name === 'cae') {
      novoValor = value.replace(/\D/g, '').slice(0, 5);
    } else if (name === 'codigopostal') {
      if (formData.pais === 'Portugal') {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 4) {
          novoValor = digits;
        } else {
          novoValor = `${digits.slice(0, 4)}-${digits.slice(4, 7)}`;
        }
      } else {
        novoValor = value; // Permite formatos livres para outros países
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: novoValor }));
    
    // Validação em tempo real
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      await onSalvar(formData);
    } catch (error) {
      setErros({ submit: 'Erro ao salvar cliente. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Função para gerir seleções múltiplas em campos JSONB
const handleArrayChange = (campo, valor, checked) => {
  setFormData(prev => {
    const arrayAtual = prev[campo] || [];
    let novoArray;
    
    if (checked) {
      novoArray = [...arrayAtual, valor];
    } else {
      novoArray = arrayAtual.filter(item => item !== valor);
    }
    
    // Validar o novo array
    const erro = validarCampo(campo, novoArray);
    setErros(prevErros => {
      const novosErros = { ...prevErros };
      if (erro) {
        novosErros[campo] = erro;
      } else {
        delete novosErros[campo];
      }
      return novosErros;
    });
    
    return { ...prev, [campo]: novoArray };
  });
};

  // Função auxiliar para renderizar campos padronizados
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
        {/* Cabeçalho */}
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

        {/* Conteúdo do formulário */}
        <form onSubmit={handleSubmit} style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Secção 1: Identificação */}
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
            
            {/* Linha 1: País + NIF */}
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
                {erros.pais_id && (
                  <span style={{
                    color: '#dc3545',
                    fontSize: '11px',
                    marginTop: '2px',
                    display: 'block'
                  }}>
                    {erros.pais_id}
                  </span>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                {renderCampo('nif', 'NIF/Número de Identificação Fiscal', 'text', true, 
                  formData.pais_id === 'PT' ? 'Ex: 123456789' : 'Número de identificação do país selecionado')}
              </div>
            </div>
            
            {/* Linha 2: Nome */}
            {renderCampo('nome', 'Nome da Empresa/Cliente', 'text', true, 'Ex: EMPRESA EXEMPLO LDA')}
            
            {/* Linha 3: CAE + Tipo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '12px'
            }}>
              <div>
                {renderCampo('cae', 'CAE', 'text', false, '12345')}
              </div>
              
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
                  name="tipo"
                  value={formData.tipo}
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
                  <option value="Empresa">Empresa</option>
                  <option value="Particular">Particular</option>
                  <option value="Transportador">Transportador</option>
                  <option value="Transitário">Transitário</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secção 2: Contactos */}
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
          </div>

          {/* Secção 3: Morada */}
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
              {renderCampo('codigopostal', 'Código Postal', 'text', false, '4470-123')}
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

          {/* Secção 4: Observações */}
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
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                style={{ transform: 'scale(1.2)' }}
              />
              <label style={{
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Cliente Ativo
              </label>
            </div>
          </div>

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

        {/* Rodapé */}
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
              opacity: loading ? 0.6 : 1
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
              transition: 'background-color 0.2s ease'
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

