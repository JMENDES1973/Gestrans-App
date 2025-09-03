// src/config/environment.js
// Configuração centralizada de ambiente com fallbacks e validação

const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY,
  },
  app: {
    env: import.meta.env.MODE || 'production',
    debug: import.meta.env.DEV || false,
    version: '1.0.0'
  }
};

// Função de validação de configuração
export const validateConfig = () => {
  const errors = [];
  
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL não encontrada nas variáveis de ambiente');
  } else if (!config.supabase.url.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL deve começar com https://');
  }
  
  if (!config.supabase.key) {
    errors.push('VITE_SUPABASE_KEY não encontrada nas variáveis de ambiente');
  } else if (config.supabase.key.length < 100) {
    errors.push('VITE_SUPABASE_KEY parece ser inválida (muito curta)');
  }
  
  if (errors.length > 0) {
    console.error('❌ Erros de configuração encontrados:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    // Em ambiente de desenvolvimento, mostrar instruções
    if (config.app.debug) {
      console.log('\n📝 Para corrigir:');
      console.log('1. Crie um arquivo .env na raiz do projeto');
      console.log('2. Adicione as variáveis:');
      console.log('   VITE_SUPABASE_URL=sua_url_do_supabase');
      console.log('   VITE_SUPABASE_KEY=sua_chave_do_supabase');
      console.log('3. Reinicie o servidor de desenvolvimento');
    }
    
    return false;
  }
  
  console.log('✅ Configuração de ambiente validada com sucesso');
  console.log(`📊 Ambiente: ${config.app.env}`);
  
  return true;
};

// Função para debug de variáveis (remove dados sensíveis em produção)
export const debugConfig = () => {
  if (!config.app.debug) {
    console.log('Debug mode desabilitado em produção');
    return;
  }
  
  console.log('🔍 Debug da configuração:');
  console.log('URL Supabase:', config.supabase.url ? '✅ Definida' : '❌ Não encontrada');
  console.log('Key Supabase:', config.supabase.key ? '✅ Definida' : '❌ Não encontrada');
  console.log('Ambiente:', config.app.env);
  console.log('Modo debug:', config.app.debug);
};

// Função de fallback para configurações ausentes
export const getConfigWithFallback = () => {
  if (validateConfig()) {
    return config;
  }
  
  // Configurações de fallback para desenvolvimento local
  console.warn('⚠️ Usando configurações de fallback - APENAS PARA DESENVOLVIMENTO');
  
  return {
    supabase: {
      url: 'https://cwsoghxolapdxfuxkxdo.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3c29naHhvbGFwZHhmdXhreGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDA4NzIsImV4cCI6MjA3MjMxNjg3Mn0.Xuyg1OaHpS5bnPgjof0HFptdyPwoOPwGGE97TB2LzZ8'
    },
    app: config.app
  };
};

export default config;