// src/supabaseClient.js
// Cliente Supabase que automaticamente usa o ambiente correto

import { createClient } from '@supabase/supabase-js';
import currentEnvironment, { validateEnvironment, isDevelopment } from './config/environments.js';

// 🎯 Validar ambiente antes de criar cliente
if (!validateEnvironment()) {
  throw new Error('❌ Falha na configuração do ambiente');
}

// 🎯 Criar cliente com configuração do ambiente atual
export const supabase = createClient(
  currentEnvironment.supabase.url,
  currentEnvironment.supabase.key,
  {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': `gestrans-${currentEnvironment.name.toLowerCase()}/1.0.0`
      }
    }
  }
);

// 🎯 Função para testar conexão
export const testConnection = async () => {
  try {
    console.log(`🔄 Testando conexão com ${currentEnvironment.name}...`);
    
    const { data, error, count } = await supabase
      .from('transportadores')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log(`✅ Conexão com ${currentEnvironment.name} estabelecida`);
    console.log(`📊 Transportadores na base: ${count || 0}`);
    
    return {
      success: true,
      environment: currentEnvironment.name,
      count: count || 0
    };
    
  } catch (error) {
    console.error(`❌ Erro na conexão com ${currentEnvironment.name}:`, error.message);
    return {
      success: false,
      environment: currentEnvironment.name,
      error: error.message
    };
  }
};

// 🎯 Função para inserir dados de teste (só em desenvolvimento)
export const insertTestData = async () => {
  if (!isDevelopment()) {
    console.warn('⚠️ Dados de teste só podem ser inseridos em desenvolvimento');
    return false;
  }
  
  const testTransportadores = [
    {
      nif: '123456789',
      nome: 'TRANSPORTES TESTE LTDA',
      tipo: 'Transportador',
      telefone: '212345678',
      email: 'teste@exemplo.pt',
      contactopessoa: 'João Teste',
      morada: 'RUA DE TESTE, 123',
      localidade: 'LISBOA',
      pais: 'PORTUGAL',
      ambito: ['Nacional'],
      modalidades: ['Rodoviário'],
      tiposervico: ['FTL'],
      tipocarga: ['Geral'],
      zonacobertura: ['Portugal']
    },
    {
      nif: '987654321',
      nome: 'TRANSITÁRIOS EXEMPLO SA',
      tipo: 'Transitário',
      telefone: '219876543',
      email: 'exemplo@teste.pt',
      contactopessoa: 'Maria Exemplo',
      morada: 'AVENIDA EXEMPLO, 456',
      localidade: 'PORTO',
      pais: 'PORTUGAL',
      ambito: ['Internacional'],
      modalidades: ['Marítimo', 'Aéreo'],
      tiposervico: ['LTL', 'Expresso'],
      tipocarga: ['Frigorífico'],
      zonacobertura: ['Portugal', 'Espanha']
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('transportadores')
      .insert(testTransportadores)
      .select();
    
    if (error) throw error;
    
    console.log('✅ Dados de teste inseridos:', data.length, 'transportadores');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados de teste:', error.message);
    return false;
  }
};

// 🎯 Auto-teste em desenvolvimento
if (isDevelopment()) {
  console.log('🧪 Modo desenvolvimento ativo');
  
  // Testar conexão automaticamente
  setTimeout(async () => {
    const result = await testConnection();
    
    if (result.success && result.count === 0) {
      console.log('💡 Base de desenvolvimento vazia. Quer inserir dados de teste?');
      console.log('🔧 Execute: window.insertTestData() no console');
      
      // Disponibilizar função globalmente para debug
      if (typeof window !== 'undefined') {
        window.insertTestData = insertTestData;
      }
    }
  }, 2000);
}

// 🎯 Informações do ambiente para debug
export const environmentInfo = {
  name: currentEnvironment.name,
  isDev: isDevelopment(),
  supabaseUrl: currentEnvironment.supabase.url,
  features: currentEnvironment.features
};