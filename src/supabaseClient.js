import { createClient } from '@supabase/supabase-js';
import config, { validateConfig } from './config/environment.js';

// Validar configuração antes de criar cliente
if (!validateConfig()) {
  console.warn('⚠️ Usando configurações de fallback');
}

// Usar configurações ou fallback
const supabaseUrl = config.supabase.url || "https://cwsoghxolapdxfuxkxdo.supabase.co";
const supabaseKey = config.supabase.key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3c29naHhvbGFwZHhmdXhreGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDA4NzIsImV4cCI6MjA3MjMxNjg3Mn0.Xuyg1OaHpS5bnPgjof0HFptdyPwoOPwGGE97TB2LzZ8";

export const supabase = createClient(supabaseUrl, supabaseKey);