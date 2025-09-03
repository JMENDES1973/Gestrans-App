// src/supabaseClient.js
// Cliente Supabase com configuração robusta e testes de conexão

import { createClient } from '@supabase/supabase-js';
import { validateConfig, debugConfig, getConfigWithFallback } from './config/environment.js';

// Debug da configuração em modo desenvolvimento
debugConfig();

// Obter configuração validada ou usar fallback
const appConfig = getConfigWithFallback();

// Criar cliente Supabase com configuração robusta
export const supabase = createClient(
  appConfig.supabase.url,
  appConfig.supabase.key,
  {
    auth: {
      persistSession: false, // Para aplicações sem autenticação de usuário
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'gestrans-app/1.0.0'
      }
    }
  }
);

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    // Teste simples de conectividade
    const { data, error, count } = await supabase
      .from('transportadores')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      throw new Error(`Erro na consulta: ${error.message}`);
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    console.log(`📊 Total de transportadores na base de dados: ${count || 'N/A'}`);
    
    return {
      success: true,
      count: count || 0,
      message: 'Conexão estabelecida com sucesso'
    };
    
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    console.error('🔍 Detalhes do erro:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Falha na conexão com a base de dados'
    };
  }
};

// Função para verificar configuração antes de usar o cliente
export const ensureSupabaseConnection = async () => {
  // Validar configuração
  if (!validateConfig()) {
    throw new Error('Configuração de ambiente inválida. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY');
  }
  
  // Testar conexão
  const connectionTest = await testSupabaseConnection();
  
  if (!connectionTest.success) {
    throw new Error(`Falha na conexão com Supabase: ${connectionTest.error}`);
  }
  
  return connectionTest;
};

// Função helper para tratamento de erros do Supabase
export const handleSupabaseError = (error, operation = 'operação') => {
  console.error(`❌ Erro durante ${operation}:`, error);
  
  // Mapear erros comuns para mensagens amigáveis
  const errorMessages = {
    'JWT expired': 'Sessão expirada. Recarregue a página.',
    'Invalid API key': 'Chave de API inválida. Verifique a configuração.',
    'relation does not exist': 'Tabela não encontrada. Verifique a base de dados.',
    'permission denied': 'Permissão negada. Verifique as políticas RLS.',
    'Network request failed': 'Erro de rede. Verifique sua conexão com a internet.'
  };
  
  // Procurar por mensagens de erro conhecidas
  for (const [key, message] of Object.entries(errorMessages)) {
    if (error.message.includes(key)) {
      return {
        type: 'known',
        message,
        originalError: error.message
      };
    }
  }
  
  // Retornar erro genérico para erros desconhecidos
  return {
    type: 'unknown',
    message: `Erro durante ${operation}. Tente novamente.`,
    originalError: error.message
  };
};

// Exportar configuração para uso em outros módulos
export const supabaseConfig = {
  url: appConfig.supabase.url,
  isConfigValid: validateConfig(),
  environment: appConfig.app.env
};

// Inicialização automática em desenvolvimento
if (appConfig.app.debug) {
  console.log('🚀 Inicializando cliente Supabase em modo debug...');
  testSupabaseConnection().then(result => {
    if (!result.success) {
      console.warn('⚠️ Aplicação pode não funcionar corretamente devido a problemas de conexão');
    }
  });
}