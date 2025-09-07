// src/config/environments.js
// Sistema inteligente de configuração de ambientes

// 🎯 Configurações para cada ambiente
const environments = {
  // 🟢 AMBIENTE DE DESENVOLVIMENTO
  development: {
    name: 'Desenvolvimento',
    supabase: {
      url: 'https://ygnwkfzuaiewpqwhjlhw.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbndrZnp1YWlld3Bxd2hqbGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTAzNzEsImV4cCI6MjA3MjQ4NjM3MX0.yxXG5C9ySWP-nkX8vq3ZYWaWPBecRs69Hxx-HfUpDS4'
    },
    ui: {
      headerColor: '#28a745',      // Verde
      headerBg: '#d4edda',         // Verde claro
      borderColor: '#c3e6cb',
      badge: '🟢 DESENVOLVIMENTO',
      subtitle: '⚠️ DADOS DE TESTE - EXPERIMENTE À VONTADE!',
      icon: '🧪'
    },
    features: {
      showDebugInfo: true,
      allowDataReset: true,
      showTestData: true
    }
  },
  
  // 🔴 AMBIENTE DE PRODUÇÃO
  production: {
    name: 'Produção',
    supabase: {
      url: 'https://cwsoghxolapdxfuxkxdo.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3c29naHhvbGFwZHhmdXhreGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDA4NzIsImV4cCI6MjA3MjMxNjg3Mn0.Xuyg1OaHpS5bnPgjof0HFptdyPwoOPwGGE97TB2LzZ8'
    },
    ui: {
      headerColor: '#dc3545',      // Vermelho
      headerBg: '#f8d7da',         // Vermelho claro
      borderColor: '#f5c6cb',
      badge: '🔴 PRODUÇÃO',
      subtitle: '✅ DADOS REAIS - SISTEMA OFICIAL',
      icon: '🏢'
    },
    features: {
      showDebugInfo: false,
      allowDataReset: false,
      showTestData: false
    }
  }
};

// 🎯 Função inteligente: detecta ambiente automaticamente
const getCurrentEnvironment = () => {
  // 1. Verificar variável de ambiente explícita
  if (process.env.REACT_APP_ENVIRONMENT) {
    return process.env.REACT_APP_ENVIRONMENT;
  }
  
  
  // 3. Verificar pela URL (se estiver no browser)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // URLs de desenvolvimento
    if (hostname.includes('localhost') || 
        hostname.includes('127.0.0.1') ||
        hostname.includes('gestrans-dev')) {
      return 'development';
    }
    
    // URLs de produção
    if (hostname.includes('gestrans-app') ||
        hostname.includes('gestrans.netlify')) {
      return 'production';
    }
  }
  
  // 4. Default para desenvolvimento (mais seguro)
  return 'development';
};

// 🎯 Obter configuração do ambiente atual
const currentEnv = getCurrentEnvironment();
export const currentEnvironment = environments[currentEnv];

// 🎯 Função para validar configuração
export const validateEnvironment = () => {
  const config = currentEnvironment;
  
  if (!config) {
    console.error('❌ Ambiente não reconhecido:', currentEnv);
    return false;
  }
  
  if (!config.supabase.url || !config.supabase.key) {
    console.error('❌ Credenciais do Supabase incompletas para ambiente:', currentEnv);
    return false;
  }
  
  // Log do ambiente atual
  console.log(`🎯 Ambiente ativo: ${config.name}`);
  console.log(`🌐 Supabase URL: ${config.supabase.url}`);
  console.log(`🎨 Tema: ${config.ui.badge}`);
  
  if (config.features.showDebugInfo) {
    console.log('🔧 Debug habilitado - Informações detalhadas disponíveis');
  }
  
  return true;
};

// 🎯 Funções utilitárias
export const isDevelopment = () => currentEnv === 'development';
export const isProduction = () => currentEnv === 'production';

// 🎯 Função para trocar ambiente manualmente (útil para testes)
export const switchEnvironment = (envName) => {
  if (environments[envName]) {
    console.log(`🔄 Alternando para ambiente: ${envName}`);
    // Esta função seria mais útil numa versão mais avançada
    return environments[envName];
  } else {
    console.error('❌ Ambiente não existe:', envName);
    return currentEnvironment;
  }
};

// 🎯 Export da configuração atual
export default currentEnvironment;