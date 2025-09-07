// src/utils/supabase.js
// Este ficheiro é como ter um tradutor especializado em "Supabase para Português"

/**
 * Esta função é como um médico que examina erros do Supabase
 * e dá um diagnóstico claro do que realmente aconteceu.
 * 
 * Imaginemos que o Supabase é como um funcionário muito técnico
 * que só fala em códigos. Esta função traduz esses códigos
 * para mensagens que qualquer pessoa entende.
 */
export const tratarErroSupabase = (error, operacao) => {
  // Primeiro, registamos o erro técnico completo para os developers
  console.error(`Erro na operação ${operacao}:`, error);
  
  // Agora criamos o nosso "dicionário de tradução"
  // É como ter uma lista de todos os códigos de erro possíveis
  // e a sua tradução para português claro
  const mensagensErro = {
    '23505': 'Este registo já existe na base de dados.',
    '23503': 'Não é possível eliminar este registo porque está a ser utilizado.',
    '42P01': 'Tabela não encontrada. Contacte o administrador.',
    'PGRST301': 'Não tem permissões para esta operação.',
    'PGRST116': 'Nenhum registo encontrado com estes critérios.'
  };
  
  // Aqui fazemos a tradução: tentamos encontrar uma mensagem amigável
  // Se não encontrarmos, usamos a mensagem original do erro
  // Se nem isso existir, criamos uma mensagem genérica
  const mensagem = mensagensErro[error.code] || 
                   error.message || 
                   `Erro desconhecido na operação: ${operacao}`;
  
  // Devolvemos sempre a mesma estrutura, como ter um formulário padrão
  // para todos os relatórios de erro
  return {
    sucesso: false,
    mensagem,
    codigoErro: error.code
  };
};

/**
 * Esta função é como ter um formato padrão para todas as boas notícias.
 * Em vez de cada parte da aplicação inventar a sua própria forma
 * de comunicar sucesso, usamos sempre este formato consistente.
 */
export const formatarResposta = (dados, mensagem) => ({
  sucesso: true,
  dados,
  mensagem
});

/**
 * Função auxiliar para validar emails
 * É como ter um especialista em emails que nos diz se um email
 * está bem formatado ou não.
 */
export const validarEmail = (email) => {
  // Esta expressão regular é como ter uma régua muito precisa
  // que mede se um email tem todos os componentes necessários
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Função para validar NIFs portugueses
 * É como ter um contabilista que verifica se um NIF
 * está matematicamente correto segundo as regras portuguesas.
 */
export const validarNIF = (nif) => {
  // Primeiro, limpamos o NIF (removemos espaços, por exemplo)
  const nifLimpo = String(nif).replace(/\s/g, '');
  
  // Verificamos se tem exatamente 9 dígitos
  if (!/^\d{9}$/.test(nifLimpo)) {
    return false;
  }
  
  // Agora aplicamos o algoritmo matemático português para validar o NIF
  // É como resolver uma equação matemática específica
  const digits = nifLimpo.split('').map(Number);
  const checkDigit = digits[8]; // O último dígito é especial
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (9 - i);
  }
  
  const remainder = sum % 11;
  const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return checkDigit === expectedCheckDigit;
};