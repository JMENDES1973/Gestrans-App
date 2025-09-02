import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cwsoghxolapdxfuxkxdo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3c29naHhvbGFwZHhmdXhreGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDA4NzIsImV4cCI6MjA3MjMxNjg3Mn0.Xuyg1OaHpS5bnPgjof0HFptdyPwoOPwGGE97TB2LzZ8'

export const supabase = createClient(supabaseUrl, supabaseKey)