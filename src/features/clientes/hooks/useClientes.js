// src/features/clientes/hooks/useClientes.js
// Este hook é como ter um assistente pessoal especializado em gestão de clientes
// Ele sabe tudo sobre o estado atual, que operações são possíveis, e como executá-las

import { useState, useEffect, useCallback } from 'react';
import { clientesService } from '../services/clientesService';

/**
 * Hook personalizado para gestão completa de clientes
 * 
 * Pensem neste hook como um assistente pessoal muito competente que:
 * - Conhece sempre o estado atual de todos os clientes
 * - Sabe que operações são possíveis em cada momento
 * - Coordena todas as ações de forma inteligente
 * - Comunica claramente o que está a acontecer
 * - Trata problemas de forma elegante
 * 
 * @param {Object} configuracao - Opções para personalizar o comportamento do hook
 * @returns {Object} Estado completo e todas as operações disponíveis
 */
export const useClientes = (configuracao = {}) => {
  // Extraímos as configurações com valores padrão sensatos
  // É como definir as preferências do nosso assistente pessoal
  const {
    carregarAutomaticamente = true,  // O assistente deve carregar dados automaticamente?
    filtrosIniciais = {},           // Que filtros aplicar logo de início?
    paginacao = false               // Devemos paginar os resultados?
  } = configuracao;

  // Estados principais que definem "o que sabemos neste momento"
  // Pensem nestes estados como a memória do nosso assistente
  const [clientes, setClientes] = useState([]);                    // A lista atual de clientes
  const [carregando, setCarregando] = useState(false);             // Estamos a fazer alguma operação?
  const [erro, setErro] = useState(null);                          // Há algum problema atual?
  const [filtros, setFiltros] = useState(filtrosIniciais);         // Que critérios de pesquisa estão ativos?
  
  // Estados para operações específicas - como ter indicadores luminosos num painel de controlo
  const [operacaoAtual, setOperacaoAtual] = useState(null);        // Que operação específica está a decorrer?
  const [ultimaOperacao, setUltimaOperacao] = useState(null);      // Qual foi a última coisa que fizemos?
  const [estatisticas, setEstatisticas] = useState({              // Informações úteis sobre o estado atual
    total: 0,
    novosHoje: 0,
    modificadosRecentemente: 0
  });

  /**
   * Carregar clientes da base de dados
   * 
   * Esta função é como pedir ao assistente: "Vai buscar a lista mais recente de clientes"
   * O assistente vai à base de dados, aplica os filtros corretos, trata qualquer problema
   * que possa surgir, e atualiza a nossa memória com a informação mais atual
   */
  const carregarClientes = useCallback(async (filtrosPersonalizados = null) => {
    // Informamos que vamos começar uma operação
    setCarregando(true);
    setErro(null);
    setOperacaoAtual('carregar');

    try {
      // Decidimos que filtros usar (os fornecidos agora ou os que estão guardados)
      const filtrosAUsar = filtrosPersonalizados || filtros;
      
      // Pedimos ao nosso serviço especializado para fazer o trabalho técnico
      const resultado = await clientesService.obterClientes(filtrosAUsar);
      
      if (resultado.sucesso) {
        // Se tudo correu bem, atualizamos a nossa memória
        setClientes(resultado.dados);
        
        // Calculamos estatísticas úteis sobre os dados
        const agora = new Date();
        const hoje = agora.toDateString();
        
        const estatisticasCalculadas = {
          total: resultado.dados.length,
          novosHoje: resultado.dados.filter(cliente => 
            cliente.data_criacao && 
            new Date(cliente.data_criacao).toDateString() === hoje
          ).length,
          modificadosRecentemente: resultado.dados.filter(cliente => 
            cliente.data_atualizacao && 
            new Date(cliente.data_atualizacao) > new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
          ).length
        };
        
        setEstatisticas(estatisticasCalculadas);
        
        // Registamos que esta operação foi bem-sucedida
        setUltimaOperacao({
          tipo: 'carregar',
          sucesso: true,
          mensagem: resultado.mensagem,
          timestamp: new Date(),
          detalhes: { filtrosUsados: filtrosAUsar, totalEncontrado: resultado.dados.length }
        });
        
      } else {
        // Se algo correu mal, guardamos a informação do erro para mostrar ao utilizador
        setErro(resultado.mensagem);
        setUltimaOperacao({
          tipo: 'carregar',
          sucesso: false,
          mensagem: resultado.mensagem,
          timestamp: new Date()
        });
      }
      
    } catch (error) {
      // Se aconteceu algo completamente inesperado, tratamos isso também
      const mensagemErro = 'Erro inesperado ao carregar clientes. Verifique a ligação à internet.';
      setErro(mensagemErro);
      setUltimaOperacao({
        tipo: 'carregar',
        sucesso: false,
        mensagem: mensagemErro,
        timestamp: new Date(),
        detalhes: { erroTecnico: error.message }
      });
    } finally {
      // Independentemente do que aconteceu, informamos que a operação terminou
      setCarregando(false);
      setOperacaoAtual(null);
    }
  }, [filtros]); // Este useCallback só se recria se os filtros mudarem

  /**
   * Adicionar um novo cliente
   * 
   * Esta função é como dizer ao assistente: "Adiciona este novo cliente à nossa lista"
   * O assistente vai verificar se os dados estão corretos, adicionar à base de dados,
   * e depois atualizar a nossa lista local para refletir a mudança
   */
  const adicionarCliente = async (dadosCliente) => {
    setOperacaoAtual('adicionar');
    setErro(null);

    try {
      // Pedimos ao serviço para fazer a operação técnica
      const resultado = await clientesService.criarCliente(dadosCliente);
      
      if (resultado.sucesso) {
        // Se funcionou, atualizamos a nossa lista local imediatamente
        // Isto torna a interface mais responsiva - o utilizador vê o resultado imediatamente
        setClientes(clientesAtuais => {
          const novaLista = [...clientesAtuais, resultado.dados];
          // Mantemos a lista ordenada alfabeticamente
          return novaLista.sort((a, b) => a.nome.localeCompare(b.nome));
        });
        
        // Atualizamos as estatísticas
        setEstatisticas(estatisticasAtuais => ({
          ...estatisticasAtuais,
          total: estatisticasAtuais.total + 1,
          novosHoje: estatisticasAtuais.novosHoje + 1
        }));
        
        // Registamos o sucesso
        setUltimaOperacao({
          tipo: 'adicionar',
          sucesso: true,
          mensagem: resultado.mensagem,
          timestamp: new Date(),
          dados: resultado.dados
        });
        
        return { sucesso: true, dados: resultado.dados };
        
      } else {
        // Se houve problemas, informamos o utilizador
        setErro(resultado.mensagem);
        setUltimaOperacao({
          tipo: 'adicionar',
          sucesso: false,
          mensagem: resultado.mensagem,
          timestamp: new Date()
        });
        
        return { sucesso: false, mensagem: resultado.mensagem };
      }
      
    } catch (error) {
      const mensagemErro = 'Erro inesperado ao adicionar cliente';
      setErro(mensagemErro);
      setUltimaOperacao({
        tipo: 'adicionar',
        sucesso: false,
        mensagem: mensagemErro,
        timestamp: new Date()
      });
      
      return { sucesso: false, mensagem: mensagemErro };
      
    } finally {
      setOperacaoAtual(null);
    }
  };

  /**
   * Atualizar um cliente existente
   * 
   * Como dizer ao assistente: "Atualiza as informações deste cliente específico"
   */
  const atualizarCliente = async (id, dadosAtualizados) => {
    setOperacaoAtual('atualizar');
    setErro(null);

    try {
      const resultado = await clientesService.atualizarCliente(id, dadosAtualizados);
      
      if (resultado.sucesso) {
        // Atualizamos o cliente específico na nossa lista local
        setClientes(clientesAtuais => 
          clientesAtuais.map(cliente => 
            cliente.id === id ? resultado.dados : cliente
          )
        );
        
        // Incrementamos o contador de modificações recentes
        setEstatisticas(estatisticasAtuais => ({
          ...estatisticasAtuais,
          modificadosRecentemente: estatisticasAtuais.modificadosRecentemente + 1
        }));
        
        setUltimaOperacao({
          tipo: 'atualizar',
          sucesso: true,
          mensagem: resultado.mensagem,
          timestamp: new Date(),
          dados: resultado.dados
        });
        
        return { sucesso: true, dados: resultado.dados };
        
      } else {
        setErro(resultado.mensagem);
        setUltimaOperacao({
          tipo: 'atualizar',
          sucesso: false,
          mensagem: resultado.mensagem,
          timestamp: new Date()
        });
        
        return { sucesso: false, mensagem: resultado.mensagem };
      }
      
    } catch (error) {
      const mensagemErro = 'Erro inesperado ao atualizar cliente';
      setErro(mensagemErro);
      return { sucesso: false, mensagem: mensagemErro };
      
    } finally {
      setOperacaoAtual(null);
    }
  };

  /**
   * Remover um cliente (marcá-lo como inativo)
   * 
   * Como pedir ao assistente: "Remove este cliente da lista ativa"
   * (mas mantém o histórico para auditoria)
   */
  const removerCliente = async (id) => {
    setOperacaoAtual('remover');
    setErro(null);

    try {
      const resultado = await clientesService.removerCliente(id);
      
      if (resultado.sucesso) {
        // Removemos o cliente da nossa lista local
        setClientes(clientesAtuais => 
          clientesAtuais.filter(cliente => cliente.id !== id)
        );
        
        // Atualizamos as estatísticas
        setEstatisticas(estatisticasAtuais => ({
          ...estatisticasAtuais,
          total: estatisticasAtuais.total - 1
        }));
        
        setUltimaOperacao({
          tipo: 'remover',
          sucesso: true,
          mensagem: resultado.mensagem,
          timestamp: new Date(),
          dadosRemovidos: { id }
        });
        
        return { sucesso: true };
        
      } else {
        setErro(resultado.mensagem);
        setUltimaOperacao({
          tipo: 'remover',
          sucesso: false,
          mensagem: resultado.mensagem,
          timestamp: new Date()
        });
        
        return { sucesso: false, mensagem: resultado.mensagem };
      }
      
    } catch (error) {
      const mensagemErro = 'Erro inesperado ao remover cliente';
      setErro(mensagemErro);
      return { sucesso: false, mensagem: mensagemErro };
      
    } finally {
      setOperacaoAtual(null);
    }
  };

  /**
   * Aplicar novos filtros à lista de clientes
   * 
   * Como dizer ao assistente: "Mostra-me apenas os clientes que correspondem a estes critérios"
   */
  const aplicarFiltros = useCallback((novosFiltros) => {
    setFiltros(filtrosAtuais => {
      const filtrosCombinados = { ...filtrosAtuais, ...novosFiltros };
      return filtrosCombinados;
    });
  }, []);

  /**
   * Limpar todos os filtros
   * 
   * Como pedir: "Mostra-me todos os clientes, sem restrições"
   */
  const limparFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  /**
   * Pesquisar cliente por NIF específico
   * 
   * Como perguntar: "Temos algum cliente com este NIF específico?"
   */
  const pesquisarPorNIF = async (nif) => {
    if (!nif || nif.trim().length === 0) {
      setErro('NIF é obrigatório para pesquisa');
      return null;
    }

    setOperacaoAtual('pesquisar');
    setErro(null);

    try {
      const resultado = await clientesService.obterClientePorNIF(nif);
      
      setUltimaOperacao({
        tipo: 'pesquisar',
        sucesso: resultado.sucesso,
        mensagem: resultado.mensagem,
        timestamp: new Date(),
        detalhes: { nifPesquisado: nif }
      });
      
      return resultado.dados;
      
    } catch (error) {
      const mensagemErro = 'Erro inesperado ao pesquisar cliente';
      setErro(mensagemErro);
      return null;
      
    } finally {
      setOperacaoAtual(null);
    }
  };

  // Funções utilitárias para tornar o hook mais conveniente de usar
  const limparErro = useCallback(() => setErro(null), []);
  const obterClientePorId = useCallback((id) => {
    return clientes.find(cliente => cliente.id === id) || null;
  }, [clientes]);

  // Estados computados - informações derivadas que são úteis para a interface
  const temClientes = clientes.length > 0;
  const estaOcupado = carregando || operacaoAtual !== null;
  const temFiltrosAtivos = Object.keys(filtros).length > 0;

  // Carregar clientes automaticamente quando o hook é inicializado (se configurado para tal)
  useEffect(() => {
    if (carregarAutomaticamente) {
      carregarClientes();
    }
  }, [carregarAutomaticamente, carregarClientes]);

  // Recarregar clientes sempre que os filtros mudarem
  useEffect(() => {
    if (carregarAutomaticamente) {
      carregarClientes();
    }
  }, [filtros, carregarAutomaticamente, carregarClientes]);

  // Interface pública do hook - tudo o que o componente pode usar
  return {
    // Estado atual
    clientes,
    carregando,
    erro,
    filtros,
    estatisticas,
    operacaoAtual,
    ultimaOperacao,
    
    // Estados computados úteis
    temClientes,
    estaOcupado,
    temFiltrosAtivos,
    totalClientes: clientes.length,
    
    // Operações principais
    carregarClientes,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    pesquisarPorNIF,
    
    // Gestão de filtros
    aplicarFiltros,
    limparFiltros,
    
    // Utilitários
    limparErro,
    obterClientePorId
  };
};