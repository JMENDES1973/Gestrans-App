// src/features/clientes/services/clientesService.js
// Este serviço é como ter um especialista em clientes que cuida de todas
// as operações da base de dados de forma organizada e segura

import { supabase } from '../../../supabaseClient';

import { tratarErroSupabase, formatarResposta, validarEmail, validarNIF } from '../../../utils/supabase';

/**
 * Classe ClientesService - o nosso especialista em gestão de clientes
 * 
 * Imaginem este serviço como um assistente pessoal muito organizado
 * que sabe exatamente como lidar com cada situação relacionada com clientes.
 * Ele nunca se esquece de verificar se os dados estão corretos,
 * trata todos os erros de forma elegante, e mantém tudo organizado.
 */
class ClientesService {
  
  /**
   * Obter todos os clientes da base de dados
   * É como pedir ao assistente: "Mostra-me todos os clientes que temos"
   * 
   * @param {Object} filtros - Filtros opcionais para refinar a pesquisa
   * @returns {Promise<Object>} Resultado com lista de clientes ou erro
   */
  async obterClientes(filtros = {}) {
    try {
      // Começamos por criar a consulta base
      // É como dizer: "Vai à base de dados e traz-me todos os clientes ativos"
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('ativo', true) // Só clientes ativos por defeito
        .order('nome'); // Ordenados alfabeticamente

      // Agora aplicamos os filtros se foram fornecidos
      // É como dizer: "Mas só me tragas os que correspondem a estes critérios"
      if (filtros.nome) {
        // Pesquisa parcial no nome (não é case-sensitive)
        query = query.ilike('nome', `%${filtros.nome}%`);
      }
      
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      
      if (filtros.cidade) {
        query = query.ilike('cidade', `%${filtros.cidade}%`);
      }

      if (filtros.nif) {
        query = query.eq('nif', filtros.nif);
      }

      // Executamos a consulta e aguardamos o resultado
      const { data, error } = await query;
      
      // Se houve um erro, tratamos ele de forma elegante
      if (error) {
        return tratarErroSupabase(error, 'obter clientes');
      }

      // Se tudo correu bem, devolvemos os dados num formato consistente
      return formatarResposta(data, `${data.length} cliente(s) encontrado(s)`);
      
    } catch (error) {
      // Se aconteceu algo inesperado, tratamos isso também
      console.error('Erro inesperado ao obter clientes:', error);
      return {
        sucesso: false,
        mensagem: 'Erro inesperado ao carregar clientes. Tente novamente.',
        dados: []
      };
    }
  }

  /**
   * Obter um cliente específico pelo seu ID
   * É como dizer: "Mostra-me os detalhes completos do cliente número X"
   */
  async obterClientePorId(id) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single(); // .single() porque esperamos apenas um resultado
      
      if (error) {
        return tratarErroSupabase(error, 'obter cliente por ID');
      }

      return formatarResposta(data, 'Cliente encontrado');
      
    } catch (error) {
      return {
        sucesso: false,
        mensagem: 'Cliente não encontrado',
        dados: null
      };
    }
  }

  /**
   * Criar um novo cliente na base de dados
   * É como dizer: "Adiciona este novo cliente, mas primeiro verifica se está tudo bem"
   */

// No clientesService.js, função criarCliente modificada
async criarCliente(dadosCliente) {
  try {
    // Validação básica (mantemos porque adiciona valor)
    const validacao = this.validarDadosCliente(dadosCliente, true);
    if (!validacao.valido) {
      return {
        sucesso: false,
        mensagem: validacao.mensagem,
        dados: null
      };
    }

    // Preparar dados compatíveis com a estrutura atual
    // Esta função resolve o problema dos campos numéricos vazios
    const dadosLimpos = this.normalizarDadosParaBaseDados(dadosCliente);

    const { data, error } = await supabase
      .from('clientes')
      .insert([dadosLimpos])
      .select()
      .single();
    
    if (error) {
      return tratarErroSupabase(error, 'criar cliente');
    }

    return formatarResposta(data, 'Cliente criado com sucesso');
    
  } catch (error) {
    console.error('Erro inesperado ao criar cliente:', error);
    return {
      sucesso: false,
      mensagem: 'Erro inesperado ao criar cliente.',
      dados: null
    };
  }
}

