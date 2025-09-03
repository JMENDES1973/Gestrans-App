// Configuração de ambiente para Create React App
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_KEY,
  },
  app: {
    env: process.env.NODE_ENV || 'production',
    debug: process.env.NODE_ENV === 'development'
  }
};

// Validação de configuração
export const validateConfig = () => {
  const errors = [];
  
  if (!config.supabase.url) {
    errors.push('REACT_APP_SUPABASE_URL não encontrada');
  }
  
  if (!config.supabase.key) {
    errors.push('REACT_APP_SUPABASE_KEY não encontrada');
  }
  
  if (errors.length > 0) {
    console.error('❌ Erros de configuração:', errors);
    return false;
  }
  
  console.log('✅ Configuração validada com sucesso');
  return true;
};

export default config;