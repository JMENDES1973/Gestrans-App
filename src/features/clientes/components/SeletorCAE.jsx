// src/features/clientes/components/SeletorCAE.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../supabaseClient';

const SeletorCAE = ({ 
  value = '', 
  onChange, 
  onBlur, 
  erro = null, 
  placeholder = "Digite código CAE ou descrição da atividade",
  disabled = false 
}) => {
  // Estados para gestão da funcionalidade de pesquisa
  const [pesquisa, setPesquisa] = useState('');
  const [caeOptions, setCaeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const [caeSelecionado, setCaeSelecionado] = useState(null);
  
  // Ref para gerir cliques fora do componente
  const containerRef = useRef(null);

  // Inicializar o campo com o valor existente
  useEffect(() => {
    if (value && value !== pesquisa) {
      // Se há um valor CAE, buscar a sua descrição para mostrar no campo
      buscarDescricaoCAE(value);
    }
  }, [value]);

  // Função para buscar a descrição de um CAE específico
  const buscarDescricaoCAE = async (codigoCAE) => {
    if (!codigoCAE || codigoCAE.length !== 5) return;
    
    try {
      const { data, error } = await supabase
        .from('codigos_cae')
        .select('codigo, designacao')
        .eq('codigo', codigoCAE)
        .eq('ativo', true)
        .single();

      if (data && !error) {
        setPesquisa(`${data.codigo} - ${data.designacao}`);
        setCaeSelecionado(data);
      } else {
        // Se não encontrar o CAE na base de dados, mostrar apenas o código
        setPesquisa(codigoCAE);
      }
    } catch (err) {
      console.error('Erro ao buscar descrição do CAE:', err);
      setPesquisa(codigoCAE);
    }
  };

  // Função principal de pesquisa de CAE
  const buscarCAE = async (termoPesquisa) => {
    // Só pesquisar se houver pelo menos 2 caracteres
    if (termoPesquisa.length < 2) {
      setCaeOptions([]);
      return;
    }
    
    setLoading(true);
    try {
      // Construir query de pesquisa que procura em código e descrição
      const { data, error } = await supabase
        .from('codigos_cae')
        .select('codigo, designacao, secao, designacao_secao')
        .or(`codigo.ilike.%${termoPesquisa}%,designacao.ilike.%${termoPesquisa}%`)
        .eq('ativo', true)
        .order('codigo')
        .limit(15); // Limitar resultados para performance

      if (error) {
        console.error('Erro na pesquisa de CAE:', error);
        setCaeOptions([]);
      } else {
        setCaeOptions(data || []);
        setMostrarOpcoes(true);
      }
    } catch (err) {
      console.error('Erro ao buscar CAE:', err);
      setCaeOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Gerir mudanças no campo de pesquisa
  const handleInputChange = (e) => {
    const valorInput = e.target.value;
    setPesquisa(valorInput);
    
    // Se o utilizador estiver a escrever, limpar seleção anterior
    if (caeSelecionado) {
      setCaeSelecionado(null);
      onChange(''); // Limpar valor no formulário pai
    }
    
    // Pesquisar com debounce simples
    setTimeout(() => {
      if (valorInput === pesquisa) { // Verificar se ainda é o valor atual
        buscarCAE(valorInput);
      }
    }, 300);
  };

  // Selecionar um CAE da lista
  const selecionarCAE = (cae) => {
    setCaeSelecionado(cae);
    setPesquisa(`${cae.codigo} - ${cae.designacao}`);
    onChange(cae.codigo); // Enviar apenas o código para o formulário pai
    setMostrarOpcoes(false);
    setCaeOptions([]);
  };

  // Gerir perda de foco
  const handleBlur = (e) => {
    // Verificar se o foco foi para um elemento dentro do container
    if (containerRef.current && containerRef.current.contains(e.relatedTarget)) {
      return; // Não fechar se o foco for para uma opção da lista
    }
    
    setTimeout(() => {
      setMostrarOpcoes(false);
    }, 200); // Delay para permitir cliques nas opções
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Gerir cliques fora do componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMostrarOpcoes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Campo de input principal */}
      <input
        type="text"
        value={pesquisa}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => {
          if (caeOptions.length > 0) {
            setMostrarOpcoes(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${erro ? '#dc3545' : '#ced4da'}`,
          borderRadius: '4px',
          fontSize: '14px',
          transition: 'border-color 0.2s ease',
          boxSizing: 'border-box',
          backgroundColor: erro ? '#fff5f5' : (disabled ? '#f8f9fa' : 'white'),
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />

      {/* Indicador de carregamento */}
      {loading && (
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          A pesquisar...
        </div>
      )}

      {/* Lista de opções de CAE */}
      {mostrarOpcoes && caeOptions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflow: 'auto',
          backgroundColor: 'white',
          border: '1px solid #ced4da',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {caeOptions.map((cae, index) => (
            <div
              key={`${cae.codigo}-${index}`}
              onClick={() => selecionarCAE(cae)}
              onMouseDown={(e) => e.preventDefault()} // Prevenir perda de foco
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: index < caeOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontWeight: '600', color: '#495057', marginBottom: '2px' }}>
                {cae.codigo}
              </div>
              <div style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.3' }}>
                {cae.designacao}
              </div>
              {cae.designacao_secao && (
                <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '2px' }}>
                  Secção {cae.secao}: {cae.designacao_secao}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <span style={{
          color: '#dc3545',
          fontSize: '12px',
          marginTop: '4px',
          display: 'block'
        }}>
          {erro}
        </span>
      )}

      {/* Texto de ajuda */}
      <small style={{
        color: '#6c757d',
        fontSize: '12px',
        display: 'block',
        marginTop: '4px'
      }}>
        {caeSelecionado 
          ? `CAE selecionado: ${caeSelecionado.codigo}`
          : 'Digite código CAE (ex: 49410) ou descrição da atividade (ex: transporte)'
        }
      </small>
    </div>
  );
};

export default SeletorCAE;