import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('Supabase config:', { 
  url: supabaseUrl, 
  key: supabaseAnonKey ? '***' : 'undefined' 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
