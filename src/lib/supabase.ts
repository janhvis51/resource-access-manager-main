
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Replace these with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create the Supabase client with error handling
let supabase;
try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Create a dummy client for fallback
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: () => ({ data: null, error: new Error('Supabase not configured') }),
      single: () => ({ data: null, error: new Error('Supabase not configured') })
    })
  };
}

export { supabase };

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  try {
    return (
      supabaseUrl !== 'https://your-project-url.supabase.co' && 
      supabaseAnonKey !== 'your-anon-key' &&
      typeof supabase.from === 'function'
    );
  } catch (error) {
    console.error('Error checking Supabase configuration:', error);
    return false;
  }
};
