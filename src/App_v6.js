import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  // Estados principais
  const [transportadores, setTransportadores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroTipoServico, setFiltroTipoServico] = useState('Todos');
  const [filtroOrigem, setFiltroOrigem] = useState('Todos');
  const [filtroDestino, setFiltroDestino] = useState('Todos');
  
  // Estados do modal de edição
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});
  
  // Estados do modal de adicionar
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [dadosNovoTransportador, setDadosNovoTransportador] = useState({
    nif: '',
    nome: '',
    tipo: 'Transportador',
    telefone: '',
    telemovel: '',
    email: '',
    contactopessoa: '',
    morada: '',
    codigopostal: '',
    localidade: '',
    pais: 'Portugal',
    ativo: true,
    observacoes: '',
    ambito: [],
    modalidades: [],
    tiposervico: [],
    tipocarga: [],
    zonacobertura: [],
    outraszonas: ''
  });
  
  // Estado das fichas expandidas
  const [fichasExpandidas, setFichasExpandidas] = useState({});

  // Opções para os campos de seleção
  const opcoesAmbito = ['Nacional', 'Internacional'];
  const opcoesModalidades = ['Rodoviário', 'Marítimo', 'Aéreo', 'Ferroviário'];
  const opcoesTipoServico = ['FTL', 'LTL', 'Groupage', 'Expresso', 'Cargas Especiais'];
  const opcoestipocarga = ['Geral', 'Frigorífico', 'Mercadorias Perigosas', 'Conteúdo Seco', 'Líquidos', 'Outros'];
  const opcoesZonaCobertura = ['Portugal', 'Espanha', 'França', 'Alemanha', 'Itália', 'Bélgica', 'Luxemburgo', 'Holanda', 'Reino Unido', 'Irlanda'];

  // Carregar dados da base de dados
  useEffect(() => {
    fetchTransportadores();
  }, []);

  const fetchTransportadores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transportadores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      
      setTransportadores(data || []);
    } catch (error) {
      console.error('Erro ao carregar transportadores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar novo transportador
  const handleAddTransportador = async (novoTransportador) => {
    try {
      const { data, error } = await supabase
        .from('transportadores')
        .insert([novoTransportador])
        .select();
      
      if (error) throw error;
      
      setTransportadores([...transportadores, data[0]]);
      setModalAdicionar(false);
      
      // Resetar formulário
      setDadosNovoTransportador({
        nif: '',
        nome: '',
        tipo: 'Transportador',
        telefone: '',
        telemovel: '',
        email: '',
        contactopessoa: '',
        morada: '',
        codigopostal: '',
        localidade: '',
        pais: 'PORTUGAL',
        ativo: true,
        observacoes: '',
        ambito: [],
        modalidades: [],
        tiposervico: [],
        tipocarga: [],
        zonacobertura: [],
        outraszonas: ''
      });
      
      console.log('Transportador adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar transportador:', error);
    }
  };

  // Função para editar transportador
  const handleEditTransportador = async (id, dadosAtualizados) => {
    try {
      const { data, error } = await supabase
        .from('transportadores')
        .update(dadosAtualizados)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setTransportadores(transportadores.map(t => 
        t.id === id ? data[0] : t
      ));
      
      console.log('Transportador editado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar transportador:', error);
    }
  };

  // Função para eliminar transportador
  const handleDeleteTransportador = async (id) => {
    try {
      const { error } = await supabase
        .from('transportadores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTransportadores(transportadores.filter(t => t.id !== id));
      
      console.log('Transportador eliminado com sucesso!');
    } catch (error) {
      console.error('Erro ao eliminar transportador:', error);
    }
  };

  // Filtrar transportadores
  const transportadoresFiltrados = transportadores.filter(t => {
    if (t.ativo === false) return false;
    if (filtroTipo !== 'Todos' && t.tipo !== filtroTipo) return false;
    if (filtroTipoServico !== 'Todos' && !(t.tiposervico || []).includes(filtroTipoServico)) return false;
    if (filtroOrigem !== 'Todos' && !(t.zonacobertura || []).includes(filtroOrigem)) return false;
    if (filtroDestino !== 'Todos' && !(t.zonacobertura || []).includes(filtroDestino)) return false;
    return true;
  });

  if (loading) {
    return <div style={{textAlign: 'center', padding: '50px'}}>Carregando transportadores...</div>;
  }

  return (
    <div className="App">
      <header>
        <h1>GESTRANS - Sistema de Transportadores</h1>
      </header>
      
      <main>
        <section className="filters">
          <h2>Filtros de Pesquisa</h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px'}}>
            
            <div>
              <label><strong>Tipo:</strong></label>
              <select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{marginLeft: '10px', padding: '5px', width: '120px'}}
              >
                <option>Todos</option>
                <option>Transportador</option>
                <option>Transitário</option>
              </select>
            </div>

            <div>
              <label><strong>Tipo Serviço:</strong></label>
              <select 
                value={filtroTipoServico} 
                onChange={(e) => setFiltroTipoServico(e.target.value)}
                style={{marginLeft: '10px', padding: '5px', width: '120px'}}
              >
                <option value="Todos">Todos</option>
                {opcoesTipoServico.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div>
              <label><strong>Origem:</strong></label>
              <select 
                value={filtroOrigem} 
                onChange={(e) => setFiltroOrigem(e.target.value)}
                style={{marginLeft: '10px', padding: '5px', width: '150px'}}
              >
                <option value="Todos">Todos</option>
                {opcoesZonaCobertura.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div>
              <label><strong>Destino:</strong></label>
              <select 
                value={filtroDestino} 
                onChange={(e) => setFiltroDestino(e.target.value)}
                style={{marginLeft: '10px', padding: '5px', width: '150px'}}
              >
                <option value="Todos">Todos</option>
                {opcoesZonaCobertura.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

          </div>
        </section>
        
        <section className="results">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Lista de Transportadores ({transportadoresFiltrados.length})</h2>
            <button 
              onClick={() => setModalAdicionar(true)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              + Adicionar Transportador
            </button>
          </div>
          
          <div>
            {transportadoresFiltrados.map(t => (
              <div key={t.id} style={{border: '1px solid #ccc', margin: '5px', backgroundColor: '#f8f9fa'}}>
                
                <div style={{padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e9ecef'}}>
                  <div style={{flex: 1, textAlign: 'left'}}>
                    <strong style={{fontSize: '16px', color: '#2c3e50'}}>{t.nome}</strong>
                    <div style={{marginTop: '5px', color: '#666', textAlign: 'left'}}>
                      <span><strong>NIF:</strong> {t.nif}</span> | 
                      <span><strong> Tel:</strong> {t.telefone}</span> | 
                      <span><strong> Email:</strong> {t.email}</span> | 
                      <span><strong> Contacto:</strong> {t.contactopessoa || 'Não definido'}</span> | 
                      <span><strong> Tipo:</strong> {t.tipo}</span>
                    </div>
                  </div>
                      
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                      onClick={() => setFichasExpandidas(prev => ({
                        ...prev,
                        [t.id]: !prev[t.id]
                      }))}
                      style={{backgroundColor: '#17a2b8', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer'}}
                    >
                      {fichasExpandidas[t.id] ? '▲ Recolher' : '▼ Expandir'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setEmpresaEditando(t.id);
                        setDadosEdicao({...t});
                      }}
                      style={{backgroundColor: '#007bff', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer'}}
                    >
                      Editar
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja eliminar ${t.nome}?`)) {
                          handleDeleteTransportador(t.id);
                        }
                      }}
                      style={{backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer'}}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {fichasExpandidas[t.id] && (
                  <div style={{padding: '15px', borderTop: '1px solid #dee2e6', backgroundColor: '#f8f9fa', textAlign: 'left'}}>
                    
                    <div style={{marginBottom: '15px', color: '#666', textAlign: 'left'}}>
                      <span><strong>Morada:</strong> {t.morada || 'Não definida'}</span> | 
                      <span><strong> CP:</strong> {t.codigopostal || 'N/A'}</span> | 
                      <span><strong> Localidade:</strong> {t.localidade || 'N/A'}</span> | 
                      <span><strong> País:</strong> {t.pais || 'N/A'}</span>
                    </div>
                    
                    <div style={{color: '#333', textAlign: 'left'}}>
                      <span><strong>Âmbito:</strong> {(t.ambito || []).join(', ') || 'Não definido'}</span> | 
                      <span><strong> Modalidades:</strong> {(t.modalidades || []).join(', ') || 'Rodoviário'}</span> | 
                      <span><strong> Tipos Serviço:</strong> {(t.tiposervico || []).join(', ') || 'Não definido'}</span> | 
                      <span><strong> Tipos Carga:</strong> {(t.tipocarga || []).join(', ') || 'Não definido'}</span> | 
                      <span><strong> Zona Cobertura:</strong> {(t.zonacobertura || []).join(', ') || 'Não definido'}</span>
                      {t.outraszonas && <span> | <strong> Outros Países:</strong> {t.outraszonas}</span>}
                    </div>
                    
                  </div>
                )}
                
              </div>
            ))}
          </div>
        </section>

        {/* Modal de Edição */}
        {empresaEditando && (
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
              height: '90%',
              borderRadius: '8px',
              padding: '20px',
              overflow: 'auto',
              border: '2px solid #007bff'
            }}>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
                <h2 style={{margin: 0, color: '#007bff'}}>Editar Fornecedor: {dadosEdicao.nome}</h2>
                <button 
                  onClick={() => setEmpresaEditando(null)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>

              <div>
                {/* Dados Básicos */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#007bff', 
                  backgroundColor: '#f0f8ff', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Dados Básicos</h3>
                
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: '150px 2fr 150px 1fr 150px 1fr', 
                  gap: '15px', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  width: '100%'
                }}>
                  <label><strong>Nome da Empresa:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.nome || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, nome: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>NIF:</strong></label>
                  <input 
                    type="text" 
                    maxlength="9" 
                    pattern="[0-9]{9}"
                    value={dadosEdicao.nif || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, nif: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Tipo:</strong></label>
                  <select 
                    value={dadosEdicao.tipo || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, tipo: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  >
                    <option value="Transportador">Transportador</option>
                    <option value="Transitário">Transitário</option>
                  </select>
                </div>
                
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: '150px 0.15fr 150px 0.15fr 150px 0.35fr 150px 0.35fr', 
                  gap: '15px', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  width: '100%'
                }}>
                  <label><strong>Telefone:</strong></label>
                  <input 
                    type="text" 
                    maxlength="12"
                    value={dadosEdicao.telefone || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, telefone: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Telemóvel:</strong></label>
                  <input 
                    type="text" 
                    maxlength="12"
                    value={dadosEdicao.telemovel || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, telemovel: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Contacto:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.contactopessoa || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, contactopessoa: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Email:</strong></label>
                  <input 
                    type="email" 
                    value={dadosEdicao.email || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, email: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                {/* Morada */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#007bff', 
                  backgroundColor: '#e3f2fd', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Morada</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                  <label><strong>Morada:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.morada || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, morada: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr 150px 1fr 150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                  <label><strong>Código Postal:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.codigopostal || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, codigopostal: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Localidade:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.localidade || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, localidade: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>País:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.pais || ''} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, pais: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>
                
                {/* Classificação de Serviços */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#007bff', 
                  backgroundColor: '#e3f2fd', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Classificação de Serviços</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Âmbito:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesAmbito.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosEdicao.ambito || []).includes(opcao)}
                          onChange={(e) => {
                            const newAmbito = e.target.checked
                              ? [...(dadosEdicao.ambito || []), opcao]
                              : (dadosEdicao.ambito || []).filter(item => item !== opcao);
                            setDadosEdicao({ ...dadosEdicao, ambito: newAmbito });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Modalidades:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesModalidades.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosEdicao.modalidades || []).includes(opcao)}
                          onChange={(e) => {
                            const newModalidades = e.target.checked
                              ? [...(dadosEdicao.modalidades || []), opcao]
                              : (dadosEdicao.modalidades || []).filter(item => item !== opcao);
                            setDadosEdicao({ ...dadosEdicao, modalidades: newModalidades });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Tipos de Serviço:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesTipoServico.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosEdicao.tiposervico || []).includes(opcao)}
                          onChange={(e) => {
                            const newTipoServico = e.target.checked
                              ? [...(dadosEdicao.tiposervico || []), opcao]
                              : (dadosEdicao.tiposervico || []).filter(item => item !== opcao);
                            setDadosEdicao({ ...dadosEdicao, tiposervico: newTipoServico });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Tipos de Carga:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoestipocarga.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosEdicao.tipocarga || []).includes(opcao)}
                          onChange={(e) => {
                            const newtipocarga = e.target.checked
                              ? [...(dadosEdicao.tipocarga || []), opcao]
                              : (dadosEdicao.tipocarga || []).filter(item => item !== opcao);
                            setDadosEdicao({ ...dadosEdicao, tipocarga: newtipocarga });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Zona de Cobertura:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesZonaCobertura.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosEdicao.zonacobertura || []).includes(opcao)}
                          onChange={(e) => {
                            const newZonaCobertura = e.target.checked
                              ? [...(dadosEdicao.zonacobertura || []), opcao]
                              : (dadosEdicao.zonacobertura || []).filter(item => item !== opcao);
                            setDadosEdicao({ ...dadosEdicao, zonacobertura: newZonaCobertura });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>
                  
                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                  <label><strong>Outros países:</strong></label>
                  <input 
                    type="text" 
                    value={dadosEdicao.outraszonas || ''}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, outraszonas: e.target.value})}
                    placeholder="Ex: Noruega, Suécia, Dinamarca..."
                    style={{padding: '5px', width: '100%'}}
                  />
                </div>
                
                {/* Estado e Observações */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#007bff', 
                  backgroundColor: '#e3f2fd', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Estado e Observações</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '150px 200px 150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                  <label><strong>Estado:</strong></label>
                  <select 
                    value={dadosEdicao.ativo === false ? 'Inativo' : 'Ativo'} 
                    onChange={(e) => setDadosEdicao({...dadosEdicao, ativo: e.target.value === 'Ativo'})}
                    style={{width: '100%', padding: '5px'}}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                  
                  <label><strong>Observações:</strong></label>
                  <textarea 
                    value={dadosEdicao.observacoes || ''}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, observacoes: e.target.value})}
                    style={{width: '100%', padding: '5px', minHeight: '60px'}}
                    placeholder="Notas internas, observações especiais..."
                  />
                </div>

                <div style={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'white',
                  marginTop: '30px',
                  textAlign: 'center',
                  borderTop: '2px solid #007bff',
                  paddingTop: '20px',
                  paddingBottom: '10px'
                }}>
                  <button 
                    onClick={async () => {
                      // Log para ver o objeto
                      console.log('Dados a serem enviados para a edição:', dadosEdicao);
                      
                      // CORRIGE A CHAMADA: PASSA O ID E OS DADOS
                      await handleEditTransportador(dadosEdicao.id, dadosEdicao);
                      setEmpresaEditando(null);
                    }}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '12px 20px',
                      marginRight: '15px',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    Guardar Alterações
                  </button>
                  <button 
                    onClick={() => setEmpresaEditando(null)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '12px 20px',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Adicionar */}
        {modalAdicionar && (
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
              height: '90%',
              borderRadius: '8px',
              padding: '20px',
              overflow: 'auto',
              border: '2px solid #28a745'
            }}>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
                <h2 style={{margin: 0, color: '#28a745'}}>Adicionar Novo Transportador</h2>
                <button 
                  onClick={() => setModalAdicionar(false)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddTransportador(dadosNovoTransportador);
              }}>
                {/* Dados Básicos */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#28a745', 
                  backgroundColor: '#f0fff0', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Dados Básicos</h3>
                
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: '150px 2fr 150px 1fr 150px 1fr', 
                  gap: '15px', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  width: '100%'
                }}>
                  <label><strong>Nome da Empresa:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.nome || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, nome: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                    required
                  />
                  
                  <label><strong>NIF:</strong></label>
                  <input 
                    type="text" 
                    maxlength="9" 
                    pattern="[0-9]{9}"
                    value={dadosNovoTransportador.nif || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, nif: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                    required
                  />
                  
                  <label><strong>Tipo:</strong></label>
                  <select 
                    value={dadosNovoTransportador.tipo || 'Transportador'} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, tipo: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  >
                    <option value="Transportador">Transportador</option>
                    <option value="Transitário">Transitário</option>
                  </select>
                </div>
                
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: '150px 0.15fr 150px 0.15fr 150px 0.35fr 150px 0.35fr', 
                  gap: '15px', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  width: '100%'
                }}>
                  <label><strong>Telefone:</strong></label>
                  <input 
                    type="text" 
                    maxlength="12"
                    value={dadosNovoTransportador.telefone || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, telefone: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Telemóvel:</strong></label>
                  <input 
                    type="text" 
                    maxlength="12"
                    value={dadosNovoTransportador.telemovel || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, telemovel: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Contacto:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.contactopessoa || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, contactopessoa: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Email:</strong></label>
                  <input 
                    type="email" 
                    value={dadosNovoTransportador.email || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, email: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                {/* Morada */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#28a745', 
                  backgroundColor: '#e8f5e8', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Morada</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                  <label><strong>Morada:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.morada || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, morada: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr 150px 1fr 150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                  <label><strong>Código Postal:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.codigopostal || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, codigopostal: e.target.value})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>Localidade:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.localidade || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, localidade: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                  
                  <label><strong>País:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.pais || ''} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, pais: e.target.value.toUpperCase()})}
                    style={{width: '100%', padding: '5px'}}
                  />
                </div>
                
                {/* Classificação de Serviços */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#28a745', 
                  backgroundColor: '#e8f5e8', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Classificação de Serviços</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Âmbito:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesAmbito.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosNovoTransportador.ambito || []).includes(opcao)}
                          onChange={(e) => {
                            const newAmbito = e.target.checked
                              ? [...(dadosNovoTransportador.ambito || []), opcao]
                              : (dadosNovoTransportador.ambito || []).filter(item => item !== opcao);
                            setDadosNovoTransportador({ ...dadosNovoTransportador, ambito: newAmbito });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Modalidades:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesModalidades.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosNovoTransportador.modalidades || []).includes(opcao)}
                          onChange={(e) => {
                            const newModalidades = e.target.checked
                              ? [...(dadosNovoTransportador.modalidades || []), opcao]
                              : (dadosNovoTransportador.modalidades || []).filter(item => item !== opcao);
                            setDadosNovoTransportador({ ...dadosNovoTransportador, modalidades: newModalidades });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Tipos de Serviço:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesTipoServico.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosNovoTransportador.tiposervico || []).includes(opcao)}
                          onChange={(e) => {
                            const newTipoServico = e.target.checked
                              ? [...(dadosNovoTransportador.tiposervico || []), opcao]
                              : (dadosNovoTransportador.tiposervico || []).filter(item => item !== opcao);
                            setDadosNovoTransportador({ ...dadosNovoTransportador, tiposervico: newTipoServico });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Tipos de Carga:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoestipocarga.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosNovoTransportador.tipocarga || []).includes(opcao)}
                          onChange={(e) => {
                            const newtipocarga = e.target.checked
                              ? [...(dadosNovoTransportador.tipocarga || []), opcao]
                              : (dadosNovoTransportador.tipocarga || []).filter(item => item !== opcao);
                            setDadosNovoTransportador({ ...dadosNovoTransportador, tipocarga: newtipocarga });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'start', marginBottom: '15px'}}>
                  <label><strong>Zona de Cobertura:</strong></label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                    {opcoesZonaCobertura.map(opcao => (
                      <label key={opcao} style={{display: 'flex', alignItems: 'center'}}>
                        <input
                          type="checkbox"
                          checked={(dadosNovoTransportador.zonacobertura || []).includes(opcao)}
                          onChange={(e) => {
                            const newZonaCobertura = e.target.checked
                              ? [...(dadosNovoTransportador.zonacobertura || []), opcao]
                              : (dadosNovoTransportador.zonacobertura || []).filter(item => item !== opcao);
                            setDadosNovoTransportador({ ...dadosNovoTransportador, zonacobertura: newZonaCobertura });
                          }}
                          style={{marginRight: '8px'}}
                        />
                        {opcao}
                      </label>
                    ))}
                  </div>
                </div>
                  
                <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                  <label><strong>Outros países:</strong></label>
                  <input 
                    type="text" 
                    value={dadosNovoTransportador.outraszonas || ''}
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, outraszonas: e.target.value})}
                    placeholder="Ex: Noruega, Suécia, Dinamarca..."
                    style={{padding: '5px', width: '100%'}}
                  />
                </div>
                
                {/* Estado e Observações */}
                <h3 style={{
                  marginBottom: '15px', 
                  color: '#28a745', 
                  backgroundColor: '#e8f5e8', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  margin: '0 0 15px 0'
                }}>Estado e Observações</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '150px 200px 150px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px'}}>
                  <label><strong>Estado:</strong></label>
                  <select 
                    value={dadosNovoTransportador.ativo === false ? 'Inativo' : 'Ativo'} 
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, ativo: e.target.value === 'Ativo'})}
                    style={{width: '100%', padding: '5px'}}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                  
                  <label><strong>Observações:</strong></label>
                  <textarea 
                    value={dadosNovoTransportador.observacoes || ''}
                    onChange={(e) => setDadosNovoTransportador({...dadosNovoTransportador, observacoes: e.target.value})}
                    style={{width: '100%', padding: '5px', minHeight: '60px'}}
                    placeholder="Notas internas, observações especiais..."
                  />
                </div>

                <div style={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'white',
                  marginTop: '30px',
                  textAlign: 'center',
                  borderTop: '2px solid #28a745',
                  paddingTop: '20px',
                  paddingBottom: '10px'
                }}>
                  <button 
                    type="submit"
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '12px 20px',
                      marginRight: '15px',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    Adicionar Transportador
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalAdicionar(false)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '12px 20px',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
      
    </div>
  );
}

export default App;