normalizarDadosParaBaseDados(dados) {
  // Criar uma cópia profunda dos dados para evitar modificações no original
  const dadosNormalizados = { ...dados };
  
  // Lista expandida de campos que podem causar problemas de tipo numérico
  // Esta lista inclui todos os campos que esperamos que sejam números ou null
  const camposNumericos = [
    'volume_negocio_anual',
    'prazo_pagamento_dias',
    'nif', // Embora seja texto, deve ser tratado como numérico para validação
    'telefone',
    'telemovel',
    'codigo_postal', // Pode ter problemas se vazio
    'cae' // Código de atividade económica pode ser numérico
  ];
  
  // Processar cada campo numérico de forma robusta
  camposNumericos.forEach(campo => {
    if (dadosNormalizados.hasOwnProperty(campo)) {
      const valor = dadosNormalizados[campo];
      
      // Se o valor é uma string vazia, undefined, ou null, definir como null
      if (valor === '' || valor === undefined || valor === null) {
        dadosNormalizados[campo] = null;
      }
      // Se o valor é uma string que representa um número, converter
      else if (typeof valor === 'string' && valor.trim() !== '') {
        // Para campos que devem permanecer como strings (NIF, telefones)
        if (['nif', 'telefone', 'telemovel', 'codigo_postal', 'cae'].includes(campo)) {
          dadosNormalizados[campo] = valor.trim();
        } else {
          // Para campos verdadeiramente numéricos
          const valorNumerico = parseFloat(valor);
          dadosNormalizados[campo] = isNaN(valorNumerico) ? null : valorNumerico;
        }
      }
    }
  });
  
  // Lista de campos que devem ser arrays
  const camposArray = ['tipos_servico', 'ambito', 'modalidades'];
  camposArray.forEach(campo => {
    if (!Array.isArray(dadosNormalizados[campo])) {
      dadosNormalizados[campo] = [];
    }
  });
  
  // Lista de campos de texto que devem ser strings limpas
  const camposTexto = ['nome', 'email', 'contacto_geral', 'morada', 'localidade', 'pais', 'sector_atividade', 'observacoes'];
  camposTexto.forEach(campo => {
    if (dadosNormalizados[campo] && typeof dadosNormalizados[campo] === 'string') {
      dadosNormalizados[campo] = dadosNormalizados[campo].trim();
    } else if (dadosNormalizados[campo] === '') {
      dadosNormalizados[campo] = null;
    }
  });
  
  // Garantir que o estado é válido
  if (!dadosNormalizados.estado || !['potencial', 'cliente', 'inativo'].includes(dadosNormalizados.estado)) {
    dadosNormalizados.estado = 'potencial';
  }
  
  // Os campos de auditoria agora podem ser incluídos
  // (as linhas de delete foram comentadas conforme instruído anteriormente)
  
  return dadosNormalizados;
}

  /**
   * Atualizar dados de um cliente existente
   * É como dizer: "Atualiza as informações deste cliente, mas verifica primeiro se está tudo correto"
   */
  async atualizarCliente(id, dadosAtualizados) {
    try {
     // Logging temporário para diagnóstico
    console.log('🔍 Dados recebidos para atualização:', dadosAtualizados);
    
    const validacao = this.validarDadosCliente(dadosAtualizados, false);
    if (!validacao.valido) {
      return {
        sucesso: false,
        mensagem: validacao.mensagem,
        dados: null
      };
    }

    const dadosLimpos = this.normalizarDadosParaBaseDados(dadosAtualizados);
    
    // Logging dos dados após normalização
    console.log('🧹 Dados após normalização:', dadosLimpos);

      // Preparamos os dados para atualização
      const dadosParaAtualizar = {
        ...dadosAtualizados,
        data_atualizacao: new Date().toISOString() // Marca quando foi atualizado
      };

      const { data, error } = await supabase
        .from('clientes')
        .update(dadosParaAtualizar)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return tratarErroSupabase(error, 'atualizar cliente');
      }

      return formatarResposta(data, 'Cliente atualizado com sucesso');
      
    } catch (error) {
      console.error('Erro inesperado ao atualizar cliente:', error);
      return {
        sucesso: false,
        mensagem: 'Erro inesperado ao atualizar cliente',
        dados: null
      };
    }
  }

  /**
   * Remover um cliente (soft delete - marca como inativo)
   * É como dizer: "Esconde este cliente mas não o apagues completamente"
   * 
   * Usamos soft delete porque é mais seguro - podemos sempre recuperar
   * se foi um erro, e mantemos histórico para auditorias
   */
  async removerCliente(id) {
    try {
      // Primeiro verificamos se o cliente tem cotações ou pedidos associados
      // É como verificar se está seguro remover antes de o fazer
      const temAssociacoes = await this.verificarAssociacoes(id);
      if (temAssociacoes.temAssociacoes) {
        return {
          sucesso: false,
          mensagem: 'Não é possível remover este cliente porque tem cotações ou pedidos associados',
          dados: null
        };
      }

      // Em vez de apagar completamente, marcamos como inativo
      const { data, error } = await supabase
        .from('clientes')
        .update({ 
          ativo: false,
          data_remocao: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return tratarErroSupabase(error, 'remover cliente');
      }

      return formatarResposta(data, 'Cliente removido com sucesso');
      
    } catch (error) {
      console.error('Erro inesperado ao remover cliente:', error);
      return {
        sucesso: false,
        mensagem: 'Erro inesperado ao remover cliente',
        dados: null
      };
    }
  }

  /**
   * Pesquisar cliente pelo NIF
   * É como ter um índice telefónico especializado em NIFs
   */
  // Também no clientesService.js, vamos melhorar esta função
async obterClientePorNIF(nif) {
  try {
    // Simplificamos a consulta para evitar problemas de schema
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('nif', nif)
      .eq('ativo', true);
    
    if (error) {
      // Se a consulta falha, assumimos que não existe em vez de quebrar
      console.warn('Aviso na consulta por NIF:', error);
      return {
        sucesso: true,
        mensagem: 'Cliente não encontrado',
        dados: null
      };
    }

    // Se encontrou resultados, pega o primeiro
    if (data && data.length > 0) {
      return formatarResposta(data[0], 'Cliente encontrado');
    }

    return {
      sucesso: true,
      mensagem: 'Cliente não encontrado',
      dados: null
    };
    
  } catch (error) {
    return {
      sucesso: false,
      mensagem: 'Erro ao pesquisar cliente por NIF',
      dados: null
    };
  }
}

  /**
   * Validar os dados de um cliente antes de inserir ou atualizar
   * É como ter um controlador de qualidade que verifica se tudo está em ordem
   */
  validarDadosCliente(dados, novoCliente = true) {
    const erros = [];

    // Validações obrigatórias para novos clientes
    if (novoCliente) {
      if (!dados.nome || dados.nome.trim().length < 2) {
        erros.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
      }
      
      if (!dados.email) {
        erros.push('Email é obrigatório');
      }
    }

    // Validações que se aplicam sempre (novo cliente ou atualização)
    if (dados.email && !validarEmail(dados.email)) {
      erros.push('Email inválido');
    }
    
    if (dados.nif && !validarNIF(dados.nif)) {
      erros.push('NIF inválido');
    }
    
    if (dados.telefone && dados.telefone.length > 0 && dados.telefone.length < 9) {
      erros.push('Telefone deve ter pelo menos 9 dígitos');
    }

    // Validações específicas do vosso negócio
    if (dados.tipo && !['Empresa', 'Particular'].includes(dados.tipo)) {
      erros.push('Tipo deve ser "Empresa" ou "Particular"');
    }

    return {
      valido: erros.length === 0,
      mensagem: erros.join(', ')
    };
  }

  /**
   * Verificar se o cliente tem associações que impedem a remoção
   * É como verificar se é seguro remover antes de o fazer
   */
  async verificarAssociacoes(clienteId) {
    try {
      // Aqui verificamos nas tabelas relacionadas
      // Adaptm conforme as vossas tabelas reais
      
      // Verificar cotações (se a tabela existir)
      let cotacoes = [];
      try {
        const { data: cotacoesData } = await supabase
          .from('cotacoes')
          .select('id')
          .eq('cliente_id', clienteId)
          .limit(1);
        cotacoes = cotacoesData || [];
      } catch (error) {
        // Se a tabela não existir, ignoramos
        console.log('Tabela cotacoes não existe ou não acessível');
      }

      // Verificar pedidos (se a tabela existir)
      let pedidos = [];
      try {
        const { data: pedidosData } = await supabase
          .from('pedidos')
          .select('id')
          .eq('cliente_id', clienteId)
          .limit(1);
        pedidos = pedidosData || [];
      } catch (error) {
        // Se a tabela não existir, ignoramos
        console.log('Tabela pedidos não existe ou não acessível');
      }

      const temAssociacoes = cotacoes.length > 0 || pedidos.length > 0;

      return {
        temAssociacoes,
        detalhes: {
          cotacoes: cotacoes.length,
          pedidos: pedidos.length
        }
      };
      
    } catch (error) {
      console.warn('Erro ao verificar associações:', error);
      // Em caso de erro, assumimos que tem associações para prevenir eliminações acidentais
      return { temAssociacoes: true };
    }
  }
}

// Exportamos uma instância única do serviço (padrão Singleton)
// É como ter um assistente fixo que está sempre disponível
// e conhece toda a história das operações
export const clientesService = new ClientesService();